// Central configuration for how much data to include in AI context
// Defaults favor generous windows; can be overridden at request time.

export interface ContextBudgetConfig {
  maxCharacters: number;
  maxTechniquesPerChar: number;
  maxTreasuresPerChar: number;
  recentTimelineWindow: number; // include last N timeline events
  recentStoryBeats: number; // include last N story beats with full details
  compressOlderBeatsAfter: number; // beats older than the last N will be summarized
}

const n = (v: string | undefined, fallback: number) => {
  const num = Number(v);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

export const contextConfig: { defaultBudget: ContextBudgetConfig } = {
  defaultBudget: {
    maxCharacters: n(process.env.CONTEXT_MAX_CHARACTERS, 12),
    maxTechniquesPerChar: n(process.env.CONTEXT_MAX_TECHNIQUES_PER_CHAR, 5),
    maxTreasuresPerChar: n(process.env.CONTEXT_MAX_TREASURES_PER_CHAR, 3),
    recentTimelineWindow: n(process.env.CONTEXT_RECENT_TIMELINE, 20),
    recentStoryBeats: n(process.env.CONTEXT_RECENT_BEATS, 20),
    compressOlderBeatsAfter: n(process.env.CONTEXT_COMPRESS_AFTER, 20)
  }
};

