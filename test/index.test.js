const assert = require("assert");

const { sampleJson, defaultGetType } = require("../index");

describe("sample-json", () => {
  let json1 = require("./files/json1.json");

  it("sampleJson, json1", () => {
    assert.deepEqual(sampleJson(json1), {
      a: 1,
      b: 2,
      c: {
        d: 3,
      },
      e: [{ a: 4 }],
      f: [{ a: { b: 1, c: 3 } }],
      g: [
        {
          a: {
            $1: 1,
            $2: "3",
            $3: null,
            $4: { h: { $1: "h", $2: 2 }, b: 1 },
            $5: true,
            $6: false,
            $7: 0,
            $8: "",
            $9: {},
            $10: [],
          },
        },
      ],
    });
  });

  let json2 = [1, 2, { a: 3, b: 4 }];

  it("sampleJson, json2", () => {
    assert.deepEqual(sampleJson(json2), [1, { a: 3, b: 4 }]);
  });

  it("sampleJson, self-defined getType", () => {
    assert.deepEqual(sampleJson([0, 1, 2, 3, "a", "b"]), [0, 1, "a"]);

    // custom getType
    let getType = (value) => {
      if (typeof value === "number") return "number";
      return defaultGetType(value);
    };
    assert.deepEqual(sampleJson([0, 1, 2, 3, "a", "b"], { getType: getType }), [
      0,
      "a",
    ]);

    // all values of certain type
    getType = (value) => {
      if (typeof value === "number") return JSON.stringify(value);
      return defaultGetType(value);
    };
    assert.deepEqual(sampleJson([0, 1, 2, 3, "a", "b"], { getType: getType }), [
      0,
      1,
      2,
      3,
      "a",
    ]);
  });

  it("sampleJson, prefixType", () => {
    assert.deepEqual(
      sampleJson([0, 1, 2, 3, "a", "b", [], {}, { a: true, b: null }, [""]], {
        prefixType: true,
      }),
      [
        "number-zero: 0",
        "number: 1",
        "string: a",
        "array-empty: []",
        "object-empty: {}",
        {
          a: true,
          b: null,
        },
        ["string-empty: "],
      ]
    );
  });
});
