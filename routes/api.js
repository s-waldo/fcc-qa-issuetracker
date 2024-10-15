"use strict";
const { error } = require("console");
const mongoose = require("mongoose");
const HelpTicket = require('../models/ticket')


module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(async function (req, res) {
      let project = req.params.project;
      let query = { project: project };
      if (req.query) {
        query = { ...query, ...req.query };
      }
      const docs = await HelpTicket.find(query);
      res.json(docs);
    })

    .post(async (req, res) => {
      let project = req.params.project;
      if (
        !req.body.issue_title ||
        !req.body.issue_text ||
        !req.body.created_by
      ) {
        res.json({ error: "required field(s) missing" });
        return;
      }
      const helpTicket = new HelpTicket({
        project: project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
      });
      const newTicket = await helpTicket.save();
      res.json({
        _id: newTicket.id,
        issue_title: newTicket.issue_title,
        issue_text: newTicket.issue_text,
        created_on: newTicket.created_on,
        updated_on: newTicket.updated_on,
        created_by: newTicket.created_by,
        assigned_to: newTicket.assigned_to,
        open: newTicket.open,
        status_text: newTicket.status_text,
      });
    })

    .put(async function (req, res) {
      let project = req.params.project;
      const body = req.body;
      let newDoc = { updated_on: new Date() };
      // verify all information needed is present
      if (!body._id) {
        res.json({ error: "missing _id" });
        return;
      }
      if (
        !body.issue_text &&
        !body.issue_title &&
        !body.created_by &&
        !body.assigned_to &&
        !body.open
      ) {
        res.json({ error: "no update field(s) sent", _id: body._id });
        return;
      }
      // only change updated fields to preserve data
      if (body.issue_title) {
        newDoc.issue_title = body.issue_title;
      }
      if (body.issue_text) {
        newDoc.issue_text = body.issue_text;
      }
      if (body.created_by) {
        newDoc.created_by = body.created_by;
      }
      if (body.assigned_to) {
        newDoc.assigned_to = body.assigned_to;
      }
      if (body.status_text) {
        newDoc.status_text = body.status_text;
      }
      if (body.open) {
        newDoc.open = body.open;
      }
      try {
        const verify = await HelpTicket.findOneAndUpdate(
          {
            project: project,
            _id: req.body._id,
          },
          { $set: newDoc }
        );
        if (!verify) {
          res.json({ error: "could not update", _id: req.body._id });
          return
        }
        res.json({ result: "successfully updated", _id: req.body._id });
      } catch (error) {
        res.json({ error: "could not update", _id: req.body._id });
      }
    })

    .delete(async function (req, res) {
      let project = req.params.project;
      if (!req.body._id) {
        res.json({ error: "missing _id" });
        return;
      }
      try {
        const verify = await HelpTicket.findOneAndDelete({
          project: project,
          _id: req.body._id,
        });
        if (!verify) {
          res.json({ error: "could not delete", _id: req.body._id });
          return;
        }
        res.json({ result: "successfully deleted", _id: req.body._id });
      } catch (error) {
        res.json({ error: "could not delete", _id: req.body._id });
      }
    });
};
