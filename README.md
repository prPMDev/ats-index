# jd-intel

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js 18+](https://img.shields.io/badge/node-18%2B-green.svg)](https://nodejs.org)
[![npm](https://img.shields.io/npm/v/jd-intel.svg)](https://www.npmjs.com/package/jd-intel)
[![npm downloads](https://img.shields.io/npm/dw/jd-intel-mcp.svg)](https://www.npmjs.com/package/jd-intel-mcp)
[![GitHub stars](https://img.shields.io/github/stars/prPMDev/jd-intel.svg?style=flat)](https://github.com/prPMDev/jd-intel/stargazers)

> **Stop pasting job descriptions into AI assistants. Let your AI fetch them directly.**

Full text. Clean structure. Across every major ATS. No copy-paste. No context loss.

---

## Why this exists

Your AI assistant already knows a lot about you. Your resume is in its memory. Your target roles, your past projects, your background. Ready to help the moment you feed it a job description.

So you copy-paste.

A JD from one company. Another from the next. A half-dozen more from your target list. Half have broken HTML. Salary info dies in translation. Links get stripped. And for every role, the dance starts over.

You could wait for the job boards to ship their own MCPs. They'll get there eventually. On their timeline. Filtered through their priorities, not yours. Tied to their query abstractions.

jd-intel skips that wait. Raw JDs, fetched directly by your AI, on your terms. One level below the curated layer.

Try asking your AI:

> "Find AI/ML engineering jobs posted this week."
> "What product designer roles are open at fintechs right now?"
> "Pull the staff PM roles posted in the last 7 days."

Done.

---

## Why not just scrape?

Because scraping breaks where jd-intel doesn't:

- **Full JDs when browsing fails.** SPA-rendered boards, slow loads, auth walls, and geo-restrictions block a browser. They don't block a public API call.
- **Structured data, not HTML soup.** Salary, location type, department, and clean markdown, normalized across every ATS.
- **No keys, no browser.** Public APIs only. Runs anywhere your AI does.
- **One schema, every platform.** Greenhouse, Lever, Ashby, SmartRecruiters, TeamTailor, Recruitee return the same shape.

---

## What you can do with it

- Look up open roles at any company directly from your AI, no copy-paste
- Tailor your resume across ten roles in one conversation
- Rank openings by fit with your background
- Scan a whole sector: "Pull open roles at fintech companies posted this week"
- Research teams by reading their JDs in bulk

The toolkit fetches. Your AI thinks.

---

## Install

Works with MCP-aware AI clients: Claude Desktop, Claude Code, Cursor, Windsurf. ChatGPT, Gemini, and other non-MCP clients don't support this yet. They use different tool-calling systems. (We wish they did. The protocol works the same way regardless of which AI you talk to.)

You'll need [Node.js 18 or newer](https://nodejs.org/). To check: open a terminal and run `node --version`. If it's missing or older, install from nodejs.org first.

### For Claude Desktop (one command)

1. **Open a terminal.** It's just a text window. Nothing destructive happens here.
   - **macOS:** Spotlight (`⌘ Space`), type "Terminal", hit Enter.
   - **Windows:** Start menu, type "PowerShell", hit Enter.

2. **Paste this and hit Enter:**
   ```bash
   npx jd-intel-mcp install
   ```

3. **Quit and reopen Claude Desktop.** The tools appear automatically.

Try: *"Find product roles at devtools companies."*

If something goes wrong or you'd rather edit the config file directly, see [Manual install](#manual-install-fallback) below.

### For Cursor and Windsurf

These clients have their own MCP setup flows. Follow their docs:
- Cursor: [docs.cursor.com](https://docs.cursor.com)
- Windsurf: [docs.windsurf.com](https://docs.windsurf.com)

Use this server config: `command: "npx"`, `args: ["-y", "jd-intel-mcp"]`.

### For developers

```bash
npm install jd-intel
```

```js
import { fetchJobs } from 'jd-intel';

const jobs = await fetchJobs({
  company: '<your-target-company>',
  titleFilter: 'designer',
  postedWithinDays: 14,
  limit: 50,
});
```

CLI usage: `npx jd-intel fetch <company-slug> --title-filter "engineer" --posted-within-days 14`. Full filter reference [below](#filters-quick-reference).

Node.js 18+. No API keys. No configuration.

### Manual install (fallback)

If `npx jd-intel-mcp install` fails, edit the config directly.

**Config file location:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "jd-intel": {
      "command": "npx",
      "args": ["-y", "jd-intel-mcp"]
    }
  }
}
```

Restart Claude Desktop.

### Updating

`npx -y jd-intel-mcp` auto-updates within ~24 hours via npm's cache. To force an update immediately:

```bash
npx clear-npx-cache
```

Then quit and reopen Claude Desktop.

If you installed the library or CLI directly:

```bash
npm install jd-intel@latest       # force latest
# or
npm update jd-intel               # respect semver
```

---

## MCP tools

| Tool | Purpose |
|------|---------|
| `fetch_jobs` | Get open roles at a company with filters for role type, topic, location, and recency |
| `search_registry` | Find companies by name or sector |
| `detect_ats` | Identify which ATS platform a company uses |

Plus one Resource: `registry://jd-intel/all`. Full company registry, grouped by ATS. Fetched lazily for broad catalog surveys.

---

## What you get back

Every job normalizes to one schema, across every platform:

```json
{
  "id": "a1b2c3d4e5f6",
  "company": "Example Co",
  "title": "Senior Software Engineer, Platform",
  "department": "Engineering",
  "location": "Remote - US",
  "locationType": "remote",
  "salary": { "min": 180000, "max": 240000, "currency": "USD" },
  "description": "Design and build the API surface our customers integrate against...",
  "url": "https://boards.example.com/jobs/12345",
  "postedAt": "2026-04-10T14:30:00Z"
}
```

No custom parsing per company.

### Data model

| Field | Description |
|-------|-------------|
| `title` | Full job title |
| `company` | Normalized company name |
| `department` | Team or department (when provided) |
| `location` | City, state, country, or remote |
| `locationType` | `remote`, `hybrid`, or `onsite` |
| `salary` | Min-max range with currency (when available) |
| `description` | Full JD in clean markdown |
| `url` | Direct link to the posting |
| `postedAt` | Publication date (when provided) |

---

## Platforms supported

| Platform | Status | Typical use |
|----------|--------|-------------|
| Greenhouse | Shipped | Most widely used ATS in tech |
| Ashby | Shipped | Growing fast with startups |
| Lever | Shipped | Common at mid-stage companies |
| SmartRecruiters | Shipped | Enterprise and mid-market |
| TeamTailor | Shipped | European startups and scale-ups |
| Recruitee | Shipped | Dutch / EU SMBs and scale-ups |
| Personio | Planned | German / EU mid-market |
| Workday | Planned | Large enterprises (scoped scraper) |

Adding a new ATS is a single adapter file. See [Contributing](#contributing).

---

## Filters (quick reference)

| Flag | What it matches | Use for |
|------|-----------------|---------|
| `--title-filter` | Title only | Role identity (PM, engineer, designer) |
| `--filter` | Title + department + description | Topic or scope (integrations, growth) |
| `--posted-within-days` | Recent postings | Recency cuts |
| `--location-include` | Location contains any keyword | Region targeting |
| `--location-exclude` | Location contains no keyword | Drop geographic noise |
| `--limit` | First N results | Cap output size |

All filters AND together. Deep dive on patterns and gotchas: [docs/filters.md](docs/filters.md).

---

## Roadmap

**Shipped**
- Library, CLI, and MCP server (three surfaces of one toolkit)
- Greenhouse, Ashby, Lever, SmartRecruiters, TeamTailor, Recruitee adapters
- Title, topic, location, and date filters
- Salary extraction from JD text
- Verified company registry (155+ companies)

**Next**
- Personio adapter (German / EU mid-market)
- Anthropic MCP marketplace submission

**Planned**
- Workable adapter (parked — needs SPA shortcode resolution)
- Workday support (scoped scraper — large enterprise universe)
- Temporal tracking (when roles open, close, reopen)
- Change detection
- Resume-aware fit scoring

---

## Contributing

**Add a company to the registry:** submit a PR to the appropriate file in `registry/`.

**Add an ATS adapter:** new file in `src/adapters/`. One adapter, one file. Follow the pattern of the existing three.

**Request a company:** [open an issue](https://github.com/prPMDev/jd-intel/issues/new). Tell me who's missing.

---

## Built by

**[Prashant R](https://prashantrana.xyz)**. PM who builds. I try out and build what really matters below the AI hype.

- Portfolio and writing: [prashantrana.xyz](https://prashantrana.xyz)
- [LinkedIn](https://www.linkedin.com/in/prashant-rana)

## License

MIT
