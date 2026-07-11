// src/shared/utils/logging.ts
// Structured logger. Format: [MODULE] action — details

function formatMessage(
  module: string,
  action: string,
  details?: Record<string, unknown>
): string {
  const base = `[${module}] ${action}`;
  if (details && Object.keys(details).length > 0) {
    return `${base} — ${JSON.stringify(details)}`;
  }
  return base;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return JSON.stringify(error);
}

export const log = {
  info(module: string, action: string, details?: Record<string, unknown>): void {
    console.log(formatMessage(module, action, details));
  },

  error(
    module: string,
    action: string,
    error: unknown,
    details?: Record<string, unknown>
  ): void {
    const errorMessage = extractErrorMessage(error);
    const merged = { ...details, error: errorMessage };
    console.error(formatMessage(module, action, merged));
  },

  warn(module: string, action: string, details?: Record<string, unknown>): void {
    console.warn(formatMessage(module, action, details));
  },
};
