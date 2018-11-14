// tslint:disable:max-file-line-count

import * as Promise from "bluebird";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import * as changelog from "../src/changelog";
import { Event } from "../src/event";
import { timeline } from "../src/timeline";
import * as topic from "../src/topic";

chai.should();
chai.use(chaiAsPromised);

const event = (name: string, payload: any, thread: string | null = null) => ({
  event: name,
  payload,
  thread
});

describe("Timeline", () => {
  describe("commit()", () => {
    beforeEach(() => {
      sinon.stub(topic, "publish").resolves();
    });

    afterEach(() => {
      (topic.publish as sinon.SinonStub).restore();
    });

    it("should commit events to the changelog", () => {
      return timeline(1, {
        fetch: () => Promise.resolve([]),
        insert: (_id, commits) => {
          commits.length.should.equal(2);
          chai.should().equal(commits[0].parent, null);
          chai.should().equal(commits[1].parent, commits[0].id);
          chai.should().not.equal(commits[1].parent, null);
          return Promise.resolve(commits);
        }
      }).commit(null, [
        event("rejected", { reason: "..." }),
        event("closed", null)
      ]);
    });

    it("should squash any sequence of identical events", () => {
      return timeline(1, {
        fetch: () => Promise.resolve([]),
        insert: (_id, commits) => {
          commits.length.should.equal(3);
          return Promise.resolve(commits);
        }
      }).commit(null, [
        event("closed", null),
        event("rejected", { reason: "..." }),
        event("rejected", { reason: "..." }),
        event("rejected", null)
      ]);
    });

    it("should not commit event if it is identical with HEAD", () => {
      return timeline(1, {
        fetch: () =>
          Promise.resolve(
            changelog.commits(
              1,
              [event("rejected", { reason: "..." })],
              [],
              null
            )
          ),
        insert: (_id, commits) => {
          commits.length.should.equal(0);
          return Promise.resolve(commits);
        }
      }).commit(null, [event("rejected", { reason: "..." })]);
    });

    it("should return the full history including the new commits", done => {
      const datastore = changelog.commits(
        1,
        [event("question", null)],
        [],
        null
      );
      timeline(1, {
        fetch: () => Promise.resolve(datastore),
        insert: (_id, commits) => {
          datastore.concat(commits);
          return Promise.resolve(commits);
        }
      })
        .commit(null, [event("answer", {}), event("closed", null)])
        .then(commits => {
          commits.length.should.equal(3);
          commits[0].event.should.equal("question");
          commits[1].event.should.equal("answer");
          commits[2].event.should.equal("closed");
          done();
        })
        .catch(done);
    });

    describe("transactions", () => {
      it("should give identical timestamps to commits in transaction", () => {
        return timeline(1, {
          fetch: () => Promise.resolve([]),
          insert: (_id, commits) => {
            commits[0].timestamp
              .getTime()
              .should.be.approximately(commits[1].timestamp.getTime(), 10);
            return Promise.resolve(commits);
          }
        }).commit(null, [event("answer", {}), event("closed", null)]);
      });

      it("should preserve the logical order of commits in transaction", () =>
        timeline(1, {
          fetch: () =>
            Promise.resolve([
              {
                id: "xyz2",
                parent: "xyz1",
                thread: null,
                timeline: 1,
                event: "closed",
                timestamp: new Date("2018-10-10"),
                payload: null,
                author: null
              },
              {
                id: "xyz1",
                parent: null,
                thread: null,
                timeline: 1,
                event: "answer",
                timestamp: new Date("2018-10-10"),
                payload: null,
                author: null
              }
            ]),
          insert: (_id, commits) => {
            return Promise.resolve(commits);
          }
        })
          .fetch()
          .then(commits => {
            commits[0].id.should.equal("xyz1");
            commits[1].id.should.equal("xyz2");
          }));

      it("should chain commits in a transaction", () => {
        return timeline(1, {
          fetch: () => Promise.resolve([]),
          insert: (_id, commits) => {
            commits.length.should.equal(3);
            chai.should().equal(commits[0].parent, null);
            chai.should().equal(commits[1].parent, commits[0].id);
            chai.should().equal(commits[2].parent, commits[1].id);
            return Promise.resolve(commits);
          }
        }).commit(null, [
          event("rejected", { reason: "..." }),
          event("closed", null),
          event("reopened", null)
        ]);
      });
    });

    describe("threads", () => {
      it("should commit event with thread", () => {
        return timeline(1, {
          fetch: () => Promise.resolve([]),
          insert: (_id, commits) => {
            commits.length.should.equal(1);
            chai.should().equal(commits[0].thread, "test");
            return Promise.resolve(commits);
          }
        }).commit(null, event("rejected", null, "test"));
      });
    });

    describe("mallformed events", () => {
      it("should not commit event if it is not wellformed", () => {
        return timeline(1, {
          fetch: () => Promise.resolve([]),
          insert: () => Promise.resolve([])
        })
          .commit(null, {} as Event)
          .should.be.rejectedWith(Error);
      });

      it("should not commit event if it is missing event name", () => {
        return timeline(1, {
          fetch: () => Promise.resolve([]),
          insert: () => Promise.resolve([])
        })
          .commit(null, { payload: {} } as Event)
          .should.be.rejectedWith(Error);
      });

      it("should not commit event if it is missing payload", () => {
        return timeline(1, {
          fetch: () => Promise.resolve([]),
          insert: () => Promise.resolve([])
        })
          .commit(null, { event: "rejected" } as Event)
          .should.be.rejectedWith(Error);
      });
    });

    describe("topic", () => {
      it("should publish commits to topic", () =>
        timeline(1, {
          fetch: () =>
            Promise.resolve(
              changelog.commits(1, [event("claim", {})], [], null)
            ),
          insert: (_id, commits) => Promise.resolve(commits)
        })
          .commit(null, [
            event("rejected", { reason: "..." }),
            event("rejected", { reason: "..." }),
            event("closed", null)
          ])
          .then(() => {
            const stub = topic.publish as sinon.SinonStub;
            stub.calledOnce.should.equal(true);
            stub.firstCall.args[0].should.be.a("array");
            stub.firstCall.args[0].length.should.equal(2);
            stub.firstCall.args[0][0].event.should.equal("rejected");
            stub.firstCall.args[0][1].event.should.equal("closed");
          }));
    });
  });

  describe("validate()", () => {
    it("should validate events before they are comitted", () => {
      return timeline(1, {
        fetch: () => Promise.resolve([]),
        insert: () => Promise.resolve([])
      })
        .validate((_event, _payload) => Promise.resolve())
        .commit(null, [
          event("rejected", { reason: "..." }),
          event("closed", null)
        ]);
    });

    it("should *not* reject events if validation resolves with false", () => {
      return timeline(1, {
        fetch: () => Promise.resolve([]),
        insert: () => Promise.resolve([])
      })
        .validate((_event, _payload) => Promise.resolve(false))
        .commit(null, [
          event("rejected", { reason: "..." }),
          event("closed", null)
        ]);
    });

    it("should reject events if validation is rejected with error", () => {
      return timeline(1, {
        fetch: () => Promise.resolve([]),
        insert: () => Promise.resolve([])
      })
        .validate((_event, _payload) => {
          return Promise.reject(new Error("TestError"));
        })
        .commit(null, [
          event("rejected", { reason: "..." }),
          event("closed", null)
        ])
        .should.be.rejectedWith(Error, "TestError");
    });

    it("should propagate errors thrown during validation", () => {
      return timeline(1, {
        fetch: () => Promise.resolve([]),
        insert: () => Promise.resolve([])
      })
        .validate((_event, _payload) => {
          throw new Error("TestError");
        })
        .commit(null, [
          event("rejected", { reason: "..." }),
          event("closed", null)
        ])
        .should.be.rejectedWith(Error, "TestError");
    });

    it("should validate all events individually", () => {
      return timeline(1, {
        fetch: () => Promise.resolve([]),
        insert: () => Promise.resolve([])
      })
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
        .should.be.rejectedWith("ValidationError");
    });

    it("should be able to validate asynchronously", () => {
      return timeline(1, {
        fetch: () => Promise.resolve([]),
        insert: () => Promise.resolve([])
      })
        .validate((_event, _payload) =>
          Promise.resolve("TestError").then(result => {
            throw new Error(result);
          })
        )
        .commit(null, [
          event("rejected", { reason: "..." }),
          event("closed", null)
        ])
        .should.be.rejectedWith(Error, "TestError");
    });

    it("should pass the event history to the validator", () => {
      return timeline(1, {
        fetch: () =>
          Promise.resolve(
            changelog.commits(
              1,
              [event("rejected", { reason: "..." }), event("closed", {})],
              [],
              null
            )
          ),
        insert: () => Promise.resolve([])
      })
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
        .commit(null, [event("reopened", {}), event("accident", {})]);
    });
  });

  describe("Query", () => {
    const _timeline = timeline(1, {
      fetch: () =>
        Promise.resolve(
          changelog.commits(
            1,
            [
              event("rejected", { reason: "one" }),
              event("rejected", { reason: "two" }),
              event("rejected", { reason: "three" })
            ],
            [],
            null
          )
        ),
      insert: () => Promise.resolve([])
    });

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
