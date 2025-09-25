import type { CharacterSheet, StoryBeat, TimelineEvent, CultivationTechnique, Treasure } from '@xiuxian/shared';
import type { ContextRequest, ContextSlice, KnowledgeBase, Summarizer, NameIndex } from '../state/types.js';
import { contextConfig } from '../config/contextConfig.js';

export class ContextBuilder {
  constructor(private readonly kb: KnowledgeBase, private readonly summarizer: Summarizer) {}

  async build(req: ContextRequest): Promise<ContextSlice> {
    const snapshot = await this.kb.loadSnapshot();
    const budget = { ...contextConfig.defaultBudget, ...(req.budget ?? {}) };
    const history = snapshot.history;

    const activeStory = req.activeStory ?? history.storyBeats[history.storyBeats.length - 1] ?? null;
    const recentBeats = history.storyBeats.slice(-budget.recentStoryBeats);
    const olderBeats = history.storyBeats.slice(0, Math.max(0, history.storyBeats.length - budget.compressOlderBeatsAfter));
    const storyBeatsSummary = olderBeats.length > 0 ? await this.summarizer.summarize(olderBeats, 300) : undefined;

    const characterIds = this.collectRelevantCharacterIds(req, activeStory, snapshot.index);
    const characters = this.pickCharacters(characterIds, history.characters, budget.maxCharacters);
    const techniques = this.collectTechniques(characters, budget.maxTechniquesPerChar);
    const treasures = this.collectTreasures(characters, budget.maxTreasuresPerChar);
    const timelineRecent = history.timeline.slice(-budget.recentTimelineWindow);

    return {
      activeStory,
      storyBeats: recentBeats,
      storyBeatsSummary,
      characters,
      techniques,
      treasures,
      timelineRecent
    } satisfies ContextSlice;
  }

  private collectRelevantCharacterIds(
    req: ContextRequest,
    activeStory: StoryBeat | null | undefined,
    index: NameIndex
  ): string[] {
    const set = new Set<string>();
    if (activeStory) for (const id of activeStory.involvedCharacterIds) set.add(id);

    // Use name index for hints
    const hintedNames = req.hints?.characterNames ?? [];
    for (const name of hintedNames) {
      const id = index.charactersByName[name];
      if (id) set.add(id);
    }
    const hintedIds = req.hints?.characterIds ?? [];
    for (const id of hintedIds) set.add(id);

    // Simple heuristic: find names mentioned in command that appear exactly in index
    const cmd = req.command || '';
    for (const [name, id] of Object.entries(index.charactersByName)) {
      if (cmd.includes(name)) set.add(id);
    }

    return Array.from(set);
  }

  private pickCharacters(
    ids: string[],
    record: Record<string, CharacterSheet>,
    max: number
  ): CharacterSheet[] {
    const selected: CharacterSheet[] = [];
    for (const id of ids) {
      const c = record[id];
      if (c) selected.push(c);
      if (selected.length >= max) break;
    }
    return selected;
  }

  private collectTechniques(chars: CharacterSheet[], maxPer: number): CultivationTechnique[] {
    const out: CultivationTechnique[] = [];
    for (const c of chars) out.push(...c.cultivationTechniques.slice(0, maxPer));
    return out;
  }

  private collectTreasures(chars: CharacterSheet[], maxPer: number): Treasure[] {
    const out: Treasure[] = [];
    for (const c of chars) out.push(...c.equippedTreasures.slice(0, maxPer));
    return out;
  }
}

// A deterministic fallback summarizer useful in tests and offline contexts
export class SimpleSummarizer implements Summarizer {
  async summarize(beats: StoryBeat[], _maxTokens?: number): Promise<string> {
    if (beats.length === 0) return '';
    const first = beats[0];
    const last = beats[beats.length - 1];
    return `Story so far: ${beats.length} beats from ${first.location} to ${last.location}. Key: ${first.title}; ...; ${last.title}.`;
  }
}
