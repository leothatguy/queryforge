import { describe, expect, it, vi } from "vitest";
import {
  createSavedQueryPreset,
  parseSavedQueryPresets,
  serializeSavedQueryPresets,
} from "@/lib/presets/saved-presets";
import { createInitialQueryState } from "@/lib/state/query-state";

describe("saved query presets", () => {
  it("round trips valid saved presets", () => {
    const state = createInitialQueryState("users");
    const preset = {
      id: "preset-1",
      label: "Active buyers",
      sourceId: "users",
      createdAt: "2026-06-02T00:00:00.000Z",
      state,
    };

    expect(parseSavedQueryPresets(serializeSavedQueryPresets([preset]))).toEqual([preset]);
  });

  it("drops malformed or mismatched stored presets", () => {
    const state = createInitialQueryState("users");
    const rawValue = JSON.stringify([
      {
        id: "bad-source",
        label: "Bad source",
        sourceId: "orders",
        createdAt: "2026-06-02T00:00:00.000Z",
        state,
      },
      {
        id: "cyclic",
        label: "Cyclic",
        sourceId: "users",
        createdAt: "2026-06-02T00:00:00.000Z",
        state: {
          sourceId: "users",
          rootId: "group-root",
          nodes: {
            "group-root": {
              id: "group-root",
              kind: "group",
              logic: "AND",
              collapsed: false,
              childIds: ["group-root"],
            },
          },
        },
      },
    ]);

    expect(parseSavedQueryPresets(rawValue)).toEqual([]);
  });

  it("creates labels and timestamps for new presets", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-02T10:00:00.000Z"));
    vi.stubGlobal("crypto", {
      randomUUID: () => "preset-generated",
    });

    const preset = createSavedQueryPreset(createInitialQueryState("users"), "Users", 2);

    expect(preset.id).toBe("preset-generated");
    expect(preset.label).toBe("Users preset 3");
    expect(preset.createdAt).toBe("2026-06-02T10:00:00.000Z");

    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
});
