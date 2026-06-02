import { describe, expect, it } from "vitest";
import { paginateRows, sortQueryRows } from "@/lib/query/results";
import { getDataSourceById } from "@/lib/schemas/catalog";

const usersSource = getDataSourceById("users");

if (!usersSource) {
  throw new Error("Users data source is required for result tests.");
}

describe("result utilities", () => {
  it("sorts rows by number fields without mutating input", () => {
    const rows = usersSource.rows.slice(0, 3);
    const sortedRows = sortQueryRows(rows, usersSource.fields, {
      field: "age",
      direction: "desc",
    });

    expect(sortedRows.map((row) => row.age)).toEqual([34, 29, 17]);
    expect(rows.map((row) => row.age)).toEqual([29, 17, 34]);
  });

  it("sorts rows by date fields", () => {
    const sortedRows = sortQueryRows(usersSource.rows.slice(0, 3), usersSource.fields, {
      field: "createdAt",
      direction: "asc",
    });

    expect(sortedRows.map((row) => row.name)).toEqual([
      "Maya Patel",
      "Ada Okafor",
      "Tunde Bello",
    ]);
  });

  it("paginates rows and clamps invalid page input", () => {
    const page = paginateRows([1, 2, 3, 4, 5, 6], 9, 2);

    expect(page).toEqual({
      page: 3,
      pageSize: 2,
      totalPages: 3,
      rows: [5, 6],
    });
  });
});
