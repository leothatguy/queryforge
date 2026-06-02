/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryBuilderShell } from "./query-builder-shell";

describe("QueryBuilderShell", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    vi.unstubAllGlobals();
  });

  it("renders nested recursive rules and appends root rules", async () => {
    const user = userEvent.setup();

    render(<QueryBuilderShell />);

    expect(screen.getAllByLabelText("Field")).toHaveLength(4);

    await user.click(screen.getByRole("button", { name: "Add Root Rule" }));

    expect(screen.getAllByLabelText("Field")).toHaveLength(5);
  });

  it("updates operators and controls from the selected schema field", async () => {
    const user = userEvent.setup();

    render(<QueryBuilderShell />);

    await user.selectOptions(screen.getAllByLabelText("Field")[0], "createdAt");

    expect(screen.getAllByLabelText("Operator")[0]).toHaveValue("after");
    expect(screen.getByLabelText("Created at value")).toHaveAttribute("type", "date");
  });

  it("collapses and expands recursive groups", async () => {
    const user = userEvent.setup();

    render(<QueryBuilderShell />);

    await user.click(screen.getAllByRole("button", { name: "Collapse" })[0]);

    expect(screen.queryAllByLabelText("Field")).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Expand" }));

    expect(screen.getAllByLabelText("Field")).toHaveLength(4);
  });

  it("executes the visual query and renders matching rows", async () => {
    const user = userEvent.setup();

    render(<QueryBuilderShell />);

    await user.click(screen.getByRole("button", { name: "Execute" }));

    await waitFor(() => {
      expect(screen.getByText("Maya Patel")).toBeInTheDocument();
    });
  });

  it("saves and restores user presets", async () => {
    const user = userEvent.setup();

    vi.stubGlobal("crypto", {
      randomUUID: () => "preset-1",
    });

    render(<QueryBuilderShell />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Users preset 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add Root Rule" }));

    expect(screen.getAllByLabelText("Field")).toHaveLength(5);

    await user.click(screen.getByRole("button", { name: "Restore" }));

    expect(screen.getAllByLabelText("Field")).toHaveLength(4);
  });
});
