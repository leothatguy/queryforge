"use client";

import { memo } from "react";

import { getOperatorsForField, operatorDefinitions } from "@/lib/query/operators";
import type { DataSource, QueryRuleNode, QueryScalar, QueryValue } from "@/lib/query/types";
import type { QueryAction } from "@/lib/state/query-state";
import { getFieldByKey } from "@/lib/schemas/catalog";

interface QueryRuleRowProps {
  rule: QueryRuleNode;
  source: DataSource;
  dispatch: React.Dispatch<QueryAction>;
}

function getInputType(fieldType: string) {
  if (fieldType === "number") {
    return "number";
  }

  if (fieldType === "date") {
    return "date";
  }

  return "text";
}

function toInputValue(value: QueryScalar) {
  return value === null ? "" : String(value);
}

function coerceInputValue(rawValue: string, fieldType: string): QueryScalar {
  if (fieldType === "number") {
    return rawValue === "" ? "" : Number(rawValue);
  }

  if (fieldType === "boolean") {
    return rawValue === "true";
  }

  return rawValue;
}

function updateRangeValue(
  currentValue: QueryValue,
  index: number,
  rawValue: string,
  fieldType: string,
) {
  const nextValue = Array.isArray(currentValue) ? [...currentValue] : ["", ""];
  nextValue[index] = coerceInputValue(rawValue, fieldType);
  return nextValue;
}

function ValueControl({ rule, source, dispatch }: QueryRuleRowProps) {
  const field = getFieldByKey(source.fields, rule.field) ?? source.fields[0];
  const operator = operatorDefinitions[rule.operator];

  if (operator.input === "none") {
    return <span className="empty-state">NULL check</span>;
  }

  if (operator.input === "range") {
    const values = Array.isArray(rule.value) ? rule.value : ["", ""];

    return (
      <div className="value-range">
        <input
          aria-label={`${field.label} start`}
          className="input"
          type={getInputType(field.type)}
          value={toInputValue(values[0] ?? "")}
          onChange={(event) =>
            dispatch({
              type: "update-rule-value",
              nodeId: rule.id,
              value: updateRangeValue(rule.value, 0, event.target.value, field.type),
            })
          }
        />
        <input
          aria-label={`${field.label} end`}
          className="input"
          type={getInputType(field.type)}
          value={toInputValue(values[1] ?? "")}
          onChange={(event) =>
            dispatch({
              type: "update-rule-value",
              nodeId: rule.id,
              value: updateRangeValue(rule.value, 1, event.target.value, field.type),
            })
          }
        />
      </div>
    );
  }

  if (operator.input === "list" && field.type === "enum") {
    const values = new Set((Array.isArray(rule.value) ? rule.value : []).map(String));

    return (
      <div className="checkbox-grid">
        {field.options?.map((option) => (
          <label className="checkbox-option" key={option.value}>
            <input
              checked={values.has(option.value)}
              type="checkbox"
              onChange={(event) => {
                const nextValues = new Set(values);

                if (event.target.checked) {
                  nextValues.add(option.value);
                } else {
                  nextValues.delete(option.value);
                }

                dispatch({
                  type: "update-rule-value",
                  nodeId: rule.id,
                  value: Array.from(nextValues),
                });
              }}
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  }

  if (operator.input === "list") {
    return (
      <input
        aria-label={`${field.label} values`}
        className="input"
        value={(Array.isArray(rule.value) ? rule.value : []).join(", ")}
        onChange={(event) =>
          dispatch({
            type: "update-rule-value",
            nodeId: rule.id,
            value: event.target.value
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean)
              .map((value) => coerceInputValue(value, field.type)),
          })
        }
      />
    );
  }

  if (field.type === "enum") {
    return (
      <select
        aria-label={`${field.label} value`}
        className="select"
        value={String(rule.value)}
        onChange={(event) =>
          dispatch({
            type: "update-rule-value",
            nodeId: rule.id,
            value: event.target.value,
          })
        }
      >
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "boolean") {
    return (
      <select
        aria-label={`${field.label} value`}
        className="select"
        value={String(rule.value)}
        onChange={(event) =>
          dispatch({
            type: "update-rule-value",
            nodeId: rule.id,
            value: event.target.value === "true",
          })
        }
      >
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    );
  }

  return (
    <input
      aria-label={`${field.label} value`}
      className="input"
      type={getInputType(field.type)}
      value={toInputValue(rule.value as QueryScalar)}
      onChange={(event) =>
        dispatch({
          type: "update-rule-value",
          nodeId: rule.id,
          value: coerceInputValue(event.target.value, field.type),
        })
      }
    />
  );
}

export const QueryRuleRow = memo(function QueryRuleRow({ rule, source, dispatch }: QueryRuleRowProps) {
  const field = getFieldByKey(source.fields, rule.field) ?? source.fields[0];
  const operatorOptions = getOperatorsForField(field.type);

  return (
    <div className="rule-row">
      <select
        aria-label="Field"
        className="select"
        value={rule.field}
        onChange={(event) =>
          dispatch({ type: "update-rule-field", nodeId: rule.id, field: event.target.value })
        }
      >
        {source.fields.map((schemaField) => (
          <option key={schemaField.key} value={schemaField.key}>
            {schemaField.label}
          </option>
        ))}
      </select>
      <select
        aria-label="Operator"
        className="select"
        value={rule.operator}
        onChange={(event) =>
          dispatch({
            type: "update-rule-operator",
            nodeId: rule.id,
            operator: event.target.value as QueryRuleNode["operator"],
          })
        }
      >
        {operatorOptions.map((operator) => (
          <option key={operator.key} value={operator.key}>
            {operator.label}
          </option>
        ))}
      </select>
      <ValueControl dispatch={dispatch} rule={rule} source={source} />
      <button
        aria-label="Remove rule"
        className="icon-button"
        type="button"
        onClick={() => dispatch({ type: "remove-node", nodeId: rule.id })}
      >
        Remove
      </button>
    </div>
  );
});
