import {
  getDefaultOperatorForField,
  getDefaultValueForOperator,
  isOperatorAllowedForField,
} from "@/lib/query/operators";
import type {
  DataSource,
  NodeId,
  OperatorKey,
  QueryGroupNode,
  QueryNode,
  QueryRuleNode,
  QueryTreeState,
  QueryValue,
} from "@/lib/query/types";
import { dataSources, getDataSourceById, getFieldByKey } from "@/lib/schemas/catalog";

const ROOT_ID = "group-root";

export type QueryAction =
  | { type: "set-source"; sourceId: string }
  | { type: "add-rule"; parentId: NodeId }
  | { type: "add-group"; parentId: NodeId }
  | { type: "remove-node"; nodeId: NodeId }
  | { type: "toggle-group"; groupId: NodeId }
  | { type: "set-group-logic"; groupId: NodeId; logic: QueryGroupNode["logic"] }
  | { type: "update-rule-field"; nodeId: NodeId; field: string }
  | { type: "update-rule-operator"; nodeId: NodeId; operator: OperatorKey }
  | { type: "update-rule-value"; nodeId: NodeId; value: QueryValue }
  | { type: "move-child"; parentId: NodeId; childId: NodeId; targetId: NodeId }
  | { type: "replace-state"; state: QueryTreeState };

function getSourceOrDefault(sourceId: string) {
  return getDataSourceById(sourceId) ?? dataSources[0];
}

function createDefaultRule(id: NodeId, source: DataSource): QueryRuleNode {
  const field = source.fields[0];
  const operator = getDefaultOperatorForField(field.type);

  return {
    id,
    kind: "rule",
    field: field.key,
    operator,
    value: getDefaultValueForOperator(field, operator),
  };
}

function createGroup(id: NodeId, childIds: NodeId[] = []): QueryGroupNode {
  return {
    id,
    kind: "group",
    logic: "AND",
    childIds,
    collapsed: false,
  };
}

export function createInitialQueryState(sourceId = "users"): QueryTreeState {
  const source = getSourceOrDefault(sourceId);

  if (source.id === "users") {
    return {
      sourceId: source.id,
      rootId: ROOT_ID,
      nextId: 1,
      nodes: {
        [ROOT_ID]: {
          id: ROOT_ID,
          kind: "group",
          logic: "OR",
          childIds: ["group-active-adults", "group-engaged-ng"],
          collapsed: false,
        },
        "group-active-adults": {
          id: "group-active-adults",
          kind: "group",
          logic: "AND",
          childIds: ["rule-age", "rule-status"],
          collapsed: false,
        },
        "rule-age": {
          id: "rule-age",
          kind: "rule",
          field: "age",
          operator: "greaterThan",
          value: 18,
        },
        "rule-status": {
          id: "rule-status",
          kind: "rule",
          field: "status",
          operator: "equals",
          value: "active",
        },
        "group-engaged-ng": {
          id: "group-engaged-ng",
          kind: "group",
          logic: "AND",
          childIds: ["rule-country", "rule-purchases"],
          collapsed: false,
        },
        "rule-country": {
          id: "rule-country",
          kind: "rule",
          field: "country",
          operator: "equals",
          value: "Nigeria",
        },
        "rule-purchases": {
          id: "rule-purchases",
          kind: "rule",
          field: "purchases",
          operator: "greaterThan",
          value: 10,
        },
      },
    };
  }

  const rule = createDefaultRule("rule-default", source);

  return {
    sourceId: source.id,
    rootId: ROOT_ID,
    nextId: 1,
    nodes: {
      [ROOT_ID]: createGroup(ROOT_ID, [rule.id]),
      [rule.id]: rule,
    },
  };
}

function allocateNodeId(state: QueryTreeState, prefix: "rule" | "group") {
  let nextId = state.nextId;
  let id = `${prefix}-${nextId}`;

  while (state.nodes[id]) {
    nextId += 1;
    id = `${prefix}-${nextId}`;
  }

  return { id, nextId: nextId + 1 };
}

function deleteSubtree(nodes: Record<NodeId, QueryNode>, nodeId: NodeId) {
  const node = nodes[nodeId];

  if (!node) {
    return;
  }

  if (node.kind === "group") {
    node.childIds.forEach((childId) => deleteSubtree(nodes, childId));
  }

  delete nodes[nodeId];
}

function removeNodeReference(nodes: Record<NodeId, QueryNode>, nodeId: NodeId) {
  Object.values(nodes).forEach((node) => {
    if (node.kind !== "group") {
      return;
    }

    node.childIds = node.childIds.filter((childId) => childId !== nodeId);
  });
}

