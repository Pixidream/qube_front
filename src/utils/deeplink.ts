import { sendAuthEvent, useAuthMachine } from '@machines/auth.machine';
import { LocationQueryRaw, useRouter } from 'vue-router';
import { logger } from './logger';

type QueryValue = string | string[] | boolean | undefined;
type ParsedQuery = Record<string, QueryValue>;

const deeplinkLogger = logger.child({ utility: 'deeplink' });

export const parseQueryString = (url: string): ParsedQuery => {
  deeplinkLogger.debug('Parsing query string from URL', {
    action: 'parse_query_start',
    url,
  });
  const result: ParsedQuery = {};

  // extract query string
  const queryStart = url.indexOf('?');
  if (queryStart === -1) {
    deeplinkLogger.warn('URL does not contain a query string', {
      action: 'parse_query_no_query',
      url,
    });
    return result;
  }

  const queryString = url.slice(queryStart + 1);
  if (!queryString) {
    deeplinkLogger.warn('Query string is empty', {
      action: 'parse_query_empty',
      url,
    });
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

  deeplinkLogger.debug('Query string parsing completed', {
    action: 'parse_query_complete',
    url,
    parsedKeys: Object.keys(result),
    resultCount: Object.keys(result).length,
  });
  return result;
};

export const extractPath = (url: string): string => {
  deeplinkLogger.debug('Extracting path from URL', {
    action: 'extract_path_start',
    url,
  });
  const _url = new URL(url);
  deeplinkLogger.debug('Path extraction completed', {
    action: 'extract_path_complete',
    url,
    extractedPath: _url.pathname,
  });
  return _url.pathname;
};

export const handleDeeplink = async (deeplinks: string[]) => {
  deeplinkLogger.info('Processing deeplinks', {
    action: 'handle_deeplinks_start',
    deeplinkCount: deeplinks.length,
    deeplinks,
  });
  if (!deeplinks.length) {
    deeplinkLogger.error('Received empty deeplinks list', undefined, {
      action: 'handle_deeplinks_empty',
    });
    return;
  }

  deeplinkLogger.warn(
    'Multiple deeplinks received, processing only the last one',
    {
      action: 'handle_deeplinks_multiple',
      totalCount: deeplinks.length,
    },
  );
  // for now we handle 1 deeplink only.
  const deeplink = deeplinks.at(-1);

  if (deeplink === undefined) {
    deeplinkLogger.error('Selected deeplink is undefined', undefined, {
      action: 'handle_deeplinks_undefined',
      deeplinks,
    });
    return;
  }

  const authMachine = useAuthMachine();
  const query = parseQueryString(deeplink) as LocationQueryRaw;

  // deeplink handle for auth routes as it's not going through router
  if (deeplink.includes('reset-password')) {
    // Send event with query data - navigation will be handled by machine entry action
    deeplinkLogger.info('Processing password reset deeplink', {
      action: 'handle_deeplink_reset_password',
      deeplink,
      hasQuery: Object.keys(query).length > 0,
      queryKeys: Object.keys(query),
    });
    authMachine.actor.send(sendAuthEvent.resetPassword(query));
    return;
  }

  if (deeplink.includes('verify-email')) {
    deeplinkLogger.info('Processing email-verify deeplink', {
      action: 'handle_deeplink_verify_email',
      deeplink,
      hasQuery: Object.keys(query).length > 0,
      queryKeys: Object.keys(query),
    });
    authMachine.actor.send(sendAuthEvent.verifyEmail(query));
    return;
  }

  const path = extractPath(deeplink);
  deeplinkLogger.info('Processing general deeplink navigation', {
    action: 'handle_deeplink_navigation',
    deeplink,
    extractedPath: path,
    hasQuery: Object.keys(query).length > 0,
    queryKeys: Object.keys(query),
  });
  const router = useRouter();
  router.push({ path, query });
};
