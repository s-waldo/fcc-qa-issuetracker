const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const HelpTicket = require("../models/ticket");

chai.use(chaiHttp);

describe("Functional Tests", function () {
  const path = "/api/issues/apitest";
  let testDoc;
  this.beforeEach(async () => {
    testDoc = await HelpTicket.create({
      project: "apitest",
      issue_title: "TESTDATA",
      issue_text: "TESTTEXT",
      created_by: "CHAI_TESTING",
    });
  });

  this.afterEach(async () => {
    await HelpTicket.deleteOne({ _id: testDoc._id });
  });

  this.afterAll(async () => {
    await HelpTicket.deleteMany({ project: 'apitest', issue_title: 'AutomatedTest'})
  })

  it("Create issue with all fields", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post(path)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        issue_title: "AutomatedTest",
        issue_text: "Test Text",
        created_by: "Automation",
        assigned_to: "EMPL123",
        status_text: "TEST_RESULT_STATUS",
      })
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.status, 200);
        assert.isOk(res.body);
        done();
      });
  });

  it("Create issue with required fields", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post(path)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        issue_title: "AutomatedTest",
        issue_text: "Test Text",
        created_by: "Automation",
        assigned_to: "",
        status_text: "",
      })
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.status, 200);
        assert.isOk(res.body);
        done();
      });
  });

  it("Create issue with missing required fields", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post(path)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        issue_title: "",
        issue_text: "",
        created_by: "",
        assigned_to: "",
        status_text: "",
      })
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });

  it("View issues for project", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get(path)
      .end((err, res) => {
        if (err) return done(err);
        assert.isArray(res.body);
        done();
      });
  });

  it("View issues for project with ONE filter", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get(path + "?issue_title=TESTDATA")
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(200, res.status);
        assert.isArray(res.body);
        done();
      });
  });

  it("View issues for project with SEVERAL filters", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get(path + "?issue_title=TESTDATA&open=true")
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(200, res.status);
        assert.isArray(res.body);
        done();
      });
  });

  it("Update one field on an issue", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put(path)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: testDoc.id,
        issue_text: `Updated`,
      })
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(200, res.status);
        assert.equal(res.body.result, "successfully updated");
        done();
      });
  });

  it("Update multiple fields on an issue", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put(path)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: testDoc.id,
        issue_text: `Updated`,
        created_by: "Update Test",
      })
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(200, res.status);
        assert.equal(res.body.result, "successfully updated");
        done();
      });
  });

  it("Update issue with missing _id", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put(path)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: "",
        created_by: "Update Test",
      })
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(200, res.status);
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });

  it("Update issue with no fields updated", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put(path)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: testDoc.id,
      })
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(200, res.status);
        assert.equal(res.body.error, "no update field(s) sent");
        done();
      });
  });

  it("Update issue with an invalid _id", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put(path)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: "17",
        created_by: "Update Test",
      })
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(200, res.status);
        assert.equal(res.body.error, "could not update");
        done();
      });
  });

  it("Delete an issue", (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete(path)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: testDoc.id,
      })
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.result, "successfully deleted");
        done();
      });
  });

  it("Delete with an invalid _id", (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete(path)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: "17",
      })
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.error, "could not delete");
        done();
      });
  });

  it("Delete with a missing _id", (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete(path)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: "",
      })
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
});