export function queryReducer(state: QueryTreeState, action: QueryAction): QueryTreeState {
  const source = getSourceOrDefault(state.sourceId);

  if (action.type === "set-source") {
    return createInitialQueryState(action.sourceId);
  }

  if (action.type === "replace-state") {
    return action.state;
  }

  if (action.type === "add-rule") {
    const parent = state.nodes[action.parentId];

    if (!parent || parent.kind !== "group") {
      return state;
    }

    const allocated = allocateNodeId(state, "rule");
    const rule = createDefaultRule(allocated.id, source);

    return {
      ...state,
      nextId: allocated.nextId,
      nodes: {
        ...state.nodes,
        [parent.id]: { ...parent, childIds: [...parent.childIds, allocated.id] },
        [allocated.id]: rule,
      },
    };
  }

  if (action.type === "add-group") {
    const parent = state.nodes[action.parentId];

    if (!parent || parent.kind !== "group") {
      return state;
    }

    const groupAllocation = allocateNodeId(state, "group");
    const ruleAllocation = allocateNodeId(
      { ...state, nextId: groupAllocation.nextId },
      "rule",
    );
    const rule = createDefaultRule(ruleAllocation.id, source);
    const group = createGroup(groupAllocation.id, [rule.id]);

    return {
      ...state,
      nextId: ruleAllocation.nextId,
      nodes: {
        ...state.nodes,
        [parent.id]: { ...parent, childIds: [...parent.childIds, group.id] },
        [group.id]: group,
        [rule.id]: rule,
      },
    };
  }

  if (action.type === "remove-node") {
    if (action.nodeId === state.rootId) {
      return state;
    }

    const nodes = { ...state.nodes };
    removeNodeReference(nodes, action.nodeId);
    deleteSubtree(nodes, action.nodeId);

    return { ...state, nodes };
  }

  if (action.type === "toggle-group") {
    const group = state.nodes[action.groupId];

    if (!group || group.kind !== "group") {
      return state;
    }

    return {
      ...state,
      nodes: {
        ...state.nodes,
        [group.id]: { ...group, collapsed: !group.collapsed },
      },
    };
  }

  if (action.type === "set-group-logic") {
    const group = state.nodes[action.groupId];

    if (!group || group.kind !== "group") {
      return state;
    }

    return {
      ...state,
      nodes: {
        ...state.nodes,
        [group.id]: { ...group, logic: action.logic },
      },
    };
  }

  if (action.type === "update-rule-field") {
    const rule = state.nodes[action.nodeId];
    const field = getFieldByKey(source.fields, action.field);

    if (!field || !rule || rule.kind !== "rule") {
      return state;
    }

    const operator = getDefaultOperatorForField(field.type);

    return {
      ...state,
      nodes: {
        ...state.nodes,
        [rule.id]: {
          ...rule,
          field: field.key,
          operator,
          value: getDefaultValueForOperator(field, operator),
        },
      },
    };
  }

  if (action.type === "update-rule-operator") {
    const rule = state.nodes[action.nodeId];
    const field = rule?.kind === "rule" ? getFieldByKey(source.fields, rule.field) : undefined;

    if (!field || !rule || rule.kind !== "rule") {
      return state;
    }

    if (!isOperatorAllowedForField(action.operator, field.type)) {
      return state;
    }

    return {
      ...state,
      nodes: {
        ...state.nodes,
        [rule.id]: {
          ...rule,
          operator: action.operator,
          value: getDefaultValueForOperator(field, action.operator),
        },
      },
    };
  }

  if (action.type === "update-rule-value") {
    const rule = state.nodes[action.nodeId];

    if (!rule || rule.kind !== "rule") {
      return state;
    }

    return {
      ...state,
      nodes: {
        ...state.nodes,
        [rule.id]: { ...rule, value: action.value },
      },
    };
  }

  if (action.type === "move-child") {
    const group = state.nodes[action.parentId];

    if (!group || group.kind !== "group") {
      return state;
    }

    const fromIndex = group.childIds.indexOf(action.childId);
    const toIndex = group.childIds.indexOf(action.targetId);

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return state;
    }

    const nextChildIds = [...group.childIds];
    const [moved] = nextChildIds.splice(fromIndex, 1);
    nextChildIds.splice(toIndex, 0, moved);

    return {
      ...state,
      nodes: {
        ...state.nodes,
        [group.id]: { ...group, childIds: nextChildIds },
      },
    };
  }

  return state;
}

export function parseImportedQueryState(raw: string) {
  try {
    const parsed = JSON.parse(raw) as Partial<QueryTreeState>;

    if (!parsed || typeof parsed !== "object") {
      return { ok: false as const, error: "Imported JSON must be an object." };
    }

    if (typeof parsed.sourceId !== "string" || !getDataSourceById(parsed.sourceId)) {
      return { ok: false as const, error: "Imported query references an unknown data source." };
    }

    if (typeof parsed.rootId !== "string" || !parsed.nodes || typeof parsed.nodes !== "object") {
      return { ok: false as const, error: "Imported query is missing a root or node map." };
    }

    const root = parsed.nodes[parsed.rootId];

    if (!root || root.kind !== "group") {
      return { ok: false as const, error: "Imported query root must be a group." };
    }

    const visiting = new Set<NodeId>();
    const visited = new Set<NodeId>();

    function visit(nodeId: NodeId): boolean {
      if (visiting.has(nodeId)) {
        return false;
      }

      if (visited.has(nodeId)) {
        return true;
      }

      const node = parsed.nodes?.[nodeId];

      if (!node || typeof node.id !== "string" || node.id !== nodeId) {
        return false;
      }

      visiting.add(nodeId);

      if (node.kind === "group") {
        if (!Array.isArray(node.childIds)) {
          return false;
        }

        for (const childId of node.childIds) {
          if (typeof childId !== "string" || !visit(childId)) {
            return false;
          }
        }
      } else if (node.kind !== "rule") {
        return false;
      }

      visiting.delete(nodeId);
      visited.add(nodeId);
      return true;
    }

    if (!visit(parsed.rootId)) {
      return { ok: false as const, error: "Imported query has malformed or cyclic nodes." };
    }

    return {
      ok: true as const,
      state: {
        sourceId: parsed.sourceId,
        rootId: parsed.rootId,
        nodes: parsed.nodes as Record<NodeId, QueryNode>,
        nextId: typeof parsed.nextId === "number" ? parsed.nextId : visited.size + 1,
      },
    };
  } catch {
    return { ok: false as const, error: "Imported query must be valid JSON." };
  }
}
