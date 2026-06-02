import { orderRows, userRows } from "@/lib/data/mock-datasets";
import type { DataSource, SchemaField } from "@/lib/query/types";

export const dataSources: DataSource[] = [
  {
    id: "users",
    label: "Users",
    tableName: "users",
    description: "Customer records with account status, plan, and purchase history.",
    fields: [
      { key: "name", label: "Name", type: "string" },
      { key: "age", label: "Age", type: "number" },
      {
        key: "country",
        label: "Country",
        type: "enum",
        options: [
          { label: "Nigeria", value: "Nigeria" },
          { label: "India", value: "India" },
          { label: "Mexico", value: "Mexico" },
          { label: "South Korea", value: "South Korea" },
          { label: "United States", value: "United States" },
        ],
      },
      {
        key: "status",
        label: "Status",
        type: "enum",
        options: [
          { label: "Active", value: "active" },
          { label: "Trial", value: "trial" },
          { label: "Inactive", value: "inactive" },
        ],
      },
      { key: "purchases", label: "Purchases", type: "number" },
      {
        key: "plan",
        label: "Plan",
        type: "enum",
        options: [
          { label: "Starter", value: "starter" },
          { label: "Pro", value: "pro" },
          { label: "Team", value: "team" },
          { label: "Enterprise", value: "enterprise" },
        ],
      },
      { key: "email", label: "Email", type: "string" },
      { key: "verified", label: "Verified", type: "boolean" },
      { key: "createdAt", label: "Created at", type: "date" },
    ],
    rows: userRows,
  },
  {
    id: "orders",
    label: "Orders",
    tableName: "orders",
    description: "Order records with payment status, totals, channel, and refund state.",
    fields: [
      { key: "customer", label: "Customer", type: "string" },
      { key: "total", label: "Total", type: "number" },
      {
        key: "currency",
        label: "Currency",
        type: "enum",
        options: [
          { label: "NGN", value: "NGN" },
          { label: "USD", value: "USD" },
        ],
      },
      {
        key: "status",
        label: "Status",
        type: "enum",
        options: [
          { label: "Paid", value: "paid" },
          { label: "Pending", value: "pending" },
          { label: "Cancelled", value: "cancelled" },
        ],
      },
      {
        key: "channel",
        label: "Channel",
        type: "enum",
        options: [
          { label: "Web", value: "web" },
          { label: "Mobile", value: "mobile" },
          { label: "Partner", value: "partner" },
        ],
      },
      { key: "createdAt", label: "Created at", type: "date" },
      { key: "refunded", label: "Refunded", type: "boolean" },
    ],
    rows: orderRows,
  },
];

export function getDataSourceById(sourceId: string) {
  return dataSources.find((source) => source.id === sourceId);
}

export function getFieldByKey(fields: SchemaField[], key: string) {
  return fields.find((field) => field.key === key);
}
