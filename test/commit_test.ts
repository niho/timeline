import * as chai from "chai";
import * as _ from "lodash";
import * as commit from "../src/commit";

chai.should();

describe("Commit", () => {
  const date = new Date(Date.UTC(2017, 7, 5, 12, 17, 0));

  describe("createCommit()", () => {
    it("should create a new initial commit (no parent)", () => {
      const c = commit.createCommit(123, "closed", date, {}, null, null, null);
      c.should.be.a("object");
      c.id.should.equal("5541f7fc382498856a3174ca30aa74f3cb07ff8d");
      chai.should().equal(c.parent, null);
      c.timeline.should.equal(123);
      c.event.should.equal("closed");
      c.timestamp.should.equal(date);
      c.payload.should.deep.equal({});
    });

    it("should create a commit with a parent", () => {
      const c = commit.createCommit(
        123,
        "closed",
        date,
        {},
        "5541f7fc382498856a3174ca30aa74f3cb07ff8d",
        null,
        null
      );
      c.should.be.a("object");
      c.id.should.equal("1e0b41bdf62a6e43ec4aeaec6a1daf9e0e107fab");
      chai.should().equal(c.parent, "5541f7fc382498856a3174ca30aa74f3cb07ff8d");
      c.timeline.should.equal(123);
      c.event.should.equal("closed");
      c.timestamp.should.equal(date);
      c.payload.should.deep.equal({});
    });

    it("should create a commit with a thread", () => {
      const c = commit.createCommit(
        123,
        "closed",
        date,
        {},
        null,
        "51624f25229fa184baf259c6949001419ee233e5",
        null
      );
      c.should.be.a("object");
      c.id.should.equal("73e0e07f5394fbc280679b8285bf6eb57a4ac439");
      chai.should().equal(c.thread, "51624f25229fa184baf259c6949001419ee233e5");
    });

    it("should not allow a commit without a timestamp", () => {
      chai.should().throw(() => {
        commit.createCommit(123, "closed", {} as Date, {}, null, null, null);
      }, Error);
    });

    it("should not allow a commit without an event type", () => {
      chai.should().throw(() => {
        commit.createCommit(123, "", date, {}, null, null, null);
      }, Error);
    });

    it("should not allow a commit without a timeline id", () => {
      chai.should().throw(() => {
        commit.createCommit(-1, "closed", date, {}, null, null, null);
      }, Error);
    });

    it("should not allow a commit without a payload", () => {
      chai.should().throw(() => {
        commit.createCommit(123, "closed", date, undefined, null, null, null);
      }, Error);
    });

    it("should store the timestamp in UTC timezone", () => {
      const date1 = new Date("Feb 28 2013 19:00:00 EST");
      const date2 = new Date("Feb 28 2013 19:00:00 GMT-0500");
      const c1 = commit.createCommit(
        123,
        "closed",
        date1,
        {},
        null,
        null,
        null
      );
      const c2 = commit.createCommit(
        123,
        "closed",
        date2,
        {},
        null,
        null,
        null
      );
      c1.id.should.equal(c2.id);
    });
  });

  describe("verifyCommit()", () => {
    const c = commit.createCommit(123, "closed", date, {}, null, null, null);

    it("should return true if the commit hash is correct", () => {
      commit.verifyCommit(c).should.equal(true);
    });

    it("should verify that the timeline id has not been tampered with", () => {
      commit
        .verifyCommit(
          _.defaults(
            {
              timeline: 42
            },
            c
          )
        )
        .should.equal(false);
    });

    it("should verify that the event type has not been tampered with", () => {
      commit
        .verifyCommit(
          _.defaults(
            {
              event: "wrong"
            },
            c
          )
        )
        .should.equal(false);
    });

    it("should verify that the timestamp has not been tampered with", () => {
      commit
        .verifyCommit(
          _.defaults(
            {
              timestamp: new Date()
            },
            c
          )
        )
        .should.equal(false);
    });

    it("should verify that the payload has not been tampered with", () => {
      commit
        .verifyCommit(
          _.defaults(
            {
              payload: "true"
            },
            c
          )
        )
        .should.equal(false);
    });
  });
});
