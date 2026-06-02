import type { QueryRow, SchemaField } from "@/lib/query/types";

export type SortDirection = "asc" | "desc";

export interface ResultSort {
  field: string;
  direction: SortDirection;
}

function compareValues(leftValue: unknown, rightValue: unknown, fieldType: SchemaField["type"]) {
  if (leftValue === rightValue) {
    return 0;
  }

  if (leftValue === null || leftValue === undefined || leftValue === "") {
    return 1;
  }

  if (rightValue === null || rightValue === undefined || rightValue === "") {
    return -1;
  }

  if (fieldType === "number") {
    return Number(leftValue) - Number(rightValue);
  }

  if (fieldType === "date") {
    return Date.parse(String(leftValue)) - Date.parse(String(rightValue));
  }

  if (fieldType === "boolean") {
    return Number(Boolean(leftValue)) - Number(Boolean(rightValue));
  }

  return String(leftValue).localeCompare(String(rightValue), undefined, {
    sensitivity: "base",
    numeric: true,
  });
}

export function sortQueryRows(rows: QueryRow[], fields: SchemaField[], sort: ResultSort) {
  const field = fields.find((schemaField) => schemaField.key === sort.field);

  if (!field) {
    return [...rows];
  }

  const directionFactor = sort.direction === "asc" ? 1 : -1;

  return [...rows].sort((leftRow, rightRow) => {
    return compareValues(leftRow[field.key], rightRow[field.key], field.type) * directionFactor;
  });
}

export function paginateRows<T>(rows: T[], page: number, pageSize: number) {
  const normalizedPageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(rows.length / normalizedPageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * normalizedPageSize;

  return {
    page: safePage,
    pageSize: normalizedPageSize,
    totalPages,
    rows: rows.slice(start, start + normalizedPageSize),
  };
}
