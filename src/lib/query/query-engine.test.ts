import { describe, expect, it } from "vitest";
import { executeQuery } from "@/lib/query/evaluate";
import {
  generateMongoQuery,
  generateSqlQuery,
  stringifyMongoQuery,
} from "@/lib/query/generate";
import { validateQueryState } from "@/lib/query/validate";
import type { QueryTreeState } from "@/lib/query/types";
import { getDataSourceById } from "@/lib/schemas/catalog";
import { createInitialQueryState } from "@/lib/state/query-state";

const usersSource = getDataSourceById("users");

if (!usersSource) {
  throw new Error("Users data source is required for query tests.");
}

describe("query generation", () => {
  it("generates SQL and Mongo previews from nested groups", () => {
    const state = createInitialQueryState("users");

    expect(generateSqlQuery(state, usersSource)).toBe(
      "SELECT *\n" +
        "FROM users\n" +
        "WHERE ((age > 18 AND status = 'active') OR (country = 'Nigeria' AND purchases > 10));",
    );
    expect(generateMongoQuery(state, usersSource)).toEqual({
      $or: [
        { $and: [{ age: { $gt: 18 } }, { status: "active" }] },
        { $and: [{ country: "Nigeria" }, { purchases: { $gt: 10 } }] },
      ],
    });
  });

  it("escapes generated SQL string values", () => {
    const state: QueryTreeState = {
      sourceId: "users",
      rootId: "group-root",
      nextId: 1,
      nodes: {
        "group-root": {
          id: "group-root",
          kind: "group",
          logic: "AND",
          collapsed: false,
          childIds: ["rule-name"],
        },
        "rule-name": {
          id: "rule-name",
          kind: "rule",
          field: "name",
          operator: "equals",
          value: "O'Reilly",
        },
      },
    };

    expect(generateSqlQuery(state, usersSource)).toContain("name = 'O''Reilly'");
  });

  it("stringifies a stable Mongo query preview", () => {
    const state = createInitialQueryState("users");

    expect(stringifyMongoQuery(state, usersSource)).toContain('"$or"');
  });
});

describe("query execution", () => {
  it("filters mock data through nested OR and AND groups", () => {
    const state = createInitialQueryState("users");
    const matches = executeQuery(state, usersSource);

    expect(matches).toHaveLength(5);
    expect(matches.map((row) => row.name)).toEqual([
      "Ada Okafor",
      "Maya Patel",
      "Chika Nwosu",
      "Sarah Kim",
      "Amina Yusuf",
    ]);
  });
});

describe("query validation", () => {
  it("rejects incompatible operators for field types", () => {
    const state = createInitialQueryState("users");
    const ageRule = state.nodes["rule-age"];

    if (!ageRule || ageRule.kind !== "rule") {
      throw new Error("Expected rule-age to be a rule.");
    }

    const invalidState: QueryTreeState = {
      ...state,
      nodes: {
        ...state.nodes,
        "rule-age": {
          ...ageRule,
          operator: "contains",
        },
      },
    };

    expect(validateQueryState(invalidState, usersSource)).toEqual([
      {
        nodeId: "rule-age",
        message: "Contains cannot be used on number fields.",
      },
    ]);
  });

  it("rejects empty groups and invalid ranges", () => {
    const state: QueryTreeState = {
      sourceId: "users",
      rootId: "group-root",
      nextId: 1,
      nodes: {
        "group-root": {
          id: "group-root",
          kind: "group",
          logic: "AND",
          collapsed: false,
          childIds: ["group-empty", "rule-age-range"],
        },
        "group-empty": {
          id: "group-empty",
          kind: "group",
          logic: "OR",
          collapsed: false,
          childIds: [],
        },
        "rule-age-range": {
          id: "rule-age-range",
          kind: "rule",
          field: "age",
          operator: "between",
          value: [50, 18],
        },
      },
    };

    expect(validateQueryState(state, usersSource)).toEqual([
      {
        nodeId: "group-empty",
        message: "Group must contain at least one condition.",
      },
      {
        nodeId: "rule-age-range",
        message: "Number range start must be less than or equal to the end.",
      },
    ]);
  });
});
