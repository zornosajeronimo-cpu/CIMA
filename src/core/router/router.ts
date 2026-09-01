import type { Command } from '@/models';
import type { Intent, IntentType } from './intents';
import { INTENT_PATTERNS } from './intents';
import { HANDLERS } from './handlers';
import type { HandlerResult } from './handlers';

export function classifyIntent(text: string): Intent {
  const lower = text.toLowerCase();

  for (const pattern of INTENT_PATTERNS) {
    const matched = pattern.patterns.some(p => lower.includes(p));
    if (matched) {
      return {
        type: pattern.intentType,
        confidence: 'medium',
        entities: pattern.extractEntities ? pattern.extractEntities(text) : {},
        parameters: {},
      };
    }
  }

  return {
    type: 'UNKNOWN',
    confidence: 'low',
    entities: {},
    parameters: {},
  };
}

export function routeCommand(command: Command): { intent: Intent; result: HandlerResult } {
  const intent = classifyIntent(command.input);
  const handler = HANDLERS[intent.type as IntentType];
  const result = handler(intent, command.input);
  return { intent, result };
}
