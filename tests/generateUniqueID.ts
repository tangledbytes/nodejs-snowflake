import { expect } from "chai";
import UniqueID from "../src";

describe("Snowflake with default configuration", () => {
  it("should return id as a string", () => {
    const uid = new UniqueID();

    const id = uid.getUniqueID();

    expect(id).to.be.a("string");
    expect(() => BigInt(id)).to.not.throw();
  });

  it("should return timestamp of creation", () => {
    const ERROR_MARGIN = 2;
    const uid = new UniqueID();

    const before = Date.now(); // Before calling
    const id = uid.getUniqueID();
    const after = Date.now(); // After calling

    const ts = uid.getTimestampFromID(id);

    expect(ts)
      .to.be.greaterThanOrEqual(before - ERROR_MARGIN)
      .and.lessThanOrEqual(after + ERROR_MARGIN);
  });

  it("should return machine id", () => {
    const uid = new UniqueID();
    const mid = uid.machineID;

    expect(mid)
      .to.be.greaterThanOrEqual(0)
      .and.lessThanOrEqual((1 << 12) - 1);
  });

  it("should return current machine's id from the generated id", () => {
    const uid = new UniqueID();
    const mid = uid.machineID;

    const id = uid.getUniqueID();

    expect(uid.getMachineIDFromID(id)).to.be.equal(mid);
  });

  it("should return ID from timestamp", () => {
    const uid = new UniqueID();

    const ts = new Date("2020-10-23").getTime();
    const id = uid.getIDFromTimestamp(ts);

    expect(uid.getTimestampFromID(id)).to.equal(ts);
  });
});

describe("Snowflake with custom machine ID configuration", () => {
  it("should return id as a string", () => {
    const uid = new UniqueID({ machineID: 1000 });

    const id = uid.getUniqueID();

    expect(id).to.be.a("string");
    expect(() => BigInt(id)).to.not.throw();
  });

  it("should return timestamp of creation", () => {
    const ERROR_MARGIN = 2;
    const uid = new UniqueID({ machineID: 1000 });

    const before = Date.now(); // Before calling
    const id = uid.getUniqueID();
    const after = Date.now(); // After calling

    const ts = uid.getTimestampFromID(id);

    expect(ts)
      .to.be.greaterThanOrEqual(before - ERROR_MARGIN)
      .and.lessThanOrEqual(after + ERROR_MARGIN);
  });

  it("should return current machine's id from the generated id", () => {
    const mid = 1000;
    const uid = new UniqueID({ machineID: mid });

    const id = uid.getUniqueID();

    expect(uid.getMachineIDFromID(id)).to.be.equal(mid);
  });

  it("should throw error for when machine id is invalid", () => {
    expect(() => new UniqueID({ machineID: 10000 })).to.throw(
      "Maximum value of machine id can be 2^12 - 1 (4095)"
    );

    expect(() => new UniqueID({ machineID: 100.32 })).to.throw(
      "Machine Id should be a decimal number"
    );
  });
});

describe("Snowflake stress test", () => {
  it("should produce unique ids only", () => {
    const SECOND = 1e3;
    const RUN_FOR_SECONDS = 0.01;
    const mid = 1000;
    const uid = new UniqueID({ machineID: mid });

    const before = Date.now();
    const ids = [];

    while (Date.now() - before < RUN_FOR_SECONDS * SECOND)
      ids.push(uid.getUniqueID());

    const set = new Set(ids);

    expect(set.size).to.equal(ids.length);
  });
});
