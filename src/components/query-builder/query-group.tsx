"use client";

import { useState } from "react";
import type { DataSource, NodeId, QueryGroupNode } from "@/lib/query/types";
import type { QueryAction } from "@/lib/state/query-state";
import { QueryRuleRow } from "./query-rule-row";

interface QueryGroupProps {
  groupId: NodeId;
  rootId: NodeId;
  source: DataSource;
  state: import("@/lib/query/types").QueryTreeState;
  dispatch: React.Dispatch<QueryAction>;
  depth?: number;
}

export function QueryGroup({
  groupId,
  rootId,
  source,
  state,
  dispatch,
  depth = 0,
}: QueryGroupProps) {
  const [draggingChildId, setDraggingChildId] = useState<NodeId | null>(null);
  const group = state.nodes[groupId];

  if (!group || group.kind !== "group") {
    return null;
  }

  const canRemove = group.id !== rootId;

  return (
    <div className="group" style={{ marginLeft: depth ? 8 : 0 }}>
      <div className="group-header">
        <div className="group-meta">
          <select
            aria-label="Group logic"
            className="select"
            value={group.logic}
            onChange={(event) =>
              dispatch({
                type: "set-group-logic",
                groupId: group.id,
                logic: event.target.value as QueryGroupNode["logic"],
              })
            }
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
          <span className="count-pill">{group.childIds.length} nodes</span>
        </div>
        <div className="toolbar">
          <button
            className="button-secondary"
            type="button"
            onClick={() => dispatch({ type: "add-rule", parentId: group.id })}
          >
            Add Rule
          </button>
          <button
            className="button-secondary"
            type="button"
            onClick={() => dispatch({ type: "add-group", parentId: group.id })}
          >
            Add Group
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={() => dispatch({ type: "toggle-group", groupId: group.id })}
          >
            {group.collapsed ? "Expand" : "Collapse"}
          </button>
          {canRemove ? (
            <button
              className="button-danger"
              type="button"
              onClick={() => dispatch({ type: "remove-node", nodeId: group.id })}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      {!group.collapsed ? (
        <div className="group-children">
          {group.childIds.map((childId) => {
            const child = state.nodes[childId];

            if (!child) {
              return null;
            }

            return (
              <div
                className={`child-shell ${draggingChildId === childId ? "dragging" : ""}`}
                draggable
                key={childId}
                onDragOver={(event) => event.preventDefault()}
                onDragStart={(event) => {
                  event.stopPropagation();
                  setDraggingChildId(childId);
                }}
                onDragEnd={() => setDraggingChildId(null)}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  if (draggingChildId) {
                    dispatch({
                      type: "move-child",
                      parentId: group.id,
                      childId: draggingChildId,
                      targetId: childId,
                    });
                  }

                  setDraggingChildId(null);
                }}
              >
                <div aria-label="Drag to reorder" className="drag-handle" role="button">
                  ::
                </div>
                {child.kind === "group" ? (
                  <QueryGroup
                    depth={depth + 1}
                    dispatch={dispatch}
                    groupId={child.id}
                    rootId={rootId}
                    source={source}
                    state={state}
                  />
                ) : (
                  <QueryRuleRow dispatch={dispatch} rule={child} source={source} />
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
