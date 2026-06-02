"use client";

import { useState } from "react";
import { paginateRows, sortQueryRows, type ResultSort } from "@/lib/query/results";
import type { DataSource, QueryRow } from "@/lib/query/types";

interface ResultsPanelProps {
  source: DataSource;
  results: QueryRow[];
  isExecuting: boolean;
  hasExecuted: boolean;
}

export function ResultsPanel({ source, results, isExecuting, hasExecuted }: ResultsPanelProps) {
  const visibleFields = source.fields.slice(0, 6);
  const [sort, setSort] = useState<ResultSort>({
    field: visibleFields[0]?.key ?? "id",
    direction: "asc",
  });
  const [page, setPage] = useState(1);
  const activeSortField = visibleFields.some((field) => field.key === sort.field)
    ? sort.field
    : (visibleFields[0]?.key ?? "id");
  const activeSortDirection =
    activeSortField === sort.field ? sort.direction : ("asc" as const);
  const sortedResults = sortQueryRows(results, source.fields, {
    field: activeSortField,
    direction: activeSortDirection,
  });
  const paginatedResults = paginateRows(sortedResults, page, 5);

  function toggleSort(field: string) {
    setSort((currentSort) => ({
      field,
      direction:
        currentSort.field === field && currentSort.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  }

  return (
    <div className="panel-section results-panel">
      <div className="panel-title">
        Results
        <span className="count-pill">{results.length}</span>
      </div>
      {isExecuting ? (
        <div className="empty-state">Running query...</div>
      ) : null}
      {!isExecuting && !hasExecuted ? <div className="empty-state">No execution yet.</div> : null}
      {!isExecuting && hasExecuted && results.length === 0 ? (
        <div className="empty-state">No matching rows.</div>
      ) : null}
      {!isExecuting && results.length > 0 ? (
        <>
        <div className="results-table-wrap">
          <table className="results-table">
            <thead>
              <tr>
                {visibleFields.map((field) => (
                  <th key={field.key}>
                    <button
                      className="table-sort-button"
                      type="button"
                      onClick={() => toggleSort(field.key)}
                    >
                      {field.label}
                      {activeSortField === field.key ? (
                        <span aria-hidden>{activeSortDirection === "asc" ? " ^" : " v"}</span>
                      ) : null}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedResults.rows.map((row, index) => (
                <tr key={`${row.id ?? index}`}>
                  {visibleFields.map((field) => (
                    <td key={field.key}>{String(row[field.key] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-bar">
          <span className="subtle">
            Page {paginatedResults.page} of {paginatedResults.totalPages}
          </span>
          <div className="toolbar">
            <button
              className="button-secondary"
              disabled={paginatedResults.page === 1}
              type="button"
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              Previous
            </button>
            <button
              className="button-secondary"
              disabled={paginatedResults.page === paginatedResults.totalPages}
              type="button"
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
        </>
      ) : null}
    </div>
  );
}
