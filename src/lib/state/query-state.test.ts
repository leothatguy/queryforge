import { describe, expect, it } from "vitest";
import type { QueryGroupNode, QueryRuleNode, QueryTreeState } from "@/lib/query/types";
import {
  createInitialQueryState,
  parseImportedQueryState,
  queryReducer,
} from "@/lib/state/query-state";

function getGroup(state: QueryTreeState, groupId: string) {
  const group = state.nodes[groupId];

  if (!group || group.kind !== "group") {
    throw new Error(`${groupId} is not a group.`);
  }

  return group;
}

function getRule(state: QueryTreeState, ruleId: string) {
  const rule = state.nodes[ruleId];

  if (!rule || rule.kind !== "rule") {
    throw new Error(`${ruleId} is not a rule.`);
  }

  return rule;
}

describe("queryReducer", () => {
  it("adds nested groups with a default child rule", () => {
    const state = createInitialQueryState("orders");
    const nextState = queryReducer(state, { type: "add-group", parentId: state.rootId });
    const root = getGroup(nextState, nextState.rootId);
    const addedGroup = nextState.nodes["group-1"] as QueryGroupNode;
    const addedRule = nextState.nodes["rule-2"] as QueryRuleNode;

    expect(root.childIds).toEqual(["rule-default", "group-1"]);
    expect(addedGroup.childIds).toEqual(["rule-2"]);
    expect(addedRule.field).toBe("customer");
    expect(getGroup(state, state.rootId).childIds).toEqual(["rule-default"]);
  });

  it("resets operator and value when a rule field changes", () => {
    const state = createInitialQueryState("orders");
    const nextState = queryReducer(state, {
      type: "update-rule-field",
      nodeId: "rule-default",
      field: "total",
    });
    const rule = getRule(nextState, "rule-default");

    expect(rule.operator).toBe("greaterThan");
    expect(rule.value).toBe(0);
  });

  it("reorders siblings inside a group", () => {
    const state = createInitialQueryState("users");
    const nextState = queryReducer(state, {
      type: "move-child",
      parentId: state.rootId,
      childId: "group-engaged-ng",
      targetId: "group-active-adults",
    });

    expect(getGroup(nextState, state.rootId).childIds).toEqual([
      "group-engaged-ng",
      "group-active-adults",
    ]);
  });

  it("removes a subtree without mutating the previous state", () => {
    const state = createInitialQueryState("users");
    const originalRootChildren = getGroup(state, state.rootId).childIds;
    const nextState = queryReducer(state, {
      type: "remove-node",
      nodeId: "group-active-adults",
    });

    expect(nextState.nodes["group-active-adults"]).toBeUndefined();
    expect(nextState.nodes["rule-age"]).toBeUndefined();
    expect(nextState.nodes["rule-status"]).toBeUndefined();
    expect(getGroup(nextState, state.rootId).childIds).toEqual(["group-engaged-ng"]);
    expect(originalRootChildren).toEqual(["group-active-adults", "group-engaged-ng"]);
  });
});

describe("parseImportedQueryState", () => {
  it("accepts an exported query tree", () => {
    const state = createInitialQueryState("users");
    const result = parseImportedQueryState(JSON.stringify(state));

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.state.rootId).toBe(state.rootId);
    }
  });

  it("rejects malformed recursive structures", () => {
    const result = parseImportedQueryState(
      JSON.stringify({
        sourceId: "users",
        rootId: "group-root",
        nodes: {
          "group-root": {
            id: "group-root",
            kind: "group",
            logic: "AND",
            collapsed: false,
            childIds: ["group-root"],
          },
        },
      }),
    );

    expect(result).toEqual({
      ok: false,
      error: "Imported query has malformed or cyclic nodes.",
    });
  });

  it("rejects malformed imported rule payloads", () => {
    const result = parseImportedQueryState(
      JSON.stringify({
        sourceId: "users",
        rootId: "group-root",
        nodes: {
          "group-root": {
            id: "group-root",
            kind: "group",
            logic: "AND",
            collapsed: false,
            childIds: ["rule-bad"],
          },
          "rule-bad": {
            id: "rule-bad",
            kind: "rule",
            field: "age",
            operator: "contains",
            value: "18",
          },
        },
      }),
    );

    expect(result).toEqual({
      ok: false,
      error: "Imported query has malformed or cyclic nodes.",
    });
  });

  it("rejects unreachable nodes in imported trees", () => {
    const state = createInitialQueryState("users");
    const result = parseImportedQueryState(
      JSON.stringify({
        ...state,
        nodes: {
          ...state.nodes,
          "rule-orphan": {
            id: "rule-orphan",
            kind: "rule",
            field: "name",
            operator: "contains",
            value: "Ada",
          },
        },
      }),
    );

    expect(result).toEqual({
      ok: false,
      error: "Imported query contains unreachable nodes.",
    });
  });

  it("rejects duplicate child references in imported trees", () => {
    const result = parseImportedQueryState(
      JSON.stringify({
        sourceId: "users",
        rootId: "group-root",
        nodes: {
          "group-root": {
            id: "group-root",
            kind: "group",
            logic: "AND",
            collapsed: false,
            childIds: ["rule-name", "rule-name"],
          },
          "rule-name": {
            id: "rule-name",
            kind: "rule",
            field: "name",
            operator: "contains",
            value: "Ada",
          },
        },
      }),
    );

    expect(result).toEqual({
      ok: false,
      error: "Imported query has malformed or cyclic nodes.",
    });
  });
});
