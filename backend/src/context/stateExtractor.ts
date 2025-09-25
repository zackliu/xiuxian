import { z } from 'zod';
import type { CharacterSheet, CultivationTechnique, Treasure, StoryBeat, TimelineEvent } from '@xiuxian/shared';
import type { StatePatch } from '../state/types.js';

// Define a flexible schema for AI-produced updates
const CharacterUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  realm: z.string().optional(),
  attributes: z.record(z.number()).optional(),
  reputation: z.record(z.number()).optional(),
  history: z.array(z.string()).optional()
}) as unknown as z.ZodType<Partial<CharacterSheet> & { id: string }>;

const TechniqueSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  tier: z.string(),
  subGrade: z.string(),
  focus: z.enum(['Body', 'Qi', 'Soul', 'Dual']),
  realmRequirement: z.string(),
  bonuses: z.record(z.number()).default({}),
  description: z.string().default('')
}) as unknown as z.ZodType<CultivationTechnique>;

const TreasureSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  tier: z.string(),
  subGrade: z.string(),
  slot: z.enum(['weapon', 'armor', 'accessory', 'artifact']),
  bonuses: z.record(z.number()).default({}),
  specialEffect: z.string().optional(),
  lore: z.string().default('')
}) as unknown as z.ZodType<Treasure>;

const StoryBeatSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  summary: z.string(),
  involvedCharacterIds: z.array(z.string()).default([]),
  location: z.string(),
  tension: z.coerce.number(),
  nextOptions: z
    .array(
      z.object({
        id: z.string().optional(),
        description: z.string(),
        consequences: z.array(z.string()).default([])
      })
    )
    .default([])
}) as unknown as z.ZodType<StoryBeat>;

const TimelineEventSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['story', 'battle', 'discovery', 'relationship']),
  description: z.string(),
  timestamp: z.coerce.number(),
  relatedIds: z.array(z.string()).default([])
}) as unknown as z.ZodType<TimelineEvent>;

const PatchSchema = z.object({
  newCharacters: z.array(z.any()).optional(),
  updatedCharacters: z.array(CharacterUpdateSchema).optional(),
  newTechniques: z.array(TechniqueSchema).optional(),
  newTreasures: z.array(TreasureSchema).optional(),
  newStoryBeats: z.array(StoryBeatSchema).optional(),
  newTimeline: z.array(TimelineEventSchema).optional()
});

export type AIPatchJSON = z.infer<typeof PatchSchema>;

export function parsePatch(textOrJSON: string | unknown): StatePatch {
  let json: unknown = textOrJSON;
  if (typeof textOrJSON === 'string') {
    try {
      json = JSON.parse(textOrJSON);
    } catch {
      // If AI wrapped in markdown fences, try to strip
      const trimmed = textOrJSON.trim().replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
      json = JSON.parse(trimmed);
    }
  }
  const parsed = PatchSchema.parse(json);

  // Thin casting: underlying types already align with shared types in runtime
  return parsed as unknown as StatePatch;
}

