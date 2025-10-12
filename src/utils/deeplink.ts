import { sendAuthEvent, useAuthMachine } from '@machines/auth.machine';
import { LocationQueryRaw, useRouter } from 'vue-router';

type QueryValue = string | string[] | boolean | undefined;
type ParsedQuery = Record<string, QueryValue>;

export const parseQueryString = (url: string): ParsedQuery => {
  console.log(`[DEEPLINK] Parsing query for: ${url}`);
  const result: ParsedQuery = {};

  // extract query string
  const queryStart = url.indexOf('?');
  if (queryStart === -1) {
    console.error("[DEEPLINK] The given url doesn't contains a query.");
    return result;
  }

  const queryString = url.slice(queryStart + 1);
  if (!queryString) {
    console.error('[DEEPLINK] The query string is empty.');
    return result;
  }

  // split and process each param
  const params = queryString.split('&');

  for (const param of params) {
    if (!param) {
      continue;
    }

    const equalIndex = param.indexOf('=');
    let key: string;
    let rawValue: string;
    let isValueless = false;

    if (equalIndex === -1) {
      // handle param without value as truethy boolean
      key = decodeURIComponent(param);
      rawValue = '';
      isValueless = true;
    } else {
      key = decodeURIComponent(param.slice(0, equalIndex));
      rawValue = decodeURIComponent(param.slice(equalIndex + 1));
    }

    // handle param with array notation like []
    const isArrayNotation = key.endsWith('[]');
    const cleanKey = isArrayNotation ? key.slice(0, -2) : key;

    const existingValue = result[cleanKey];

    if (existingValue === undefined) {
      // first occurence of the value
      if (isArrayNotation) {
        result[cleanKey] = [rawValue];
      } else {
        result[cleanKey] = isValueless ? true : rawValue;
      }
    } else if (Array.isArray(existingValue)) {
      // if already an array just push the value
      existingValue.push(rawValue);
    } else {
      // transform existing value to array. cast boolean as empty string
      const existingAsString =
        typeof existingValue === 'boolean' ? '' : existingValue;
      result[cleanKey] = [existingAsString, rawValue];
    }
  }

  console.log(`[DEEPLINK] parsed query: ${result}`);
  return result;
};

export const extractPath = (url: string): string => {
  console.log(`[DEEPLINK] extracting path from url: ${url}`);
  const _url = new URL(url);
  console.log(`[DEEPLINK] found path: ${_url.pathname}`);
  return _url.pathname;
};

export const handleDeeplink = async (deeplinks: string[]) => {
  console.log(`[DEEPLINK] handling deeplinks: "${deeplinks}"`);
  if (!deeplinks.length) {
    console.error('[DEEPLINK] received an empty list.');
    return;
  }

  console.warn(`[DEEPLINK] For now the app only support one deeplink ...`);
  // for now we handle 1 deeplink only.
  const deeplink = deeplinks.at(-1);

  if (deeplink === undefined) {
    console.error('[DEEPLINK] given deeplink is undefined');
    return;
  }

  const authMachine = useAuthMachine();
  const query = parseQueryString(deeplink) as LocationQueryRaw;

  // deeplink handle for auth routes as it's not going through router
  if (deeplink.includes('reset-password')) {
    // Send event with query data - navigation will be handled by machine entry action
    console.info(
      '[DEEPLINK] reiceived deeplink to reset password page. Redirecting ...',
    );
    authMachine.actor.send(sendAuthEvent.resetPassword(query));
    return;
  }

  const path = extractPath(deeplink);
  console.info(`[DEEPLINK] received deeplink to: ${path}. Redirecting ...`);
  const router = useRouter();
  router.push({ path, query });
};
