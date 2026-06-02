"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { executeQuery } from "@/lib/query/evaluate";
import { generateSqlQuery, stringifyMongoQuery } from "@/lib/query/generate";
import type { QueryRow, QueryTreeState } from "@/lib/query/types";
import { validateQueryState } from "@/lib/query/validate";
import { queryPresets } from "@/lib/presets/query-presets";
import {
  createSavedQueryPreset,
  MAX_SAVED_PRESETS,
  parseSavedQueryPresets,
  SAVED_PRESETS_STORAGE_KEY,
  type SavedQueryPreset,
  serializeSavedQueryPresets,
} from "@/lib/presets/saved-presets";
import { dataSources, getDataSourceById } from "@/lib/schemas/catalog";
import {
  createInitialQueryState,
  parseImportedQueryState,
  queryReducer,
} from "@/lib/state/query-state";
import { QueryGroup } from "./query-group";
import { QueryPreview } from "./query-preview";
import { ResultsPanel } from "./results-panel";
import { SchemaSelector } from "./schema-selector";

interface HistoryItem {
  id: string;
  label: string;
  state: QueryTreeState;
  resultCount: number;
}

export function QueryBuilderShell() {
  const [state, dispatch] = useReducer(queryReducer, undefined, () =>
    createInitialQueryState("users"),
  );
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [results, setResults] = useState<QueryRow[]>([]);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedPresets, setSavedPresets] = useState<SavedQueryPreset[]>([]);
  const [hasLoadedSavedPresets, setHasLoadedSavedPresets] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  const source = getDataSourceById(state.sourceId) ?? dataSources[0];
  const validationIssues = useMemo(() => validateQueryState(state, source), [source, state]);
  const sqlPreview = useMemo(() => generateSqlQuery(state, source), [source, state]);
  const mongoPreview = useMemo(() => stringifyMongoQuery(state, source), [source, state]);
  const exportText = useMemo(() => JSON.stringify(state, null, 2), [state]);
  const activePresets = queryPresets.filter((preset) => preset.sourceId === state.sourceId);
  const activeSavedPresets = savedPresets.filter(
    (preset) => preset.sourceId === state.sourceId,
  );

  const executeCurrentQuery = useCallback(() => {
    setIsExecuting(true);

    window.setTimeout(() => {
      const nextResults = validationIssues.length === 0 ? executeQuery(state, source) : [];
      setResults(nextResults);
      setHasExecuted(true);
      setIsExecuting(false);
      setHistory((items) => [
        {
          id: crypto.randomUUID(),
          label: `${source.label} query`,
          resultCount: nextResults.length,
          state,
        },
        ...items,
      ].slice(0, 8));
    }, 320);
  }, [source, state, validationIssues.length]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSavedPresets(parseSavedQueryPresets(localStorage.getItem(SAVED_PRESETS_STORAGE_KEY)));
      setHasLoadedSavedPresets(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedPresets) {
      return;
    }

    localStorage.setItem(SAVED_PRESETS_STORAGE_KEY, serializeSavedQueryPresets(savedPresets));
  }, [hasLoadedSavedPresets, savedPresets]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        executeCurrentQuery();
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        dispatch({ type: "add-rule", parentId: state.rootId });
      }

      if (event.key.toLowerCase() === "g") {
        event.preventDefault();
        dispatch({ type: "add-group", parentId: state.rootId });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [executeCurrentQuery, state.rootId]);

  function importQuery() {
    const result = parseImportedQueryState(importText);

    if (!result.ok) {
      setImportError(result.error);
      return;
    }

    setImportError("");
    setImportText("");
    setResults([]);
    setHasExecuted(false);
    dispatch({ type: "replace-state", state: result.state });
  }

  function restoreQueryState(nextState: QueryTreeState) {
    setResults([]);
    setHasExecuted(false);
    dispatch({ type: "replace-state", state: nextState });
  }

  function saveCurrentQueryPreset() {
    setSavedPresets((items) => [
      createSavedQueryPreset(state, source.label, activeSavedPresets.length),
      ...items,
    ].slice(0, MAX_SAVED_PRESETS));
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">QF</span>
          <div>
            <h1>QueryForge</h1>
            <p>Visual query builder</p>
          </div>
        </div>
        <div className="toolbar">
          <button
            className="button-secondary"
            type="button"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>
          <button
            className="button"
            disabled={isExecuting || validationIssues.length > 0}
            type="button"
            onClick={executeCurrentQuery}
          >
            Execute
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="panel">
          <SchemaSelector
            onChange={(sourceId) => {
              setResults([]);
              setHasExecuted(false);
              dispatch({ type: "set-source", sourceId });
            }}
            selectedSourceId={state.sourceId}
            sources={dataSources}
          />
          <div className="panel-section">
            <div className="panel-title">Presets</div>
            <ul className="preset-list">
              {activePresets.map((preset) => (
                <li className="preset-item" key={preset.id}>
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() => {
                      restoreQueryState(preset.createState());
                    }}
                  >
                    {preset.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel-section">
            <div className="panel-title">
              Saved Presets
              <button className="button-secondary" type="button" onClick={saveCurrentQueryPreset}>
                Save
              </button>
            </div>
            {activeSavedPresets.length === 0 ? (
              <div className="empty-state">No saved presets.</div>
            ) : null}
            <ul className="preset-list">
              {activeSavedPresets.map((preset) => (
                <li className="preset-item" key={preset.id}>
                  <div className="inline-fields">
                    <span>{preset.label}</span>
                    <span className="type-pill">{source.label}</span>
                  </div>
                  <div className="toolbar">
                    <button
                      className="button-secondary"
                      type="button"
                      onClick={() => restoreQueryState(preset.state)}
                    >
                      Restore
                    </button>
                    <button
                      className="button-danger"
                      type="button"
                      onClick={() =>
                        setSavedPresets((items) =>
                          items.filter((item) => item.id !== preset.id),
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel-section">
            <div className="panel-title">History</div>
            {history.length === 0 ? <div className="empty-state">No history.</div> : null}
            <ul className="history-list">
              {history.map((item) => (
                <li className="history-item" key={item.id}>
                  <div className="inline-fields">
                    <span>{item.label}</span>
                    <span className="count-pill">{item.resultCount}</span>
                  </div>
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() => dispatch({ type: "replace-state", state: item.state })}
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="panel builder-panel">
          <div className="builder-header">
            <div>
              <h2>{source.label}</h2>
              <p>{source.tableName}</p>
            </div>
            <div className="toolbar">
              <span className={validationIssues.length ? "status-pill warn" : "status-pill"}>
                {validationIssues.length ? "Needs fixes" : "Valid"}
              </span>
              <button
                className="button-secondary"
                type="button"
                onClick={() => dispatch({ type: "add-rule", parentId: state.rootId })}
              >
                Add Root Rule
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={() => dispatch({ type: "add-group", parentId: state.rootId })}
              >
                Add Root Group
              </button>
            </div>
          </div>
          <div className="builder-canvas">
            <QueryGroup
              dispatch={dispatch}
              groupId={state.rootId}
              rootId={state.rootId}
              source={source}
              state={state}
            />
          </div>
        </section>

        <aside className="panel inspector-panel">
          <QueryPreview mongo={mongoPreview} sql={sqlPreview} />
          <div className="panel-section">
            <div className="panel-title">Validation</div>
            {validationIssues.length === 0 ? (
              <div className="empty-state">Valid query.</div>
            ) : (
              <ul className="issue-list">
                {validationIssues.map((issue) => (
                  <li className="issue-item" key={`${issue.nodeId}-${issue.message}`}>
                    {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ResultsPanel
            hasExecuted={hasExecuted}
            isExecuting={isExecuting}
            results={results}
            source={source}
          />
          <div className="panel-section">
            <div className="panel-title">Export</div>
            <textarea className="textarea" readOnly value={exportText} />
          </div>
          <div className="panel-section">
            <div className="panel-title">Import</div>
            <textarea
              className="textarea"
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
            />
            {importError ? <p className="issue-item">{importError}</p> : null}
            <button className="button-secondary" type="button" onClick={importQuery}>
              Import JSON
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
