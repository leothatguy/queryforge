"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { Save, Trash2, RotateCcw, Upload, Play, Plus, FolderPlus, Copy, Check } from "lucide-react";
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
  const [results, setResults] = useState<QueryRow[]>([]);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedPresets, setSavedPresets] = useState<SavedQueryPreset[]>([]);
  const [hasLoadedSavedPresets, setHasLoadedSavedPresets] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

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
        <Link href="/" className="brand" style={{ textDecoration: "none" }}>
          <img 
            src="/logo.png" 
            alt="QueryForge Logo" 
            className="brand-mark object-cover" 
          />
          <div>
            <h1>QueryForge</h1>
            <p>Visual query builder</p>
          </div>
        </Link>
        <div className="toolbar">
          <button
            className="button"
            disabled={isExecuting || validationIssues.length > 0}
            type="button"
            onClick={executeCurrentQuery}
            style={{ display: 'flex', gap: '8px' }}
          >
            <Play className="w-4 h-4" /> Execute
          </button>
        </div>
      </header>

      <div className="ide-layout">
        <div className="ide-main">
          <aside className="panel ide-sidebar">
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
                <li className="preset-item" key={preset.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                  <span className="text-sm font-medium">{preset.label}</span>
                  <button
                    className="icon-button"
                    title="Restore Preset"
                    type="button"
                    onClick={() => restoreQueryState(preset.createState())}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel-section">
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span>Saved Presets</span>
              <button className="icon-button" title="Save Preset" type="button" onClick={saveCurrentQueryPreset}>
                <Save className="w-4 h-4" />
              </button>
            </div>
            {activeSavedPresets.length === 0 ? (
              <div className="empty-state">No saved presets.</div>
            ) : null}
            <ul className="preset-list">
              {activeSavedPresets.map((preset) => (
                <li className="preset-item" key={preset.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="text-sm font-semibold">{preset.label}</span>
                    <span className="type-pill">{source.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="button-secondary"
                      style={{ flex: 1, display: 'flex', gap: '8px' }}
                      type="button"
                      onClick={() => restoreQueryState(preset.state)}
                    >
                      <RotateCcw className="w-4 h-4" /> Restore
                    </button>
                    <button
                      className="icon-button text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      title="Delete Preset"
                      type="button"
                      onClick={() =>
                        setSavedPresets((items) =>
                          items.filter((item) => item.id !== preset.id),
                        )
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel-section">
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span>History</span>
              {history.length > 0 && (
                <button 
                  className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-medium transition-colors bg-red-500/5 hover:bg-red-500/10 px-2 py-1 rounded"
                  onClick={() => setHistory([])}
                  title="Clear all history"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            {history.length === 0 ? <div className="empty-state">No history.</div> : null}
            <ul className="history-list">
              {history.map((item) => (
                <li className="history-item" key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="count-pill">{item.resultCount} results</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="button-secondary"
                      style={{ flex: 1, display: 'flex', gap: '8px', justifyContent: 'center' }}
                      type="button"
                      onClick={() => dispatch({ type: "replace-state", state: item.state })}
                    >
                      <RotateCcw className="w-4 h-4" /> Restore State
                    </button>
                    <button
                      className="icon-button text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300"
                      type="button"
                      title="Delete history entry"
                      onClick={() => setHistory((items) => items.filter((h) => h.id !== item.id))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel-section">
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span>Export (JSON)</span>
              <button 
                className={`icon-button transition-all duration-300 ${isCopied ? "text-green-400 border-green-500/50 bg-green-500/10" : ""}`} 
                title={isCopied ? "Copied!" : "Copy JSON"} 
                type="button" 
                onClick={() => {
                  navigator.clipboard.writeText(exportText);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
              >
                {isCopied ? <Check className="w-4 h-4 scale-110" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <textarea className="textarea" readOnly value={exportText} />
          </div>
          <div className="panel-section">
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span>Import</span>
              <button className="icon-button" title="Import JSON" type="button" onClick={importQuery}>
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <textarea
              className="textarea"
              placeholder="Paste JSON here..."
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
            />
            {importError ? <p className="issue-item" style={{ marginTop: '8px' }}>{importError}</p> : null}
          </div>
        </aside>

        <section className="panel ide-canvas builder-panel">
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
                className="icon-button"
                title="Add Root Rule"
                type="button"
                onClick={() => dispatch({ type: "add-rule", parentId: state.rootId })}
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                className="icon-button"
                title="Add Root Group"
                type="button"
                onClick={() => dispatch({ type: "add-group", parentId: state.rootId })}
              >
                <FolderPlus className="w-4 h-4" />
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
        </div>

        <div className="ide-bottom-panel">
          <aside className="panel" style={{ display: "flex", flexDirection: "column" }}>
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
          </aside>

          <div className="panel" style={{ display: "flex", flexDirection: "column" }}>
            <ResultsPanel
              hasExecuted={hasExecuted}
              isExecuting={isExecuting}
              results={results}
              source={source}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
