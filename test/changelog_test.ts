import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { logger } from "../src/logger";
import * as changelog from "../src/changelog";

chai.should();
chai.use(chaiAsPromised);

logger.silent = true;

describe("changelog", () => {
  describe("service", () => {
    it("should reply with 'hello world'", done => {
      changelog.service({
        reply: (response: any) => {
          response.should.equal("hello world");
          done();
        }
      });
    });
  });

  describe("something", () => {
    it("should acknowledge the request", done => {
      changelog.something({
        body: "hello",
        ack: () => {
          done();
        }
      });
    });
  });
});
