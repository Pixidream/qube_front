export const toFormData = (obj: Record<any, unknown>): FormData => {
  const fd = new FormData();

  for (const [key, value] of Object.entries(obj)) {
    if (!value) continue;

    if (value instanceof Date) {
      fd.append(key, value.toISOString());
    } else if (value instanceof Blob) {
      fd.append(key, value);
    } else {
      fd.append(key, String(value));
    }
  }

  return fd;
};
