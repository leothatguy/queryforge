import type { QueryTreeState } from "@/lib/query/types";
import { parseImportedQueryState } from "@/lib/state/query-state";

export const SAVED_PRESETS_STORAGE_KEY = "queryforge.savedPresets";
export const MAX_SAVED_PRESETS = 12;

export interface SavedQueryPreset {
  id: string;
  label: string;
  sourceId: string;
  createdAt: string;
  state: QueryTreeState;
}

function isSavedPresetCandidate(value: unknown): value is Omit<SavedQueryPreset, "state"> & {
  state: unknown;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.label === "string" &&
    typeof candidate.sourceId === "string" &&
    typeof candidate.createdAt === "string" &&
    Boolean(candidate.state)
  );
}

export function parseSavedQueryPresets(rawValue: string | null) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((candidate): SavedQueryPreset | null => {
        if (!isSavedPresetCandidate(candidate)) {
          return null;
        }

        const parsedState = parseImportedQueryState(JSON.stringify(candidate.state));

        if (!parsedState.ok || parsedState.state.sourceId !== candidate.sourceId) {
          return null;
        }

        return {
          id: candidate.id,
          label: candidate.label.slice(0, 80) || "Saved query",
          sourceId: candidate.sourceId,
          createdAt: candidate.createdAt,
          state: parsedState.state,
        };
      })
      .filter((preset): preset is SavedQueryPreset => Boolean(preset))
      .slice(0, MAX_SAVED_PRESETS);
  } catch {
    return [];
  }
}

export function createSavedQueryPreset(
  state: QueryTreeState,
  sourceLabel: string,
  existingCount: number,
): SavedQueryPreset {
  return {
    id: crypto.randomUUID(),
    label: `${sourceLabel} preset ${existingCount + 1}`,
    sourceId: state.sourceId,
    createdAt: new Date().toISOString(),
    state,
  };
}

export function serializeSavedQueryPresets(presets: SavedQueryPreset[]) {
  return JSON.stringify(presets.slice(0, MAX_SAVED_PRESETS));
}
