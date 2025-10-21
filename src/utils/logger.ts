import { isTauri } from '@tauri-apps/api/core';
import { warn, debug, trace, info, error } from '@tauri-apps/plugin-log';

// Log levels for better control
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

// Context interface for structured logging
interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  duration?: number;
  requestId?: string;
  [key: string]: any;
}

// Sensitive field names that should never be logged
const SENSITIVE_FIELDS = new Set([
  'password',
  'current_password',
  'new_password',
  'confirmPassword',
  'token',
  'access_token',
  'refresh_token',
  'auth_token',
  'api_key',
  'apiKey',
  'secret',
  'private_key',
  'privateKey',
  'totp',
  'recovery_code',
  'recoveryCode',
  'code',
  'otp',
  'pin',
  'ssn',
  'social_security_number',
  'credit_card',
  'creditCard',
  'card_number',
  'cvv',
  'security_code',
  'bank_account',
  'routing_number',
]);

// Sensitive patterns that should be redacted from any string
const SENSITIVE_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email patterns
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit card patterns
  /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, // SSN patterns
  /bearer\s+[a-zA-Z0-9._-]+/gi, // Bearer tokens
  /jwt\s+[a-zA-Z0-9._-]+/gi, // JWT tokens
];

const REDACTED = '[REDACTED]';

// Check if a field name is considered sensitive
const isSensitiveField = (fieldName: string): boolean => {
  const lowerFieldName = fieldName.toLowerCase();
  return (
    SENSITIVE_FIELDS.has(lowerFieldName)
    || lowerFieldName.includes('password')
    || lowerFieldName.includes('token')
    || lowerFieldName.includes('secret')
    || lowerFieldName.includes('key')
  );
};

// Sanitize a string by removing sensitive patterns
const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return str;

  let sanitized = str;
  SENSITIVE_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, REDACTED);
  });

  return sanitized;
};

// Recursively sanitize an object by removing or redacting sensitive fields
const sanitizeObject = (obj: any, maxDepth = 5): any => {
  if (maxDepth <= 0) {
    return '[MAX_DEPTH_REACHED]';
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, maxDepth - 1));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (isSensitiveField(key)) {
        sanitized[key] = REDACTED;
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value, maxDepth - 1);
      } else if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  return obj;
};

// Safely stringify objects for logging
const safeStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return '[UNABLE_TO_STRINGIFY]';
  }
};

class Logger {
  private currentLevel: LogLevel;
  private context: LogContext = {};

  constructor(level?: LogLevel) {
    this.currentLevel = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO;
    if (level !== undefined) {
      this.currentLevel = level;
    }
  }

  // Set global context (useful for user session, app state, etc.)
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  // Clear context
  clearContext(): void {
    this.context = {};
  }

  // Create a logger instance with specific context
  child(context: LogContext): Logger {
    const childLogger = new Logger(this.currentLevel);
    childLogger.context = { ...this.context, ...context };
    return childLogger;
  }

  private formatMessage(
    level: string,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const combinedContext = { ...this.context, ...context };
    const sanitizedContext = sanitizeObject(combinedContext);

    const contextStr =
      Object.keys(sanitizedContext).length > 0 ?
        ` [${Object.entries(sanitizedContext)
          .map(([k, v]) => {
            // Handle complex objects properly
            const valueStr =
              typeof v === 'object' && v !== null ?
                safeStringify(v)
              : String(v);
            return `${k}=${valueStr}`;
          })
          .join(', ')}]`
      : '';

    return `[${timestamp}] [${level}]${contextStr} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  trace(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.TRACE)) return;
    const sanitizedMessage = sanitizeString(message);
    const formatted = this.formatMessage('TRACE', sanitizedMessage, context);
    console.log(formatted);
    if (isTauri()) trace(formatted);
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const sanitizedMessage = sanitizeString(message);
    const formatted = this.formatMessage('DEBUG', sanitizedMessage, context);
    console.debug(formatted);
    if (isTauri()) debug(formatted);
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const sanitizedMessage = sanitizeString(message);
    const formatted = this.formatMessage('INFO', sanitizedMessage, context);
    console.info(formatted);
    if (isTauri()) info(formatted);
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    const sanitizedMessage = sanitizeString(message);
    const formatted = this.formatMessage('WARN', sanitizedMessage, context);
    console.warn(formatted);
    if (isTauri()) warn(formatted);
  }

  error(message: string, err?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    const sanitizedMessage = sanitizeString(message);
    const errorContext =
      err ?
        {
          error: err.message,
          stack: err.stack,
          ...context,
        }
      : context;
    const formatted = this.formatMessage(
      'ERROR',
      sanitizedMessage,
      errorContext,
    );
    console.error(formatted);
    if (isTauri()) {
      error(formatted);
    }
  }

  // Performance logging helpers
  time(label: string, context?: LogContext): void {
    const sanitizedLabel = sanitizeString(label);
    this.debug(`Timer started: ${sanitizedLabel}`, context);
    console.time(sanitizedLabel);
  }

  timeEnd(label: string, context?: LogContext): void {
    const sanitizedLabel = sanitizeString(label);
    console.timeEnd(sanitizedLabel);
    this.debug(`Timer ended: ${sanitizedLabel}`, context);
  }

  // Measure execution time of async functions
  async measure<T>(
    label: string,
    fn: () => Promise<T>,
    context?: LogContext,
  ): Promise<T> {
    const sanitizedLabel = sanitizeString(label);
    const start = performance.now();
    this.debug(`Starting ${sanitizedLabel}`, context);

    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.info(`${sanitizedLabel} completed`, {
        ...context,
        duration: Math.round(duration),
      });
      return result;
    } catch (err) {
      const duration = performance.now() - start;
      this.error(`${sanitizedLabel} failed`, err as Error, {
        ...context,
        duration: Math.round(duration),
      });
      throw err;
    }
  }
}

// Create global logger instance
export const logger = new Logger();

// Initialize logger (Legacy function to maintain compatibility
function forwardConsole(
  fnName: 'log' | 'debug' | 'info' | 'warn' | 'error',
  loggerFn: (message: string) => Promise<void>,
) {
  const original = import.meta.env.DEV ? console[fnName] : () => {};
  console[fnName] = (message: string) => {
    original(message);
    loggerFn(message);
  };
}

export const createLogger = () => {
  if (isTauri()) {
    if (import.meta.env.DEV) {
      forwardConsole('log', trace);
      forwardConsole('debug', debug);
    }
    forwardConsole('info', info);
    forwardConsole('warn', warn);
    forwardConsole('error', (message: string) => error(message));
  }
};

// Export factory functions for component-specific loggers
export const createComponentLogger = (componentName: string) => {
  return logger.child({ component: componentName });
};

export const createServiceLogger = (serviceName: string) => {
  return logger.child({ service: serviceName });
};

export const createStoreLogger = (storeName: string) => {
  return logger.child({ store: storeName });
};

// Export utility functions for advanced use cases
export { sanitizeObject, sanitizeString, isSensitiveField };

// Export types
export type { LogContext };
