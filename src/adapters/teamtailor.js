import { normalize, stripHtml } from '../normalizer.js';

/**
 * Fetch jobs from a TeamTailor career site via its public RSS feed.
 *
 * Why RSS, not the official API:
 *   TeamTailor's REST API (api.teamtailor.com/v1/jobs) requires a
 *   per-company API key — 401 without it. Unusable for a public
 *   registry tool that probes arbitrary companies. The public,
 *   unauthenticated path is the career site's jobs.rss feed, which
 *   carries the full HTML job description (jd-intel's whole point).
 *
 * Slug maps to `{slug}.teamtailor.com`. The /jobs.rss path serves
 * directly on that subdomain even when the site root 301-redirects
 * to a custom domain (e.g. jobs.tibber.com).
 *
 * RSS quirk: descriptions are HTML-entity-encoded inside the XML
 * (`&lt;p&gt;...`). We decode that outer layer to real HTML, then
 * hand it to stripHtml() which strips tags and resolves the inner
 * entities. Decode order matters — `&amp;` resolves LAST so that
 * double-encoded sequences (`&amp;amp;`) collapse correctly.
 *
 * @param {string} slug - TeamTailor career-site slug (e.g., 'tibber')
 * @returns {Promise<Array>} Normalized job objects
 */
export async function fetchTeamtailor(slug) {
  const url = `https://${slug}.teamtailor.com/jobs.rss`;
  const resp = await fetch(url, { redirect: 'follow' });

  if (!resp.ok) {
    if (resp.status === 404) return []; // No TeamTailor site for this slug
    throw new Error(`TeamTailor RSS error for ${slug}: ${resp.status}`);
  }

  const xml = await resp.text();

  const company = (
    xml.match(/<channel>[\s\S]*?<title>([\s\S]*?)<\/title>/)?.[1] || slug
  ).trim();

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);

  return items.map(item => {
    const pick = (tag) => {
      const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return m ? m[1].trim() : '';
    };

    const title = decodeEntities(pick('title'));
    const link = pick('link');
    const guid = pick('guid');
    const pubDateRaw = pick('pubDate');
    const department = decodeEntities(pick('tt:department'));
    const city = decodeEntities(pick('tt:city'));
    const country = decodeEntities(pick('tt:country'));
    const remoteStatus = decodeEntities(pick('remoteStatus'));

    let location = [city, country].filter(Boolean).join(', ');
    if (/remote/i.test(remoteStatus)) {
      location = location ? `Remote - ${location}` : 'Remote';
    }

    let postedAt = null;
    if (pubDateRaw) {
      const d = new Date(pubDateRaw);
      if (!Number.isNaN(d.getTime())) postedAt = d.toISOString();
    }

    return normalize({
      companySlug: slug,
      company,
      title,
      department,
      location,
      description: stripHtml(decodeEntities(pick('description'))),
      url: link,
      postedAt,
      salary: null, // No structured salary; normalizer parses from text
      metadata: {
        teamtailorId: guid,
        remoteStatus,
      },
    }, 'teamtailor');
  });
}

/**
 * Decode the RSS entity/CDATA layer to real HTML.
 * `&amp;` is intentionally resolved LAST.
 */
function decodeEntities(s) {
  if (!s) return '';
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Check if a company has a TeamTailor career site.
 */
export async function hasTeamtailor(slug) {
  try {
    const resp = await fetch(`https://${slug}.teamtailor.com/jobs.rss`, {
      method: 'HEAD',
      redirect: 'follow',
    });
    return resp.ok;
  } catch {
    return false;
  }
}
