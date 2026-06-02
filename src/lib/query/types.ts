export type FieldType = "string" | "number" | "enum" | "date" | "boolean";

export type LogicOperator = "AND" | "OR";

export type OperatorKey =
  | "equals"
  | "notEquals"
  | "contains"
  | "startsWith"
  | "greaterThan"
  | "lessThan"
  | "inArray"
  | "between"
  | "regex"
  | "isNull"
  | "isNotNull"
  | "before"
  | "after";

export type QueryScalar = string | number | boolean | null;

export type QueryValue = QueryScalar | QueryScalar[];

export type NodeId = string;

export type QueryRow = Record<string, QueryScalar>;

export interface EnumOption {
  label: string;
  value: string;
}

export interface SchemaField {
  key: string;
  label: string;
  type: FieldType;
  options?: EnumOption[];
}

export interface DataSource {
  id: string;
  label: string;
  tableName: string;
  description: string;
  fields: SchemaField[];
  rows: QueryRow[];
}

export interface QueryRuleNode {
  id: NodeId;
  kind: "rule";
  field: string;
  operator: OperatorKey;
  value: QueryValue;
}

export interface QueryGroupNode {
  id: NodeId;
  kind: "group";
  logic: LogicOperator;
  childIds: NodeId[];
  collapsed: boolean;
}

export type QueryNode = QueryRuleNode | QueryGroupNode;

export interface QueryTreeState {
  sourceId: string;
  rootId: NodeId;
  nodes: Record<NodeId, QueryNode>;
  nextId: number;
}

export interface ValidationIssue {
  nodeId: NodeId;
  message: string;
}
