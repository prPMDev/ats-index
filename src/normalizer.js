import { createHash } from 'node:crypto';

/**
 * Generate a stable ID for a job posting.
 */
export function jobId(company, title, ats, location = '') {
  // Location is part of identity: the same role posted in multiple
  // offices is distinct requisitions with distinct URLs. Omitting it
  // collapsed multi-office postings to one id (see issue #17).
  const raw = `${company}|${title}|${ats}|${location}`.toLowerCase().trim();
  return createHash('md5').update(raw).digest('hex').substring(0, 12);
}

/**
 * Normalize a raw ATS job object into the unified schema.
 */
export function normalize(raw, ats) {
  const now = new Date().toISOString();
  return {
    id: jobId(raw.company || raw.companySlug, raw.title, ats, raw.location || ''),
    company: raw.company || raw.companySlug || '',
    companySlug: raw.companySlug || '',
    ats,
    title: raw.title || '',
    department: raw.department || '',
    location: raw.location || '',
    locationType: detectLocationType(raw.location || ''),
    salary: raw.salary || extractSalaryFromText(raw.description || ''),
    description: stripHtml(raw.description || ''),
    url: raw.url || '',
    postedAt: raw.postedAt || null,
    firstSeen: now,
    lastSeen: now,
    status: 'open',
    metadata: raw.metadata || {},
  };
}

/**
 * Detect location type from location string.
 */
/**
 * Extract salary range from job description text.
 * Matches patterns like: $162,400 - $243,600 or $150K-$200K
 */
function extractSalaryFromText(text) {
  if (!text) return null;
  // Match: $162,400 - $243,600 (full numbers)
  const fullMatch = text.match(/\$([\d,]+)\s*[-–]\s*\$([\d,]+)/);
  if (fullMatch) {
    return {
      min: parseInt(fullMatch[1].replace(/,/g, '')),
      max: parseInt(fullMatch[2].replace(/,/g, '')),
      currency: 'USD',
    };
  }
  // Match: $150K - $200K (shorthand)
  const kMatch = text.match(/\$(\d+)[kK]\s*[-–]\s*\$(\d+)[kK]/);
  if (kMatch) {
    return {
      min: parseInt(kMatch[1]) * 1000,
      max: parseInt(kMatch[2]) * 1000,
      currency: 'USD',
    };
  }
  return null;
}

function detectLocationType(location) {
  const lower = location.toLowerCase();
  if (/remote/i.test(lower)) return 'remote';
  if (/hybrid/i.test(lower)) return 'hybrid';
  if (/on-?site/i.test(lower)) return 'onsite';
  return location ? 'onsite' : 'unknown';
}

/**
 * Strip HTML tags and convert to clean text.
 */
export function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<h[1-6][^>]*>/gi, '## ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
