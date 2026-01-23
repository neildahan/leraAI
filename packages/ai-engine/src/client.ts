import Anthropic from '@anthropic-ai/sdk';
import { ClaudeClientOptions, StreamCallbacks } from './types.js';

export class ClaudeClient {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor(options: ClaudeClientOptions) {
    this.client = new Anthropic({ apiKey: options.apiKey });
    this.model = options.model || 'claude-sonnet-4-20250514';
    this.maxTokens = options.maxTokens || 4096;
  }

  async complete(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    return textContent?.type === 'text' ? textContent.text : '';
  }

  async completeWithStream(
    systemPrompt: string,
    userMessage: string,
    callbacks: StreamCallbacks,
  ): Promise<string> {
    let fullText = '';

    try {
      const stream = this.client.messages.stream({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const token = event.delta.text;
          fullText += token;
          callbacks.onToken?.(token);
        }
      }

      callbacks.onComplete?.(fullText);
      return fullText;
    } catch (error) {
      callbacks.onError?.(error as Error);
      throw error;
    }
  }

  async completeJson<T>(systemPrompt: string, userMessage: string): Promise<T> {
    const response = await this.complete(
      systemPrompt + '\n\nRespond with valid JSON only.',
      userMessage,
    );

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, response];
    const jsonStr = jsonMatch[1]?.trim() || response.trim();

    return JSON.parse(jsonStr) as T;
  }
}
