"use strict";
const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema({
  project: String,
  issue_title: {
    type: String,
    required: true,
  },
  issue_text: {
    type: String,
    required: true,
  },
  created_on: {
    type: Date,
    default: Date.now,
  },
  updated_on: {
    type: Date,
    default: Date.now,
  },
  created_by: String,
  assigned_to: String,
  open: {
    type: Boolean,
    default: true,
  },
  status_text: String,
});

const HelpTicket = mongoose.model("IssueTracker", IssueSchema);

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(async function (req, res) {
      let project = req.params.project;
      let query = { project: project };
      if (Object.keys(req.query) > 0) {
        query = { ...query, ...req.query };
      }
      const docs = await HelpTicket.find(query);
      res.json(docs);
    })

    .post(async (req, res) => {
      let project = req.params.project;
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
      await HelpTicket.findOneAndUpdate(
        {
          project: project,
          _id: req.body._id,
        },
        { $set: newDoc }
      );
      res.json({ result: "successfully updated", _id: req.body._id });
    })

    .delete(async function (req, res) {
      let project = req.params.project;
      try {
        await HelpTicket.findOneAndDelete({
          project: project,
          _id: req.body._id,
        });
        res.json({ result: "successfully deleted", _id: req.body._id });
      } catch (error) {
        res.json({ result: "Error deleting.  Try again." });
      }
    });
};
