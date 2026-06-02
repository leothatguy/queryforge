import type { DataSource, QueryRuleNode, QueryScalar, QueryTreeState } from "@/lib/query/types";

function valueToNumber(value: QueryScalar) {
  return typeof value === "number" ? value : Number(value);
}

function valueToTime(value: QueryScalar) {
  return Date.parse(String(value));
}

function compareValues(rowValue: QueryScalar, targetValue: QueryScalar) {
  return String(rowValue).toLowerCase() === String(targetValue).toLowerCase();
}

function evaluateRule(rule: QueryRuleNode, row: Record<string, QueryScalar>) {
  const rowValue = row[rule.field];
  const values = Array.isArray(rule.value) ? rule.value : [rule.value];
  const first = values[0] ?? "";
  const second = values[1] ?? "";

  switch (rule.operator) {
    case "equals":
      return compareValues(rowValue, first);
    case "notEquals":
      return !compareValues(rowValue, first);
    case "contains":
      return String(rowValue).toLowerCase().includes(String(first).toLowerCase());
    case "startsWith":
      return String(rowValue).toLowerCase().startsWith(String(first).toLowerCase());
    case "greaterThan":
      return valueToNumber(rowValue) > valueToNumber(first);
    case "lessThan":
      return valueToNumber(rowValue) < valueToNumber(first);
    case "inArray":
      return values.some((value) => compareValues(rowValue, value));
    case "between":
      if (Number.isFinite(valueToNumber(rowValue))) {
        return valueToNumber(rowValue) >= valueToNumber(first) && valueToNumber(rowValue) <= valueToNumber(second);
      }

      return valueToTime(rowValue) >= valueToTime(first) && valueToTime(rowValue) <= valueToTime(second);
    case "regex":
      try {
        return new RegExp(String(first), "i").test(String(rowValue));
      } catch {
        return false;
      }
    case "isNull":
      return rowValue === null || rowValue === "";
    case "isNotNull":
      return rowValue !== null && rowValue !== "";
    case "before":
      return valueToTime(rowValue) < valueToTime(first);
    case "after":
      return valueToTime(rowValue) > valueToTime(first);
  }
}

function evaluateNode(nodeId: string, state: QueryTreeState, row: Record<string, QueryScalar>): boolean {
  const node = state.nodes[nodeId];

  if (!node) {
    return false;
  }

  if (node.kind === "rule") {
    return evaluateRule(node, row);
  }

  if (node.childIds.length === 0) {
    return false;
  }

  const childResults = node.childIds.map((childId) => evaluateNode(childId, state, row));
  return node.logic === "AND" ? childResults.every(Boolean) : childResults.some(Boolean);
}

export function executeQuery(state: QueryTreeState, source: DataSource) {
  return source.rows.filter((row) => evaluateNode(state.rootId, state, row));
}
