import { operatorDefinitions } from "@/lib/query/operators";
import type {
  DataSource,
  QueryGroupNode,
  QueryRuleNode,
  QueryScalar,
  QueryTreeState,
} from "@/lib/query/types";
import { getFieldByKey } from "@/lib/schemas/catalog";

function quoteIdentifier(identifier: string) {
  const safeIdentifier = identifier.replace(/[^a-zA-Z0-9_]/g, "");
  return safeIdentifier || "unknown";
}

function escapeSql(value: string) {
  return value.replaceAll("'", "''");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeValue(value: QueryScalar) {
  if (typeof value === "string") {
    return value.trim();
  }

  return value;
}

function sqlLiteral(value: QueryScalar) {
  const normalized = normalizeValue(value);

  if (normalized === null) {
    return "NULL";
  }

  if (typeof normalized === "number") {
    return Number.isFinite(normalized) ? String(normalized) : "0";
  }

  if (typeof normalized === "boolean") {
    return normalized ? "TRUE" : "FALSE";
  }

  return `'${escapeSql(String(normalized))}'`;
}

function renderSqlRule(rule: QueryRuleNode, source: DataSource) {
  const field = getFieldByKey(source.fields, rule.field);
  const operator = operatorDefinitions[rule.operator];

  if (!field || !operator) {
    return "1 = 0";
  }

  const column = quoteIdentifier(field.key);
  const value = Array.isArray(rule.value) ? rule.value : [rule.value];
  const first = value[0] ?? "";
  const second = value[1] ?? "";

  switch (rule.operator) {
    case "equals":
      return `${column} = ${sqlLiteral(first)}`;
    case "notEquals":
      return `${column} <> ${sqlLiteral(first)}`;
    case "contains":
      return `${column} LIKE ${sqlLiteral(`%${String(first).replaceAll("%", "\\%")}%`)}`;
    case "startsWith":
      return `${column} LIKE ${sqlLiteral(`${String(first).replaceAll("%", "\\%")}%`)}`;
    case "greaterThan":
      return `${column} > ${sqlLiteral(first)}`;
    case "lessThan":
      return `${column} < ${sqlLiteral(first)}`;
    case "inArray":
      return `${column} IN (${value.map(sqlLiteral).join(", ")})`;
    case "between":
      return `${column} BETWEEN ${sqlLiteral(first)} AND ${sqlLiteral(second)}`;
    case "regex":
      return `${column} REGEXP ${sqlLiteral(first)}`;
    case "isNull":
      return `${column} IS NULL`;
    case "isNotNull":
      return `${column} IS NOT NULL`;
    case "before":
      return `${column} < ${sqlLiteral(first)}`;
    case "after":
      return `${column} > ${sqlLiteral(first)}`;
  }
}

function renderSqlNode(nodeId: string, state: QueryTreeState, source: DataSource): string {
  const node = state.nodes[nodeId];

  if (!node) {
    return "1 = 0";
  }

  if (node.kind === "rule") {
    return renderSqlRule(node, source);
  }

  const renderedChildren = node.childIds.map((childId) =>
    renderSqlNode(childId, state, source),
  );

  if (renderedChildren.length === 0) {
    return "1 = 0";
  }

  return `(${renderedChildren.join(` ${node.logic} `)})`;
}

function mongoScalar(value: QueryScalar) {
  return normalizeValue(value);
}

function renderMongoRule(rule: QueryRuleNode, source: DataSource) {
  const field = getFieldByKey(source.fields, rule.field);

  if (!field) {
    return { $expr: false };
  }

  const value = Array.isArray(rule.value) ? rule.value : [rule.value];
  const first = mongoScalar(value[0] ?? "");
  const second = mongoScalar(value[1] ?? "");

  switch (rule.operator) {
    case "equals":
      return { [field.key]: first };
    case "notEquals":
      return { [field.key]: { $ne: first } };
    case "contains":
      return { [field.key]: { $regex: escapeRegex(String(first)), $options: "i" } };
    case "startsWith":
      return { [field.key]: { $regex: `^${escapeRegex(String(first))}`, $options: "i" } };
    case "greaterThan":
      return { [field.key]: { $gt: first } };
    case "lessThan":
      return { [field.key]: { $lt: first } };
    case "inArray":
      return { [field.key]: { $in: value.map(mongoScalar) } };
    case "between":
      return { [field.key]: { $gte: first, $lte: second } };
    case "regex":
      return { [field.key]: { $regex: String(first) } };
    case "isNull":
      return { [field.key]: null };
    case "isNotNull":
      return { [field.key]: { $ne: null } };
    case "before":
      return { [field.key]: { $lt: first } };
    case "after":
      return { [field.key]: { $gt: first } };
  }
}

function renderMongoGroup(group: QueryGroupNode, state: QueryTreeState, source: DataSource) {
  const children = group.childIds.map((childId) => renderMongoNode(childId, state, source));

  if (children.length === 0) {
    return { $expr: false };
  }

  if (children.length === 1) {
    return children[0];
  }

  return group.logic === "AND" ? { $and: children } : { $or: children };
}

function renderMongoNode(nodeId: string, state: QueryTreeState, source: DataSource): object {
  const node = state.nodes[nodeId];

  if (!node) {
    return { $expr: false };
  }

  return node.kind === "rule"
    ? renderMongoRule(node, source)
    : renderMongoGroup(node, state, source);
}

export function generateSqlQuery(state: QueryTreeState, source: DataSource) {
  const table = quoteIdentifier(source.tableName);
  const where = renderSqlNode(state.rootId, state, source);

  return `SELECT *\nFROM ${table}\nWHERE ${where};`;
}

export function generateMongoQuery(state: QueryTreeState, source: DataSource) {
  return renderMongoNode(state.rootId, state, source);
}

export function stringifyMongoQuery(state: QueryTreeState, source: DataSource) {
  return JSON.stringify(generateMongoQuery(state, source), null, 2);
}
