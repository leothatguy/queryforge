import { createInitialQueryState } from "@/lib/state/query-state";

export const queryPresets = [
  {
    id: "users-default-segments",
    label: "Qualified user segments",
    sourceId: "users",
    createState: () => createInitialQueryState("users"),
  },
  {
    id: "orders-default-review",
    label: "Orders review",
    sourceId: "orders",
    createState: () => createInitialQueryState("orders"),
  },
];
