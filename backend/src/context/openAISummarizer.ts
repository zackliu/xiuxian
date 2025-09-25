import type { StoryBeat } from '@xiuxian/shared';
import type { Summarizer } from '../state/types.js';
import { getOpenAIClient, getOpenAIModel } from '../ai/openAIClient.js';

export class OpenAISummarizer implements Summarizer {
  async summarize(beats: StoryBeat[], maxTokens = 300): Promise<string> {
    if (beats.length === 0) return '';
    const client = getOpenAIClient();
    const text = beats
      .map((b) => `- [${b.location}] ${b.title}: ${b.summary}`)
      .join('\n');

    const resp = await client.chat.completions.create({
      model: getOpenAIModel(),
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'Summarize the long-past story beats into 2-3 concise bullet lines in Chinese.' },
        { role: 'user', content: text }
      ],
      max_tokens: maxTokens
    });
    return resp.choices[0]?.message?.content ?? '';
  }
}

