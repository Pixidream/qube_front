import { sendAuthEvent, useAuthMachine } from '@machines/auth.machine';

type QueryValue = string | string[] | boolean | undefined;
type ParsedQuery = Record<string, QueryValue>;

export const parseQueryString = (url: string): ParsedQuery => {
  const result: ParsedQuery = {};

  // Extract query string
  const queryStart = url.indexOf('?');
  if (queryStart === -1) return result;

  const queryString = url.slice(queryStart + 1);
  if (!queryString) return result;

  // Split on & and process each parameter
  const params = queryString.split('&');

  for (const param of params) {
    if (!param) continue;

    const equalIndex = param.indexOf('=');
    let key: string;
    let rawValue: string;
    let isValueless = false;

    if (equalIndex === -1) {
      // Parameter without value (e.g. ?debug)
      key = decodeURIComponent(param);
      rawValue = '';
      isValueless = true;
    } else {
      key = decodeURIComponent(param.slice(0, equalIndex));
      rawValue = decodeURIComponent(param.slice(equalIndex + 1));
    }

    // Handle arrays with [] notation
    const isArrayNotation = key.endsWith('[]');
    const cleanKey = isArrayNotation ? key.slice(0, -2) : key;

    const existingValue = result[cleanKey];

    if (existingValue === undefined) {
      // First occurrence
      if (isArrayNotation) {
        result[cleanKey] = [rawValue]; // Arrays always contain strings
      } else {
        result[cleanKey] = isValueless ? true : rawValue; // Solo params can be boolean
      }
    } else if (Array.isArray(existingValue)) {
      // Already an array, add the value (always as string in arrays)
      existingValue.push(rawValue);
    } else {
      // Transform to array (convert existing value to string if it was boolean)
      const existingAsString =
        typeof existingValue === 'boolean' ? '' : existingValue;
      result[cleanKey] = [existingAsString, rawValue];
    }
  }

  return result;
};

export const handleDeeplink = async (deeplinks: string[]) => {
  if (!deeplinks.length) return;

  // for now we handle 1 deeplink only.
  const deeplink = deeplinks[0];
  const authMachine = useAuthMachine();

  // for now I just want to handle deeplinks for this route.
  if (!deeplink.includes('reset-password')) return;

  // Parse query params and send them with the event
  const query = parseQueryString(deeplink);

  // Send event with query data - navigation will be handled by machine entry action
  authMachine.actor.send(sendAuthEvent.resetPassword(query));
};
