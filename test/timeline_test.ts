// tslint:disable:max-file-line-count

import * as Promise from "bluebird";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as changelog from "../src/changelog";
import { Event } from "../src/event";
import { timeline } from "../src/timeline";

chai.should();
chai.use(chaiAsPromised);

const event = (name: string, payload: any, thread: string | null = null) => ({
  event: name,
  payload,
  thread
});

describe("Timeline", () => {
  describe("commit()", () => {
    it("should commit events to the changelog", () =>
      timeline("1", [])
        .commit(null, [
          event("rejected", { reason: "..." }),
          event("closed", null)
        ])
        .then(commits => {
          commits.length.should.equal(2);
          chai.should().equal(commits[0].parent, null);
          chai.should().equal(commits[1].parent, commits[0].id);
          chai.should().not.equal(commits[1].parent, null);
        }));

    it("should squash any sequence of identical events", () =>
      timeline("1", [])
        .commit(null, [
          event("closed", null),
          event("rejected", { reason: "..." }),
          event("rejected", { reason: "..." }),
          event("rejected", null)
        ])
        .then(commits => {
          commits.length.should.equal(3);
        }));

    it("should not commit event if it is identical with HEAD", () =>
      timeline(
        "1",
        changelog.commits("1", [event("rejected", { reason: "..." })], [], null)
      )
        .commit(null, [event("rejected", { reason: "..." })])
        .then(commits => {
          commits.length.should.equal(0);
        }));

    it("should return the the new commits", () =>
      timeline("1", changelog.commits("1", [event("question", null)], [], null))
        .commit(null, [event("answer", {}), event("closed", null)])
        .then(commits => {
          commits.length.should.equal(2);
          commits[0].event.should.equal("answer");
          commits[1].event.should.equal("closed");
        }));

    describe("transactions", () => {
      it("should give identical timestamps to commits in transaction", () =>
        timeline("1", [])
          .commit(null, [event("answer", {}), event("closed", null)])
          .then(commits => {
            commits[0].timestamp.should.be.approximately(
              commits[1].timestamp,
              10
            );
          }));

      it("should preserve the logical order of commits in transaction", () =>
        timeline("1", [])
          .commit(null, [event("answer", {}), event("closed", null)])
          .then(commits => {
            commits[0].event.should.equal("answer");
            commits[1].event.should.equal("closed");
          }));

      it("should chain commits in a transaction", () =>
        timeline("1", [])
          .commit(null, [
            event("rejected", { reason: "..." }),
            event("closed", null),
            event("reopened", null)
          ])
          .then(commits => {
            commits.length.should.equal(3);
            chai.should().equal(commits[0].parent, null);
            chai.should().equal(commits[1].parent, commits[0].id);
            chai.should().equal(commits[2].parent, commits[1].id);
          }));
    });

    describe("threads", () => {
      it("should commit event with thread", () =>
        timeline("1", [])
          .commit(null, event("rejected", null, "test"))
          .then(commits => {
            commits.length.should.equal(1);
            chai.should().equal(commits[0].thread, "test");
          }));
    });

    describe("mallformed events", () => {
      it("should not commit event if it is not wellformed", () =>
        timeline("1", [])
          .commit(null, {} as Event)
          .should.be.rejectedWith(Error));

      it("should not commit event if it is missing event name", () =>
        timeline("1", [])
          .commit(null, { payload: {} } as Event)
          .should.be.rejectedWith(Error));

      it("should not commit event if it is missing payload", () =>
        timeline("1", [])
          .commit(null, { event: "rejected" } as Event)
          .should.be.rejectedWith(Error));
    });
  });

  describe("validate()", () => {
    it("should validate events before they are comitted", () =>
      timeline("1", [])
        .validate((_event, _payload) => Promise.resolve())
        .commit(null, [
          event("rejected", { reason: "..." }),
          event("closed", null)
        ]));

    it("should *not* reject events if validation resolves with false", () =>
      timeline("1", [])
        .validate((_event, _payload) => Promise.resolve(false))
        .commit(null, [
          event("rejected", { reason: "..." }),
          event("closed", null)
        ]));

    it("should reject events if validation is rejected with error", () =>
      timeline("1", [])
        .validate((_event, _payload) => {
          return Promise.reject(new Error("TestError"));
        })
        .commit(null, [
          event("rejected", { reason: "..." }),
          event("closed", null)
        ])
        .should.be.rejectedWith(Error, "TestError"));

    it("should propagate errors thrown during validation", () =>
      timeline("1", [])
        .validate((_event, _payload) => {
          throw new Error("TestError");
        })
        .commit(null, [
          event("rejected", { reason: "..." }),
          event("closed", null)
        ])
        .should.be.rejectedWith(Error, "TestError"));

    it("should validate all events individually", () =>
      timeline("1", [])
        .validate((_event, payload) => {
          if (_event === "closed" && payload === null) {
            return Promise.reject("ValidationError");
          } else {
            return Promise.resolve();
          }
        })
        .commit(null, [
          event("rejected", { reason: "..." }),
          event("closed", null)
        ])
        .should.be.rejectedWith("ValidationError"));

    it("should be able to validate asynchronously", () =>
      timeline("1", [])
        .validate((_event, _payload) =>
          Promise.resolve("TestError").then(result => {
            throw new Error(result);
          })
        )
        .commit(null, [
          event("rejected", { reason: "..." }),
          event("closed", null)
        ])
        .should.be.rejectedWith(Error, "TestError"));

    it("should pass the event history to the validator", () =>
      timeline(
        "1",
        changelog.commits(
          "1",
          [event("rejected", { reason: "..." }), event("closed", {})],
          [],
          null
        )
      )
        .validate((_event, _payload, history) => {
          history.should.be.a("array");
          if (_event === "reopened") {
            history.length.should.equal(2);
            history[0].event.should.equal("rejected");
            history[1].event.should.equal("closed");
            chai.should().not.equal(history[0].payload, undefined);
            chai.should().not.equal(history[1].payload, undefined);
          } else if (_event === "accident") {
            history.length.should.equal(3);
            history[2].event.should.equal("reopened");
            chai.should().not.equal(history[2].payload, undefined);
          }
          return Promise.resolve();
        })
        .commit(null, [event("reopened", {}), event("accident", {})]));
  });

  describe("Query", () => {
    const _timeline = timeline(
      "1",
      changelog.commits(
        "1",
        [
          event("rejected", { reason: "one" }),
          event("rejected", { reason: "two" }),
          event("rejected", { reason: "three" })
        ],
        [],
        null
      )
    );

    describe("fetch()", () => {
      it("should fetch all commits in logically sorted order", () =>
        _timeline.fetch().then(commits => {
          commits.length.should.equal(3);
          commits[0].payload.reason.should.equal("one");
          commits[1].payload.reason.should.equal("two");
          commits[2].payload.reason.should.equal("three");
        }));
    });

    describe("latest()", () => {
      it("should fetch the latest payload of the specified event type", () =>
        _timeline.latest("rejected").then((payload: any) => {
          payload.should.be.a("object");
          payload.reason.should.equal("three");
        }));

      it("should resolve with undefined if there are no events of type", () =>
        _timeline.latest("closed").then(payload => {
          chai.should().equal(payload, undefined);
        }));
    });

    describe("all()", () => {
      it("should fetch all events of the specified type", () =>
        _timeline.all("rejected").then((payloads: any[]) => {
          payloads.should.be.a("array");
          payloads.length.should.equal(3);
          payloads[0].should.be.a("object");
          payloads[0].reason.should.equal("one");
        }));

      it("should resolve with [] if there are no events of the type", () =>
        _timeline.all("closed").then(payloads => {
          payloads.should.be.a("array");
          payloads.length.should.equal(0);
        }));
    });
  });
});
