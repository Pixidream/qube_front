import { useCookies } from '@vueuse/integrations/useCookies.mjs';
import { logger } from './logger';

const cookieParserLogger = logger.child({ utility: 'cookieParser' });

export interface ParsedCookie {
  name: string;
  value: string;
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: boolean | 'none' | 'lax' | 'strict' | undefined;
    path?: string;
    domain?: string;
    maxAge?: number;
    expires?: Date;
  };
}

export const parseSetCookieHeader = (
  setCookieHeaders: string[],
): ParsedCookie[] => {
  cookieParserLogger.debug('Parsing Set-Cookie headers', {
    action: 'parse_cookies',
    headerCount: setCookieHeaders.length,
  });

  const cookies: ParsedCookie[] = [];

  setCookieHeaders.forEach((cookieString, index) => {
    const parts = cookieString.split(';').map((part) => part.trim());

    const [nameValue] = parts;
    const [name, value] = nameValue.split('=', 2);

    if (!name || value === undefined) {
      cookieParserLogger.warn('Invalid cookie format, skipping', {
        action: 'invalid_cookie',
        headerIndex: index,
        cookieString: cookieString.substring(0, 50) + '...', // Truncate for safety
      });
      return;
    }

    const options: ParsedCookie['options'] = {};

    parts.slice(1).forEach((attr) => {
      const [key, value] = attr.split('=', 2);
      const lowerKey = key.toLowerCase();

      switch (lowerKey) {
        case 'httponly':
          options.httpOnly = true;
          break;
        case 'secure':
          options.secure = true;
          break;
        case 'samesite':
          options.sameSite = value as
            | boolean
            | 'none'
            | 'lax'
            | 'strict'
            | undefined;
          break;
        case 'path':
          options.path = value;
          break;
        case 'domain':
          options.domain = value;
          break;
        case 'max-age':
          options.maxAge = parseInt(value, 10);
          break;
        case 'expires':
          options.expires = new Date(value);
          break;
      }
    });

    cookieParserLogger.debug('Parsed cookie', {
      action: 'cookie_parsed',
      name,
      hasValue: !!value,
      options: Object.keys(options),
    });

    cookies.push({ name, value, options });
  });

  cookieParserLogger.info('Cookie parsing completed', {
    action: 'parse_complete',
    totalCookies: cookies.length,
    cookieNames: cookies.map((c) => c.name),
  });

  return cookies;
};

export const setCookieFromHeader = (
  setCookieHeader: string[],
): ParsedCookie[] => {
  cookieParserLogger.info('Setting cookies from headers', {
    action: 'set_cookies_from_header',
    headerCount: setCookieHeader.length,
  });

  const cookies = useCookies();
  const parsedCookies = parseSetCookieHeader(setCookieHeader);

  parsedCookies.forEach(({ name, value, options }) => {
    try {
      cookies.set(name, value, options);
      cookieParserLogger.debug('Cookie set successfully', {
        action: 'cookie_set',
        name,
        hasValue: !!value,
        options: Object.keys(options),
      });
    } catch (error) {
      cookieParserLogger.error('Failed to set cookie', error as Error, {
        action: 'cookie_set_failed',
        name,
      });
    }
  });

  cookieParserLogger.info('All cookies processed', {
    action: 'set_cookies_complete',
    processedCount: parsedCookies.length,
  });

  return parsedCookies;
};
