# ats-index

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js 18+](https://img.shields.io/badge/node-18%2B-green.svg)](https://nodejs.org)

**One API to search job listings across Greenhouse, Ashby, and Lever: full descriptions, not just titles.**

---

## Why this exists

Companies post jobs on ATS platforms (Greenhouse, Lever, Ashby). Each platform has a public API. But each works differently, returns different data, and requires you to know the exact company identifier.

Most tools out there give you a title and a link. That is not enough to make a decision about whether a role is worth pursuing. You need the full job description.

**ats-index normalizes all of it into one clean format with complete job descriptions in markdown.**

---

## Quick start

```bash
npx ats-index fetch <company-slug>
```

```
Found 47 jobs

  Senior Product Manager [Product] | San Francisco, CA
  https://boards.greenhouse.io/.../123456
  About the role: You will own the product roadmap for our
  integrations platform...

  Staff Software Engineer [Engineering] | Remote
  https://boards.greenhouse.io/.../789012
  About the team: We build the core infrastructure that powers...
```

---

## What each job includes

| Field | What you get |
|-------|-------------|
| **Title** | Full job title with team or department |
| **Company** | Normalized company name |
| **Department** | When available from the ATS |
| **Location** | City, state, country |
| **Location type** | Remote, hybrid, or onsite |
| **Salary** | Min-max range when the company provides it |
| **Description** | Full job description, converted to clean markdown |
| **URL** | Direct link to the posting |
| **Posted date** | When available |

---

## Usage

### Command line

```bash
# Fetch all open roles at a company (auto-detects ATS platform)
ats-index fetch <company-slug>

# Specify the ATS platform
ats-index fetch <company-slug> --ats greenhouse

# Detect which ATS a company uses
ats-index detect <company-name>

# Search the built-in company registry by sector
ats-index registry search fintech

# Output as JSON for piping into other tools
ats-index fetch <company-slug> --json
```

### As a library

```js
import { fetchJobs, registry } from 'ats-index';

// Fetch all open roles
const jobs = await fetchJobs({ company: 'company-slug' });

// Search the registry
const companies = await registry.search('fintech');

// Detect which ATS a company uses
const platforms = await registry.detect('company-name');
```

---

## Platforms supported

| Platform | Coverage |
|----------|----------|
| **Greenhouse** | Most widely used ATS in tech. Public board API with full job descriptions. |
| **Ashby** | Popular with startups. REST and GraphQL APIs, often includes compensation data. |
| **Lever** | Common in mid-stage companies. JSON API with department and workplace info. |
| **BambooHR** | Planned |
| **Workday** | Planned |

---

## Who is this for

**Job seekers** looking to search multiple company career pages from one place, or connect job data to their AI assistant for smarter evaluation.

**Developers** building job search tools, career platforms, or AI agents that need structured job data as a foundation.

**Researchers** studying hiring trends or labor markets. We are open to ideas: [open an issue](../../issues) and tell us what data would be useful.

---

## Roadmap

- [ ] Track when roles close or reopen over time
- [ ] Surface what changed at a company since your last check
- [ ] BambooHR and Workday adapters
- [ ] MCP server for AI tool integration

---

## Company registry

The project ships with a curated registry of tech companies organized by ATS platform and sector. Community contributions welcome.

To add companies, submit a PR to the files in `registry/`:

```json
{"slug": "company-slug", "name": "Company Name", "sector": "industry"}
```

---

## Install

```bash
npm install ats-index
```

Or run without installing:

```bash
npx ats-index fetch <company-slug>
```

**Requirements:** Node.js 18+. No API keys needed: all endpoints are public.

---

## License

MIT
