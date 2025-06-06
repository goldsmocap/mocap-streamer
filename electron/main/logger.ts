import { Logger } from "./types.js";

export function debouncedLogger(debounceMS: number, logger: Logger) {
  return (prefix: string): Logger => {
    const recentMessages: Set<string> = new Set();
    return (message) => {
      const serialised = `${message.type}:${message.text}`;
      if (!recentMessages.has(serialised)) {
        recentMessages.add(serialised);
        logger({ ...message, text: `[${prefix}] ${message.text}` });
        setTimeout(() => recentMessages.delete(serialised), debounceMS);
      }
    };
  };
}
