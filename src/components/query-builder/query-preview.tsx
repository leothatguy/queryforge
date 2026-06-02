interface QueryPreviewProps {
  sql: string;
  mongo: string;
}

export function QueryPreview({ sql, mongo }: QueryPreviewProps) {
  return (
    <div className="panel-section preview-grid">
      <div className="preview-block">
        <h3>SQL Preview</h3>
        <pre className="code-block">{sql}</pre>
      </div>
      <div className="preview-block">
        <h3>Mongo Preview</h3>
        <pre className="code-block">{mongo}</pre>
      </div>
    </div>
  );
}
