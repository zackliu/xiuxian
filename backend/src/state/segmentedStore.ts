import { mkdir, readFile, writeFile } from 'fs/promises';
import { join, isAbsolute } from 'path';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type {
  KnowledgeBase,
  KnowledgeBaseSnapshot,
  NameIndex,
  SegmentedHistory,
  PatchApplier,
  StatePatch,
  MigrationInput
} from './types.js';

const SAVE_ROOT = isAbsolute(env.saveDir) ? env.saveDir : join(process.cwd(), env.saveDir);
const DEFAULT_NAMESPACE = 'default';

const fileNames = {
  characters: 'characters.json',
  techniques: 'techniques.json',
  treasures: 'treasures.json',
  storyBeats: 'storyBeats.json',
  timeline: 'timeline.json',
  index: 'index.json'
} as const;

export class SegmentedStore implements KnowledgeBase, PatchApplier {
  constructor(private readonly namespace = DEFAULT_NAMESPACE) {}

  private baseDir() {
    return join(SAVE_ROOT, this.namespace, 'segments');
  }

  private path(name: keyof typeof fileNames) {
    return join(this.baseDir(), fileNames[name]);
  }

  private async ensure() {
    await mkdir(this.baseDir(), { recursive: true });
  }

  async loadSnapshot(): Promise<KnowledgeBaseSnapshot> {
    await this.ensure();

    const history: SegmentedHistory = {
      characters: await this.readJson<Record<string, any>>(this.path('characters')) ?? {},
      techniques: await this.readJson<Record<string, any>>(this.path('techniques')) ?? {},
      treasures: await this.readJson<Record<string, any>>(this.path('treasures')) ?? {},
      storyBeats: await this.readJson<any[]>(this.path('storyBeats')) ?? [],
      timeline: await this.readJson<any[]>(this.path('timeline')) ?? []
    };

    const index: NameIndex = (await this.readJson<NameIndex>(this.path('index'))) ?? {
      charactersByName: {},
      techniquesByName: {},
      treasuresByName: {},
      beatsByLocation: {}
    };

    return { history, index };
  }

  async apply(patch: StatePatch): Promise<void> {
    const snapshot = await this.loadSnapshot();
    const { history } = snapshot;

    if (patch.newCharacters) {
      for (const c of patch.newCharacters) history.characters[c.id] = c;
    }
    if (patch.updatedCharacters) {
      for (const u of patch.updatedCharacters) {
        const existing = history.characters[u.id!];
        if (existing) history.characters[u.id!] = { ...existing, ...u } as any;
      }
    }
    if (patch.newTechniques) {
      for (const t of patch.newTechniques) history.techniques[t.id] = t;
    }
    if (patch.newTreasures) {
      for (const t of patch.newTreasures) history.treasures[t.id] = t;
    }
    if (patch.newStoryBeats) {
      history.storyBeats.push(...patch.newStoryBeats);
    }
    if (patch.newTimeline) {
      history.timeline.push(...patch.newTimeline);
    }

    await this.persist(history);
    await this.rebuildIndex(history);
  }

  async migrateFromWholeState(input: MigrationInput) {
    const { history } = input.state; // same as input.history, but keep single source
    const segmented: SegmentedHistory = {
      characters: history.characters,
      techniques: history.techniques,
      treasures: history.treasures,
      storyBeats: history.storyBeats,
      timeline: history.timeline
    };
    await this.persist(segmented);
    await this.rebuildIndex(segmented);
  }

  private async persist(history: SegmentedHistory) {
    await this.ensure();
    await Promise.all([
      this.writeJson(this.path('characters'), history.characters),
      this.writeJson(this.path('techniques'), history.techniques),
      this.writeJson(this.path('treasures'), history.treasures),
      this.writeJson(this.path('storyBeats'), history.storyBeats),
      this.writeJson(this.path('timeline'), history.timeline)
    ]);
  }

  private async rebuildIndex(history: SegmentedHistory) {
    const index: NameIndex = {
      charactersByName: {},
      techniquesByName: {},
      treasuresByName: {},
      beatsByLocation: {}
    };

    for (const c of Object.values(history.characters)) {
      index.charactersByName[c.name] = c.id;
    }
    for (const t of Object.values(history.techniques)) {
      index.techniquesByName[t.name] = t.id;
    }
    for (const t of Object.values(history.treasures)) {
      index.treasuresByName[t.name] = t.id;
    }
    for (const beat of history.storyBeats) {
      const list = index.beatsByLocation[beat.location] ?? [];
      list.push(beat.id);
      index.beatsByLocation[beat.location] = list;
    }

    await this.writeJson(this.path('index'), index);
  }

  private async readJson<T>(path: string): Promise<T | null> {
    try {
      const raw = await readFile(path, 'utf8');
      return JSON.parse(raw) as T;
    } catch (err) {
      return null;
    }
  }

  private async writeJson(path: string, data: unknown) {
    await writeFile(path, JSON.stringify(data, null, 2), 'utf8');
    logger.info('Segment written', { path });
  }
}

export const defaultSegmentedStore = new SegmentedStore();

