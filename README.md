# QueryForge

QueryForge is a visual query builder for constructing nested database and API filters without writing raw query syntax. It uses Next.js App Router, TypeScript, Tailwind CSS, recursive React components, and a normalized query tree so deeply nested query editing stays maintainable.

## Stack Confirmation

The challenge explicitly requires Next.js App Router and TypeScript. This project is scaffolded on that baseline.

## Architecture

- `src/app`: App Router entry points and global styling.
- `src/components/query-builder`: Recursive builder UI, schema controls, previews, and result inspection.
- `src/lib/query`: Typed query models, operators, SQL/Mongo generation, validation, and local execution.
- `src/lib/state`: Normalized query-tree reducer with immutable add/remove/reorder/toggle/import actions.
- `src/lib/schemas`: Data-source definitions that drive fields, operators, inputs, and mock rows.
- `src/lib/presets`: Static and user-saved query presets with validated local persistence.
- `src/test`: Shared Vitest and React Testing Library setup.

The application keeps query state independent from UI layout. Components dispatch typed actions, the reducer updates the normalized tree, and derived selectors generate previews, validation issues, and simulator results.

## Recursive Rendering Strategy

Every group node stores ordered child IDs. `QueryGroup` renders a group by ID, then recursively renders nested group children while rule children render through `QueryRuleRow`. This supports unlimited nesting because a group does not need to know whether it is at the root or deeply nested.

The reducer keeps node data normalized:

- `QueryGroupNode`: `logic`, `childIds`, and `collapsed`.
- `QueryRuleNode`: `field`, `operator`, and `value`.
- `QueryTreeState`: `rootId`, `sourceId`, `nodes`, and `nextId`.

This avoids copying an entire nested object graph for common edits. Removing a group collects the subtree IDs and rebuilds the node map without mutating the previous state.

## State Management

State is managed with `useReducer` and a typed `QueryAction` union. The current scope does not need an external store yet: query state is local to the builder, actions are explicit, and the reducer is covered by unit tests.

Important reducer operations:

- Add/remove rules and groups.
- Change group logic between `AND` and `OR`.
- Collapse or expand groups.
- Reorder siblings within a group.
- Reset operator/value when a field changes.
- Replace state from presets, history, or validated imports.

## Query Engine

The engine validates a tree before execution, generates SQL-like syntax and Mongo-style objects from the same source state, and evaluates rules against mock datasets. Operators are field-type aware, which keeps incompatible controls out of the UI and gives the validator a single source of truth.

Supported operators include:

- `equals`, `notEquals`
- `contains`, `startsWith`, `regex`
- `greaterThan`, `lessThan`, `between`
- `inArray`
- `isNull`, `isNotNull`
- `before`, `after`

The schema controls the available fields, allowed operators, and input type. Number fields render numeric controls, dates render date controls, booleans render true/false selects, and enums render constrained selections.

## Validation And Safety

Validation runs across the recursive tree and catches empty groups, missing nodes, incompatible operators, invalid ranges, invalid dates, invalid regex patterns, and unknown fields.

Imported JSON is parsed defensively before entering React state. The parser rejects unknown sources, malformed roots, invalid group metadata, incompatible rule operators, cyclic references, duplicate child references, and unreachable nodes.

## Performance Notes

The shell derives validation, generated previews, and query execution inputs with memoized selectors. Recursive child rendering is isolated by node ID, and state updates are immutable and narrowly scoped around the edited subtree.

Result inspection uses pure sorting and pagination helpers so large result sets can later be swapped to virtualization without changing query execution. The query tree shape also makes subtree-level memoization straightforward if deeper performance work is needed.

## Testing

Current test coverage uses Vitest and React Testing Library.

Covered areas:

- SQL and Mongo query generation.
- Mock query execution.
- Validation edge cases.
- Reducer actions and immutability.
- Import JSON safety.
- Saved preset parsing and serialization.
- Result sorting and pagination helpers.
- Recursive UI rendering and critical interactions.

Run checks:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## Deployment

The project includes `vercel.json` for Vercel deployment.

Expected deployment setup:

- Connect the GitHub repository to Vercel.
- Production branch: `main`.
- Preview deployments: every pull request.
- Build command: `pnpm build`.
- Install command: `pnpm install`.
- Framework preset: Next.js.

The live URL should be added here after the Vercel project is connected.

## Trade-Offs

- Native drag-and-drop is used for the first reorder implementation to keep the initial dependency surface small. DnD Kit can be added later if cross-container dragging or richer drag previews become necessary.
- Query state is local reducer state instead of Zustand/Jotai because the current app has one query workspace. An external store becomes more useful if multiple saved workspaces or collaboration are added.
- Result sorting runs in the client for mock execution. A real backend integration should push filtering, sorting, and pagination to the API layer.
- The SQL output is preview syntax, not a database execution layer. Values are escaped for display safety, and execution uses the local evaluator.

## Workflow Plan

Use feature branches and PRs into `main`. Do not push directly to `main`.

Implemented local branch sequence:

1. `feat/scaffold-queryforge`
2. `feat/query-engine-tests`
3. `feat/saved-query-presets`
4. `feat/result-inspector-controls`
5. `test/recursive-builder-ui`
6. `fix/import-validation-hardening`
7. `docs/submission-readme`

Commit format:

```text
prefix(category): describe change using exactly seven clear words
```

Example:

```text
feat(results): add sortable paginated query result inspector controls
```

## Local Development

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

## Demo Video Outline

Recommended recording flow:

1. Select a data source and show schema-driven controls.
2. Add nested `AND` and `OR` groups.
3. Reorder rules and collapse groups.
4. Show live SQL and Mongo previews.
5. Execute the query and inspect paginated results.
6. Save a preset, restore it, export JSON, and import it back.
7. Briefly show the test suite and Vercel deployment.
