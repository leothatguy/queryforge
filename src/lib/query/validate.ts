import { isOperatorAllowedForField, operatorDefinitions } from "@/lib/query/operators";
import type {
  DataSource,
  NodeId,
  QueryScalar,
  QueryTreeState,
  ValidationIssue,
} from "@/lib/query/types";
import { getFieldByKey } from "@/lib/schemas/catalog";

export function validateQueryState(state: QueryTreeState, source: DataSource) {
  const issues: ValidationIssue[] = [];
  const visited = new Set<NodeId>();
  const visiting = new Set<NodeId>();

  function addIssue(nodeId: NodeId, message: string) {
    issues.push({ nodeId, message });
  }

  function validateScalar(nodeId: NodeId, fieldType: string, value: QueryScalar) {
    if (value === null || value === "") {
      addIssue(nodeId, "Value is required.");
      return;
    }

    if (fieldType === "number" && !Number.isFinite(Number(value))) {
      addIssue(nodeId, "Number value must be finite.");
    }

    if (fieldType === "date" && Number.isNaN(Date.parse(String(value)))) {
      addIssue(nodeId, "Date value must be valid.");
    }

    if (fieldType === "boolean" && typeof value !== "boolean") {
      addIssue(nodeId, "Boolean value must be true or false.");
    }
  }

  function visit(nodeId: NodeId) {
    const node = state.nodes[nodeId];

    if (!node) {
      addIssue(nodeId, "Node does not exist.");
      return;
    }

    if (visiting.has(nodeId)) {
      addIssue(nodeId, "Circular group reference detected.");
      return;
    }

    if (visited.has(nodeId)) {
      return;
    }

    visiting.add(nodeId);

    if (node.kind === "group") {
      if (node.childIds.length === 0) {
        addIssue(node.id, "Group must contain at least one condition.");
      }

      node.childIds.forEach(visit);
    } else {
      const field = getFieldByKey(source.fields, node.field);
      const operator = operatorDefinitions[node.operator];

      if (!field) {
        addIssue(node.id, "Field is not available in this schema.");
      }

      if (!operator) {
        addIssue(node.id, "Operator is not supported.");
      }

      if (field && operator && !isOperatorAllowedForField(node.operator, field.type)) {
        addIssue(node.id, `${operator.label} cannot be used on ${field.type} fields.`);
      }

      if (field && operator?.input === "single") {
        validateScalar(node.id, field.type, node.value as QueryScalar);
      }

      if (field && operator?.input === "list") {
        if (!Array.isArray(node.value) || node.value.length === 0) {
          addIssue(node.id, "Array operator requires at least one value.");
        } else {
          node.value.forEach((value) => validateScalar(node.id, field.type, value));
        }
      }

      if (field && operator?.input === "range") {
        if (!Array.isArray(node.value) || node.value.length !== 2) {
          addIssue(node.id, "Between requires a start and end value.");
        } else {
          const [start, end] = node.value;
          validateScalar(node.id, field.type, start);
          validateScalar(node.id, field.type, end);

          if (field.type === "number" && Number(start) > Number(end)) {
            addIssue(node.id, "Number range start must be less than or equal to the end.");
          }

          if (
            field.type === "date" &&
            !Number.isNaN(Date.parse(String(start))) &&
            !Number.isNaN(Date.parse(String(end))) &&
            Date.parse(String(start)) > Date.parse(String(end))
          ) {
            addIssue(node.id, "Date range start must be before the end.");
          }
        }
      }

      if (node.operator === "regex") {
        try {
          new RegExp(String(node.value));
        } catch {
          addIssue(node.id, "Regex pattern is invalid.");
        }
      }
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
  }

  if (!state.nodes[state.rootId]) {
    addIssue(state.rootId, "Root group is missing.");
  } else {
    visit(state.rootId);
  }

  return issues;
}
