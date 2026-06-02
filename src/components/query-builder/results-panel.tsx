import type { DataSource, QueryRow } from "@/lib/query/types";

interface ResultsPanelProps {
  source: DataSource;
  results: QueryRow[];
  isExecuting: boolean;
  hasExecuted: boolean;
}

export function ResultsPanel({ source, results, isExecuting, hasExecuted }: ResultsPanelProps) {
  const visibleFields = source.fields.slice(0, 6);

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
        <div className="results-table-wrap">
          <table className="results-table">
            <thead>
              <tr>
                {visibleFields.map((field) => (
                  <th key={field.key}>{field.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 10).map((row, index) => (
                <tr key={`${row.id ?? index}`}>
                  {visibleFields.map((field) => (
                    <td key={field.key}>{String(row[field.key] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
