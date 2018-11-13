import * as chai from "chai";
import * as merkle from "../src/merkle";

chai.should();

describe("Merkle chain", () => {
  describe("create()", () => {
    const history = [
      { id: "zero", parent: null, test: "zero" },
      { id: "one", parent: "zero", test: "one" }
    ];

    const createNode = (item: any, parent: string | null) => ({
      id: item.test,
      parent,
      test: item.test
    });

    it("should create a sorted merkle chain", () => {
      const nodes = merkle.create(
        [{ test: "two" }, { test: "three" }, { test: "four" }],
        history,
        createNode
      );
      nodes.length.should.equal(3);
      const newHistory = history.concat(nodes as any[]);
      merkle.sort(newHistory).should.deep.equal(newHistory);
      merkle
        .verify(newHistory, node => node.id === node.test)
        .should.equal(true);
    });
  });

  describe("sort()", () => {
    it("should logically sort the nodes in the chain", () => {
      merkle
        .sort([
          { id: "xyz2", parent: "xyz1" },
          { id: "xyz1", parent: null },
          { id: "xyz3", parent: "xyz2" }
        ])
        .should.deep.equal([
          { id: "xyz1", parent: null },
          { id: "xyz2", parent: "xyz1" },
          { id: "xyz3", parent: "xyz2" }
        ]);
    });

    it("should ignore splits in the chain", () => {
      merkle
        .sort([
          { id: "xyz2", parent: "xyz1" },
          { id: "xyz1", parent: null },
          { id: "xyz3", parent: "xyz1" }
        ])
        .should.deep.equal([
          { id: "xyz1", parent: null },
          { id: "xyz2", parent: "xyz1" }
        ]);
    });
  });

  describe("verify()", () => {
    it("should verify the integrity of the chain", () => {
      merkle
        .verify(
          [
            { id: "xyz2", parent: "xyz1", valid: true },
            { id: "xyz1", parent: null, valid: true },
            { id: "xyz3", parent: "xyz2", valid: false }
          ],
          node => node.valid
        )
        .should.equal(false);
    });
  });
});
