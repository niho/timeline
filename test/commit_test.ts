import * as chai from "chai";
import * as _ from "lodash";
import * as commit from "../src/commit";

chai.should();

describe("Commit", () => {
  const date = new Date(Date.UTC(2017, 7, 5, 12, 17, 0));

  describe("createCommit()", () => {
    it("should create a new initial commit (no parent)", () => {
      const c = commit.createCommit(
        "123",
        "closed",
        date,
        {},
        null,
        null,
        null
      );
      c.should.be.a("object");
      c.id.should.equal("4307fd83d30bc0c182d39aa0b992e3aa1fb97a93");
      chai.should().equal(c.parent, null);
      c.timeline.should.equal("123");
      c.event.should.equal("closed");
      c.timestamp.should.equal(date.getTime());
      c.payload.should.deep.equal({});
    });

    it("should create a commit with a parent", () => {
      const c = commit.createCommit(
        "123",
        "closed",
        date,
        {},
        "4307fd83d30bc0c182d39aa0b992e3aa1fb97a93",
        null,
        null
      );
      c.should.be.a("object");
      c.id.should.equal("18604c2eea9b3fb11598cf45ab46fc26cf33388f");
      chai.should().equal(c.parent, "4307fd83d30bc0c182d39aa0b992e3aa1fb97a93");
      c.timeline.should.equal("123");
      c.event.should.equal("closed");
      c.timestamp.should.equal(date.getTime());
      c.payload.should.deep.equal({});
    });

    it("should create a commit with a thread", () => {
      const c = commit.createCommit(
        "123",
        "closed",
        date,
        {},
        null,
        "4307fd83d30bc0c182d39aa0b992e3aa1fb97a93",
        null
      );
      c.should.be.a("object");
      c.id.should.equal("bd26b4ea148d82a44c31ce405da3aff47fb16721");
      chai.should().equal(c.thread, "4307fd83d30bc0c182d39aa0b992e3aa1fb97a93");
    });

    it("should not allow a commit without a timestamp", () => {
      chai.should().throw(() => {
        commit.createCommit("123", "closed", {} as Date, {}, null, null, null);
      }, Error);
    });

    it("should not allow a commit without an event type", () => {
      chai.should().throw(() => {
        commit.createCommit("123", "", date, {}, null, null, null);
      }, Error);
    });

    it("should not allow a commit without a timeline id", () => {
      chai.should().throw(() => {
        commit.createCommit("", "closed", date, {}, null, null, null);
      }, Error);
    });

    it("should not allow a commit without a payload", () => {
      chai.should().throw(() => {
        commit.createCommit("123", "closed", date, undefined, null, null, null);
      }, Error);
    });

    it("should not allow a commit without a parent", () => {
      chai.should().throw(() => {
        commit.createCommit(
          "123",
          "closed",
          date,
          undefined,
          undefined as any,
          null,
          null
        );
      }, Error);
    });

    it("should not allow a commit without a thread", () => {
      chai.should().throw(() => {
        commit.createCommit(
          "123",
          "closed",
          date,
          undefined,
          null,
          undefined as any,
          null
        );
      }, Error);
    });

    it("should not allow a commit without a author", () => {
      chai.should().throw(() => {
        commit.createCommit(
          "123",
          "closed",
          date,
          undefined,
          null,
          null,
          undefined as any
        );
      }, Error);
    });

    it("should store the timestamp in UTC timezone", () => {
      const date1 = new Date("Feb 28 2013 19:00:00 EST");
      const date2 = new Date("Feb 28 2013 19:00:00 GMT-0500");
      const c1 = commit.createCommit(
        "123",
        "closed",
        date1,
        {},
        null,
        null,
        null
      );
      const c2 = commit.createCommit(
        "123",
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
    const c = commit.createCommit("123", "closed", date, {}, null, null, null);

    it("should return true if the commit hash is correct", () => {
      commit.verifyCommit(c).should.equal(true);
    });

    it("should verify that the timeline id has not been tampered with", () => {
      commit
        .verifyCommit(
          _.defaults(
            {
              timeline: "42"
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
