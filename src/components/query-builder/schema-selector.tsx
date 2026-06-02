import type { DataSource } from "@/lib/query/types";

interface SchemaSelectorProps {
  sources: DataSource[];
  selectedSourceId: string;
  onChange: (sourceId: string) => void;
}

export function SchemaSelector({ sources, selectedSourceId, onChange }: SchemaSelectorProps) {
  const selectedSource = sources.find((source) => source.id === selectedSourceId) ?? sources[0];

  return (
    <div className="panel-section">
      <div className="panel-title">Data Source</div>
      <select
        aria-label="Data source"
        className="select"
        value={selectedSourceId}
        onChange={(event) => onChange(event.target.value)}
      >
        {sources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.label}
          </option>
        ))}
      </select>
      <p className="subtle">{selectedSource.description}</p>
      <ul className="schema-fields">
        {selectedSource.fields.map((field) => (
          <li className="schema-field" key={field.key}>
            <span>{field.label}</span>
            <span className="type-pill">{field.type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
