import { logger } from './logger';

const formDataLogger = logger.child({ utility: 'formData' });

export const toFormData = (obj: Record<any, unknown>): FormData => {
  formDataLogger.debug('Converting object to FormData', {
    action: 'to_form_data',
    objectKeys: Object.keys(obj),
    totalFields: Object.keys(obj).length,
  });

  const fd = new FormData();
  let processedFields = 0;
  let skippedFields = 0;

  for (const [key, value] of Object.entries(obj)) {
    if (!value) {
      skippedFields++;
      formDataLogger.debug('Skipping empty/null field', {
        action: 'skip_field',
        key,
        valueType: typeof value,
      });
      continue;
    }

    if (value instanceof Date) {
      const isoString = value.toISOString();
      fd.append(key, isoString);
      formDataLogger.debug('Added Date field to FormData', {
        action: 'add_date_field',
        key,
        value: isoString,
      });
    } else if (value instanceof Blob) {
      fd.append(key, value);
      formDataLogger.debug('Added Blob field to FormData', {
        action: 'add_blob_field',
        key,
        blobSize: value.size,
        blobType: value.type,
      });
    } else {
      const stringValue = String(value);
      fd.append(key, stringValue);
      formDataLogger.debug('Added string field to FormData', {
        action: 'add_string_field',
        key,
        valueLength: stringValue.length,
        valueType: typeof value,
      });
    }
    processedFields++;
  }

  formDataLogger.info('FormData conversion completed', {
    action: 'form_data_complete',
    processedFields,
    skippedFields,
    totalOriginalFields: Object.keys(obj).length,
  });

  return fd;
};
