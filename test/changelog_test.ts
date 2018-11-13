// tslint:disable:max-file-line-count

import * as Promise from "bluebird";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as changelog from "../src/changelog";
import { createCommit, verifyCommit } from "../src/commit";
import * as merkle from "../src/merkle";

chai.should();
chai.use(chaiAsPromised);

const event = (name: string, payload: any, thread: string | null = null) => ({
  event: name,
  payload,
  thread
});

describe("Changelog", () => {
  describe("commits()", () => {
    it("should create a sorted merkle chain of commits", () => {
      const history = [
        createCommit(1, "question", new Date(), {}, null, null, null)
      ];
      const commits = changelog.commits(
        1,
        [
          event("rejected", { reason: "one" }),
          event("rejected", { reason: "two" }),
          event("rejected", { reason: "three" })
        ],
        history,
        null
      );
      commits.length.should.equal(3);
      const newHistory = history.concat(commits);
      merkle.sort(newHistory).should.deep.equal(newHistory);
      merkle.verify(newHistory, verifyCommit).should.equal(true);
    });

    describe("squashing", () => {
      it("should squash any sequence of identical events", () => {
        const commits = changelog.commits(
          1,
          [
            event("rejected", { reason: "one" }),
            event("rejected", { reason: "two" }),
            event("rejected", { reason: "two" }),
            event("rejected", { reason: "three" })
          ],
          [],
          null
        );
        commits.length.should.equal(3);
      });

      it("should not squash identical events that are not in sequence", () => {
        const commits = changelog.commits(
          1,
          [
            event("rejected", { reason: "one" }),
            event("rejected", { reason: "two" }),
            event("rejected", { reason: "three" }),
            event("rejected", { reason: "two" })
          ],
          [],
          null
        );
        commits.length.should.equal(4);
      });

      it("should squash with history", () => {
        const commits = changelog.commits(
          1,
          [
            event("rejected", { reason: "one" }),
            event("rejected", { reason: "two" })
          ],
          [
            createCommit(
              1,
              "rejected",
              new Date(),
              { reason: "one" },
              null,
              null,
              null
            )
          ],
          null
        );
        commits.length.should.equal(1);
        commits[0].payload.reason.should.equal("two");
      });

      it("should squash with history if thread is the same", () => {
        const commits = changelog.commits(
          1,
          [
            event("rejected", { reason: "one" }, "thread-1"),
            event("rejected", { reason: "one" }, "thread-2")
          ],
          [
            createCommit(
              1,
              "rejected",
              new Date(),
              { reason: "one" },
              null,
              "thread-1",
              null
            )
          ],
          null
        );
        commits.length.should.equal(1);
        commits[0].payload.reason.should.equal("one");
        chai.should().equal(commits[0].thread, "thread-2");
      });
    });
  });

  describe("commit()", () => {
    it("should commit events to the changelog", () => {
      return changelog
        .timeline(1, {
          fetch: () => Promise.resolve([]),
          insert: (_id, commits) => {
            commits.length.should.equal(2);
            chai.should().equal(commits[0].parent, null);
            chai.should().equal(commits[1].parent, commits[0].id);
            chai.should().not.equal(commits[1].parent, null);
            return Promise.resolve(commits);
          }
        })
        .commit(null, [
          event("rejected", { reason: "..." }),
          event("closed", null)
        ]);
    });

    it("should squash any sequence of identical events", () => {
      return changelog
        .timeline(1, {
          fetch: () => Promise.resolve([]),
          insert: (_id, commits) => {
            commits.length.should.equal(3);
            return Promise.resolve(commits);
          }
        })
        .commit(null, [
          event("closed", null),
          event("rejected", { reason: "..." }),
          event("rejected", { reason: "..." }),
          event("rejected", null)
        ]);
    });

    it("should not commit event if it is identical with HEAD", () => {
      return changelog
        .timeline(1, {
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
        })
        .commit(null, [event("rejected", { reason: "..." })]);
    });

    it("should return the full history including the new commits", done => {
      const datastore = changelog.commits(
        1,
        [event("question", null)],
        [],
        null
      );
      changelog
        .timeline(1, {
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
        return changelog
          .timeline(1, {
            fetch: () => Promise.resolve([]),
            insert: (_id, commits) => {
              commits[0].timestamp
                .getTime()
                .should.be.approximately(commits[1].timestamp.getTime(), 10);
              return Promise.resolve(commits);
            }
          })
          .commit(null, [event("answer", {}), event("closed", null)]);
      });

      it("should preserve the logical order of commits in transaction", () =>
        changelog
          .timeline(1, {
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
        return changelog
          .timeline(1, {
            fetch: () => Promise.resolve([]),
            insert: (_id, commits) => {
              commits.length.should.equal(3);
              chai.should().equal(commits[0].parent, null);
              chai.should().equal(commits[1].parent, commits[0].id);
              chai.should().equal(commits[2].parent, commits[1].id);
              return Promise.resolve(commits);
            }
          })
          .commit(null, [
            event("rejected", { reason: "..." }),
            event("closed", null),
            event("reopened", null)
          ]);
      });
    });

    describe("threads", () => {
      it("should commit event with thread", () => {
        return changelog
          .timeline(1, {
            fetch: () => Promise.resolve([]),
            insert: (_id, commits) => {
              commits.length.should.equal(1);
              chai.should().equal(commits[0].thread, "test");
              return Promise.resolve(commits);
            }
          })
          .commit(null, event("rejected", null, "test"));
      });
    });

    describe("mallformed events", () => {
      it("should not commit event if it is not wellformed", () => {
        return changelog
          .timeline(1, {
            fetch: () => Promise.resolve([]),
            insert: () => Promise.resolve([])
          })
          .commit(null, {} as changelog.Event)
          .should.be.rejectedWith(Error);
      });

      it("should not commit event if it is missing event name", () => {
        return changelog
          .timeline(1, {
            fetch: () => Promise.resolve([]),
            insert: () => Promise.resolve([])
          })
          .commit(null, { payload: {} } as changelog.Event)
          .should.be.rejectedWith(Error);
      });

      it("should not commit event if it is missing payload", () => {
        return changelog
          .timeline(1, {
            fetch: () => Promise.resolve([]),
            insert: () => Promise.resolve([])
          })
          .commit(null, { event: "rejected" } as changelog.Event)
          .should.be.rejectedWith(Error);
      });
    });
  });

  describe("validate()", () => {
    it("should validate events before they are comitted", () => {
      return changelog
        .timeline(1, {
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
      return changelog
        .timeline(1, {
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
      return changelog
        .timeline(1, {
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
      return changelog
        .timeline(1, {
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
      return changelog
        .timeline(1, {
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
      return changelog
        .timeline(1, {
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
      return changelog
        .timeline(1, {
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
    const timeline = changelog.timeline(1, {
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
        timeline.fetch().then(commits => {
          commits.length.should.equal(3);
          commits[0].payload.reason.should.equal("one");
          commits[1].payload.reason.should.equal("two");
          commits[2].payload.reason.should.equal("three");
        }));
    });

    describe("latest()", () => {
      it("should fetch the latest payload of the specified event type", () =>
        timeline.latest("rejected").then((payload: any) => {
          payload.should.be.a("object");
          payload.reason.should.equal("three");
        }));

      it("should resolve with undefined if there are no events of type", () =>
        timeline.latest("closed").then(payload => {
          chai.should().equal(payload, undefined);
        }));
    });

    describe("all()", () => {
      it("should fetch all events of the specified type", () =>
        timeline.all("rejected").then((payloads: any[]) => {
          payloads.should.be.a("array");
          payloads.length.should.equal(3);
          payloads[0].should.be.a("object");
          payloads[0].reason.should.equal("one");
        }));

      it("should resolve with [] if there are no events of the type", () =>
        timeline.all("closed").then(payloads => {
          payloads.should.be.a("array");
          payloads.length.should.equal(0);
        }));
    });
  });
});
