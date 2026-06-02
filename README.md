# QueryForge

QueryForge is a visual query builder for constructing nested database and API filters without writing raw query syntax. The scaffold uses Next.js App Router, TypeScript, Tailwind CSS, and a normalized query tree so recursive UI and query-engine work can scale cleanly.

## Stack Confirmation

The challenge explicitly requires Next.js App Router and TypeScript. This project is scaffolded on that baseline.

## Architecture

- `src/app`: App Router entry points and global styling.
- `src/components/query-builder`: Recursive builder UI, schema controls, previews, and result inspection.
- `src/lib/query`: Typed query models, operators, SQL/Mongo generation, validation, and local execution.
- `src/lib/state`: Normalized query-tree reducer with immutable add/remove/reorder/toggle/import actions.
- `src/lib/schemas`: Data-source definitions that drive fields, operators, inputs, and mock rows.
- `src/lib/presets`: Saved query presets.

## Recursive Rendering Strategy

Every group node stores ordered child IDs. `QueryGroup` renders a group by ID, then recursively renders nested group children while rule children render through `QueryRuleRow`. The reducer keeps node data normalized so deep edits only replace the affected node maps and ordered child arrays.

## Query Engine

The engine validates a tree before execution, generates SQL-like syntax and Mongo-style objects from the same source state, and evaluates rules against mock datasets. Operators are field-type aware, which keeps incompatible controls out of the UI and gives the validator a single source of truth.

## Performance Notes

The shell derives validation, generated previews, and result tables with memoized selectors. Recursive child rendering is isolated by node ID, and state updates are immutable and narrowly scoped around the edited subtree.

## Workflow Plan

Use feature branches and PRs into `main`. A reasonable seven-PR split:

1. Scaffold and base query model.
2. Query engine, validation, and tests.
3. Recursive rule/group UI.
4. Drag-and-drop, keyboard shortcuts, and collapse behavior.
5. Query history, presets, import/export.
6. Result simulator, pagination, sorting, and performance work.
7. README, deployment, polish, and demo assets.

## Local Development

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.
