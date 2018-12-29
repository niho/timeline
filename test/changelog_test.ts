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
        createCommit("1", "question", new Date(), {}, null, null, null)
      ];
      const commits = changelog.commits(
        "1",
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
          "1",
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
          "1",
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
          "1",
          [
            event("rejected", { reason: "one" }),
            event("rejected", { reason: "two" })
          ],
          [
            createCommit(
              "1",
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
          "1",
          [
            event("rejected", { reason: "one" }, "thread-1"),
            event("rejected", { reason: "one" }, "thread-2")
          ],
          [
            createCommit(
              "1",
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
});
