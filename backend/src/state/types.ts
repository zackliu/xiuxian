import type {
  CharacterSheet,
  CultivationTechnique,
  CombatSkill,
  Treasure,
  StoryBeat,
  TimelineEvent,
  GameState,
  GameHistory
} from '@xiuxian/shared';

// Minimal normalized view over existing shared types
export type EntityId = string;

export interface SegmentedHistory {
  characters: Record<EntityId, CharacterSheet>;
  techniques: Record<EntityId, CultivationTechnique>;
  skills?: Record<EntityId, CombatSkill>; // reserved; skills mostly live under characters
  treasures: Record<EntityId, Treasure>;
  storyBeats: StoryBeat[];
  timeline: TimelineEvent[];
}

export interface NameIndex {
  charactersByName: Record<string, EntityId>;
  techniquesByName: Record<string, EntityId>;
  treasuresByName: Record<string, EntityId>;
  // Location -> storyBeat ids where this location appears
  beatsByLocation: Record<string, EntityId[]>;
}

export interface KnowledgeBaseSnapshot {
  history: SegmentedHistory;
  index: NameIndex;
}

export interface ContextRequest {
  // The player command or UI intent
  command: string;
  // Current active story beat if any
  activeStory?: StoryBeat | null;
  // Optional hints from UI: names/ids mentioned explicitly
  hints?: {
    characterNames?: string[];
    characterIds?: string[];
    location?: string;
  };
  // Control budgets (approximate; used for selection sizes)
  budget?: {
    maxCharacters?: number;
    maxTechniquesPerChar?: number;
    maxTreasuresPerChar?: number;
    recentTimelineWindow?: number; // last N events always included
    recentStoryBeats?: number; // last N beats full text
    compressOlderBeatsAfter?: number; // beats older than the last N to compress
  };
}

export interface ContextSlice {
  activeStory?: StoryBeat | null;
  storyBeats: StoryBeat[]; // recent detailed beats
  storyBeatsSummary?: string; // summary of older/long-tail beats
  characters: CharacterSheet[];
  techniques: CultivationTechnique[];
  treasures: Treasure[];
  timelineRecent: TimelineEvent[];
}

export interface Summarizer {
  summarize(beats: StoryBeat[], maxTokens?: number): Promise<string>;
}

export interface KnowledgeBase {
  loadSnapshot(): Promise<KnowledgeBaseSnapshot>;
}

export interface StatePatch {
  newCharacters?: CharacterSheet[];
  updatedCharacters?: Partial<CharacterSheet & { id: string }>[];
  newTechniques?: CultivationTechnique[];
  newTreasures?: Treasure[];
  newStoryBeats?: StoryBeat[];
  newTimeline?: TimelineEvent[];
}

export interface PatchApplier {
  apply(patch: StatePatch): Promise<void>;
}

export type MigrationInput = { state: GameState; history: GameHistory };

