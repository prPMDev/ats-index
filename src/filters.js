/**
 * Apply filters to a list of normalized jobs.
 *
 * Facts go here (deterministic field matches). Interpretations stay with the
 * caller — this module does substring matching on structured fields, nothing
 * semantic.
 */
export function applyFilters(jobs, options = {}) {
  const {
    titleFilter,
    filter,
    postedWithinDays,
    locationIncludes,
    locationExcludes,
    limit = 100,
  } = options;

  let result = jobs;

  if (titleFilter) {
    const pattern = new RegExp(titleFilter, 'i');
    result = result.filter(j => pattern.test(j.title || ''));
  }

  if (filter) {
    const pattern = new RegExp(filter, 'i');
    result = result.filter(j =>
      pattern.test(j.title || '') ||
      pattern.test(j.department || '') ||
      pattern.test(j.description || '')
    );
  }

  if (typeof postedWithinDays === 'number') {
    const cutoff = Date.now() - postedWithinDays * 86400000;
    result = result.filter(j => {
      if (!j.postedAt) return false;
      const posted = new Date(j.postedAt).getTime();
      return Number.isFinite(posted) && posted >= cutoff;
    });
  }

  if (Array.isArray(locationIncludes) && locationIncludes.length > 0) {
    const matchers = locationIncludes.map(makeLocationMatcher);
    result = result.filter(j => {
      const loc = (j.location || '').toLowerCase();
      return matchers.some(m => m(loc));
    });
  }

  if (Array.isArray(locationExcludes) && locationExcludes.length > 0) {
    const matchers = locationExcludes.map(makeLocationMatcher);
    result = result.filter(j => {
      const loc = (j.location || '').toLowerCase();
      return !matchers.some(m => m(loc));
    });
  }

  if (typeof limit === 'number' && result.length > limit) {
    result = result.slice(0, limit);
  }

  return result;
}

/**
 * Build a matcher for a single location keyword.
 *
 * Short tokens (≤4 chars) use word-boundary matching to prevent substring
 * collisions like "US" matching "Australia", "Brussels", "Belarus", or "UK"
 * matching "Auckland". Longer tokens use substring matching so phrases like
 * "United States" can match "United States of America".
 */
function makeLocationMatcher(needle) {
  const lower = (needle || '').toLowerCase().trim();
  if (!lower) return () => false;
  if (lower.length <= 4) {
    const escaped = lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\b${escaped}\\b`);
    return (loc) => pattern.test(loc);
  }
  return (loc) => loc.includes(lower);
}
