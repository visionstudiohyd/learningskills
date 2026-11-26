/**
 * Minimal Zod ↔ react-hook-form bridge.
 *
 * Avoids pulling in @hookform/resolvers for what is a dozen lines, and more
 * importantly it means the client validates with the exact same schema object
 * the API route uses — the two can never drift out of sync.
 */
export function zodResolver(schema) {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || 'root';
      if (!errors[path]) {
        errors[path] = { type: issue.code || 'validation', message: issue.message };
      }
    }
    return { values: {}, errors };
  };
}

/** Pull a nested error message out of RHF's errors object by dotted path. */
export function errorFor(errors, name) {
  if (!errors) return null;
  const direct = errors[name];
  if (direct?.message) return direct.message;
  const parts = name.split('.');
  let node = errors;
  for (const part of parts) {
    node = node?.[part];
    if (!node) return null;
  }
  return node?.message || null;
}
