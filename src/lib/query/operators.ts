import type { FieldType, OperatorKey, QueryScalar, QueryValue, SchemaField } from "./types";

export type OperatorInputKind = "single" | "list" | "range" | "none";

export interface OperatorDefinition {
  key: OperatorKey;
  label: string;
  symbol: string;
  input: OperatorInputKind;
  appliesTo: FieldType[];
}

export const operatorDefinitions: Record<OperatorKey, OperatorDefinition> = {
  equals: {
    key: "equals",
    label: "Equals (=)",
    symbol: "=",
    input: "single",
    appliesTo: ["string", "number", "enum", "date", "boolean"],
  },
  notEquals: {
    key: "notEquals",
    label: "Not equals (!=)",
    symbol: "!=",
    input: "single",
    appliesTo: ["string", "number", "enum", "date", "boolean"],
  },
  contains: {
    key: "contains",
    label: "Contains (⊃)",
    symbol: "⊃",
    input: "single",
    appliesTo: ["string", "enum"],
  },
  startsWith: {
    key: "startsWith",
    label: "Starts with (^)",
    symbol: "^",
    input: "single",
    appliesTo: ["string"],
  },
  greaterThan: {
    key: "greaterThan",
    label: "Greater than (>)",
    symbol: ">",
    input: "single",
    appliesTo: ["number"],
  },
  lessThan: {
    key: "lessThan",
    label: "Less than (<)",
    symbol: "<",
    input: "single",
    appliesTo: ["number"],
  },
  inArray: {
    key: "inArray",
    label: "In array ([])",
    symbol: "[]",
    input: "list",
    appliesTo: ["string", "number", "enum"],
  },
  between: {
    key: "between",
    label: "Between (↔)",
    symbol: "↔",
    input: "range",
    appliesTo: ["number", "date"],
  },
  regex: {
    key: "regex",
    label: "Regex (.*)",
    symbol: ".*",
    input: "single",
    appliesTo: ["string"],
  },
  isNull: {
    key: "isNull",
    label: "Is null (∅)",
    symbol: "∅",
    input: "none",
    appliesTo: ["string", "number", "enum", "date", "boolean"],
  },
  isNotNull: {
    key: "isNotNull",
    label: "Is not null (!∅)",
    symbol: "!∅",
    input: "none",
    appliesTo: ["string", "number", "enum", "date", "boolean"],
  },
  before: {
    key: "before",
    label: "Before (←)",
    symbol: "←",
    input: "single",
    appliesTo: ["date"],
  },
  after: {
    key: "after",
    label: "After (→)",
    symbol: "→",
    input: "single",
    appliesTo: ["date"],
  },
};

const defaultOperatorByType: Record<FieldType, OperatorKey> = {
  string: "contains",
  number: "greaterThan",
  enum: "equals",
  date: "after",
  boolean: "equals",
};

export function getOperatorsForField(type: FieldType) {
  return Object.values(operatorDefinitions).filter((operator) =>
    operator.appliesTo.includes(type),
  );
}

export function isOperatorAllowedForField(operator: OperatorKey, type: FieldType) {
  return operatorDefinitions[operator]?.appliesTo.includes(type) ?? false;
}

export function getDefaultOperatorForField(type: FieldType) {
  return defaultOperatorByType[type];
}

export function getDefaultScalarValue(field: SchemaField): QueryScalar {
  if (field.type === "number") {
    return 0;
  }

  if (field.type === "boolean") {
    return true;
  }

  if (field.type === "date") {
    return "2026-01-01";
  }

  if (field.type === "enum") {
    return field.options?.[0]?.value ?? "";
  }

  return "";
}

export function getDefaultValueForOperator(field: SchemaField, operator: OperatorKey): QueryValue {
  const input = operatorDefinitions[operator].input;
  const scalar = getDefaultScalarValue(field);

  if (input === "none") {
    return null;
  }

  if (input === "list") {
    return [scalar];
  }

  if (input === "range") {
    if (field.type === "date") {
      return ["2026-01-01", "2026-12-31"];
    }

    return [0, 100];
  }

  return scalar;
}
