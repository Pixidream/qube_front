import { useCookies } from '@vueuse/integrations/useCookies.mjs';

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
  const cookies: ParsedCookie[] = [];

  setCookieHeaders.forEach((cookieString) => {
    const parts = cookieString.split(';').map((part) => part.trim());

    const [nameValue] = parts;
    const [name, value] = nameValue.split('=', 2);

    if (!name || value === undefined) return;

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

    cookies.push({ name, value, options });
  });

  return cookies;
};

export const setCookieFromHeader = (
  setCookieHeader: string[],
): ParsedCookie[] => {
  const cookies = useCookies();
  const parsedCookies = parseSetCookieHeader(setCookieHeader);

  parsedCookies.forEach(({ name, value, options }) => {
    cookies.set(name, value, options);
  });

  return parsedCookies;
};
