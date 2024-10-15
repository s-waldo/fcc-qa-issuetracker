const mongoose = require('mongoose');

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

  module.exports = HelpTicket