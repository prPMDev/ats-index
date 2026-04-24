# jd-intel

**Toolkit for making job descriptions AI-accessible.** Library + CLI + MCP server. Published to npm as `jd-intel` (lib/CLI) and `jd-intel-mcp` (MCP server).

Public repo. Open source MIT. Built by Prashant R as a portfolio piece at the intersection of AI, product work, and the integration layer.

---

## PRIME DIRECTIVE: this is a public repo

Same anonymity discipline as the Pursuit project, with one explicit exception (author attribution is intentional public credit).

**Always anonymize:**
- Specific companies the author applied to or considered (use "fintech company", "Company X")
- The author's specific past employers (use "previous employer" or generic role descriptions)
- Names of any testers, reviewers, or collaborators (use "an external reviewer", "a tester")
- Internal feedback, NDA-protected discussions, private commentary
- Visa / immigration details
- Specific salary numbers tied to the author's experience
- Family / personal life details

**Allowed (intentional public attribution):**
- Author name: Prashant R
- Portfolio: prashantrana.xyz
- LinkedIn: linkedin.com/in/prashant-rana
- npm package names, GitHub repo URLs, public technical artifacts
- Real ATS platform names (Greenhouse, Lever, Ashby) — these are public products
- Generic role types (PM, engineer, designer) — balance, not pile-on

**Git history is permanent.** Even if you fix it later, old commits remain accessible. Rewriting history is complex and not guaranteed. Better to over-anonymize than expose.

---

## What jd-intel is

A toolkit (three surfaces, one core) for fetching and normalizing job descriptions across major Applicant Tracking Systems:

- **Library** (`jd-intel`) — `fetchJobs`, `searchRegistry`, `detectAts`, `applyFilters`. ESM, Node 18+.
- **CLI** (`npx jd-intel fetch <slug>`) — same capabilities from the terminal.
- **MCP server** (`jd-intel-mcp`) — exposes the toolkit to AI assistants via the Model Context Protocol.

Three ATS adapters shipped: Greenhouse, Lever, Ashby. 66-company verified registry.

---

## Quick start (developer)

```bash
cd C:\Projects\jd-intel
npm install                       # root deps
cd mcp && npm install             # MCP package deps

node --test test/*.test.js        # 78 tests, all should pass
node mcp/server.js                # boot MCP server locally
```

---

## File structure orientation

```
jd-intel/
├── src/                          # Library
│   ├── index.js                  # Public exports (fetchJobs, registry, applyFilters, etc.)
│   ├── adapters/                 # One file per ATS (greenhouse.js, lever.js, ashby.js)
│   ├── filters.js                # applyFilters — server-side filter logic
│   ├── normalizer.js             # Unified schema mapper
│   ├── registry.js               # Local company catalog (loadRegistry, findAtsBySlug, detectAts)
│   └── cli.js                    # CLI entry point
├── mcp/                          # MCP server (separate npm package)
│   ├── server.js                 # Stdio entry
│   ├── cli.js                    # Dispatcher (server / install / uninstall / help)
│   ├── tools.js                  # Tool registrations
│   ├── resources.js              # Registry Resource
│   ├── descriptions.js           # Tool description strings (the AI surface)
│   ├── envelope.js               # {status, data, metadata} response wrapper
│   ├── errors.js                 # 6-code error taxonomy
│   ├── install.js                # `npx jd-intel-mcp install` auto-configurator
│   └── README.md
├── test/                         # Node built-in test runner
├── registry/                     # JSON catalogs of verified companies per ATS
├── docs/
│   └── filters.md                # Filter design rationale
├── notes/                        # GITIGNORED — private working memory
│   ├── building-mcp.md           # Full journey log, 8 LinkedIn drafts, mental models, decisions
│   ├── expansion-research.md     # Verified next-adapter catalog
│   ├── landing-page-plan.md      # Landing page blueprint
│   └── linkedin-content-guide.md # Content handoff guide
├── README.md                     # Public, dual-audience product page
└── CLAUDE.md                     # This file
```

---

## Key concepts (load these into your head before any change)

**Filter design (the product surface):**
- `titleFilter` matches title only (role identity: PM, engineer, designer)
- `filter` matches title + department + description (topic / scope)
- They AND together. Use both for "PM roles about integrations".
- Location keywords ≤ 4 chars use word-boundary matching (US, UK safe; no Australia / Auckland collisions)
- Prefer include over exclude; avoid bare "Remote" (matches Remote-EMEA etc.)
- Full rationale: `docs/filters.md`

**MCP design choices (already locked):**
- 3 tools (fetch_jobs, search_registry, detect_ats) + 1 Resource (registry)
- Stdio transport; HTTP/Cloudflare Workers version is roadmap (#22 + future)
- Uniform envelope `{status, data, metadata}` across every tool
- 6-code error taxonomy (no `hint` field; tool description teaches recovery)
- Tool names use snake_case for MCP convention; library API uses camelCase

**Registry-first routing:**
- `fetchJobs` consults the registry before probing all adapters
- Known company → 1 adapter call. Unknown → discovery mode (probe all three).

**Voice rules (apply to all user-facing prose):**
- No em dashes (—) in README, docs, mcp/README, mcp/descriptions.js. Period, colon, comma, or rewrite. Code comments / JSDoc are exempt.
- No "ChatGPT" references. Use "AI assistants" or "your AI" (platform-neutral).
- Anti-hype tone. Direct, conversational, confident. No buzzwords.
- "PM who builds" — author positioning.
- Kit framing: library + CLI + MCP server are three surfaces of one toolkit. Not "just an API".
- Balance role examples (PM, engineer, designer). Don't pile on PM.
- Keep specific company names spread thin in user-facing prose. Concrete examples are good in code; don't repeat the same 2 companies six times in narrative.

---

## Where to find deep context (gitignored, local only)

`notes/` folder has the full picture. Forward to a collaborator if helpful, but don't commit:

| File | Use for |
|------|---------|
| `notes/building-mcp.md` | Full journey log + 8 LinkedIn drafts + mental models. The single most useful file for catching up. |
| `notes/expansion-research.md` | Verified catalog of next-adapter options (Recruitee, Personio, Workable, Teamtailor) |
| `notes/landing-page-plan.md` | Landing page blueprint for a focused half-day build |
| `notes/linkedin-content-guide.md` | Handoff guide for someone drafting LinkedIn content from the project |

---

## Skill routing — when to invoke which

This file is mostly a router. Use Claude's defaults plus these targeted skills:

| Task | Skill / approach |
|------|------------------|
| Add a new MCP tool, audit MCP server quality, design tool descriptions | `anthropic-skills:mcp-builder` |
| Write a spec or PRD for a new feature | `product-management:write-spec` |
| Brainstorm product directions, challenge assumptions | `product-management:product-brainstorming` |
| Sprint planning, scoping a focused work session | `product-management:sprint-planning` |
| Synthesize feedback (user testing, reviewer notes) | `product-management:synthesize-research` |
| Write or critique LinkedIn / launch posts | reference `notes/linkedin-content-guide.md` |
| Design critique on the landing page | `design:design-critique` |
| Write or revise UX copy / microcopy | `design:ux-copy` |
| Accessibility audit on landing page | `design:accessibility-review` |
| Commit, push, open PR | `commit-commands:commit` / `commit-commands:commit-push-pr` |
| Update this file | `claude-md-management:revise-claude-md` |
| Broad codebase search | Explore agent (subagent_type: Explore) |
| Plan a non-trivial implementation | Plan agent (subagent_type: Plan) |
| Multi-step research with verification | general-purpose agent |

Default behavior:
- For UI / browser-observable work, follow the preview verification workflow (preview_start, preview_snapshot, etc.). For Node library / MCP server work, the test suite + smoke-test stdin protocol is the verification path.
- Verify before committing. Tests pass. Voice rules applied.
- Don't add comments to code unless WHY is non-obvious.

---

## Current state (as of 2026-04-24)

**Live:**
- `jd-intel@0.1.0` + `jd-intel-mcp@0.1.0` published on npm
- v0.1.0 tagged
- Production-verified via real Claude Desktop integration-PM workflow
- 78 tests passing
- README dual-audience, voice-cleaned

**Open issues (priorities for future sessions):**
- #18 v0.2.0 quality pass — `.strict()` Zod, tool annotations, pagination, `isError`, CHARACTER_LIMIT (~1 hr focused work)
- #22 expansion: Recruitee, Personio, Workable, Teamtailor adapters (~1 day)
- #21 design constraint for change-detection / diff_jobs (forward-looking)
- #19 outputSchema/structuredContent for modern MCP clients (P1)
- #17 duplicate IDs across multi-office postings (post-MVP)
- #20 naming convention deviations (doc-only)
- #11 README "JD fallback when web fails" angle (refinement)
- #10 detect_ats fallback for unregistered companies
- #7 retry + rate-limit handling
- #2 BambooHR — flagged not viable per research, recommend close
- #3 Workday — flagged brittle per research, deprioritize

**Parked (focused future sessions):**
- Hosted MCP on Cloudflare Workers (HTTP transport — unlocks Claude.ai web users)
- Landing page (GitHub Pages, blueprint in notes/landing-page-plan.md)
- Anthropic MCP marketplace submission
- LinkedIn launch post

---

## Standard workflow

1. **Pick a task** from open issues or parked items
2. **Read relevant `notes/*` file** if you need historical context
3. **Plan** with the appropriate skill or Plan agent if non-trivial
4. **Implement** with thin handlers, library does work, tests cover behavior
5. **Verify** — run tests, smoke-test the MCP via stdin if MCP work, voice-review user-facing text
6. **Commit** with a descriptive message, push, mention in issue if applicable

For npm publish flow: token in `.npmrc`, `npm publish` from root for jd-intel, from `mcp/` for jd-intel-mcp. Bump versions in BOTH `package.json` files for changes affecting both. See the publishing log in `notes/building-mcp.md` for the full process documented.

---

## Anti-patterns to watch for

- Adding em dashes back to user-facing prose
- Using ChatGPT-specific language instead of "AI assistants"
- Rebuilding logic the library already exports (use `applyFilters`, `findAtsBySlug`, etc.)
- Writing tool descriptions that don't include USE WHEN / DON'T USE WHEN / argument guidance
- Forgetting to bump version when republishing to npm
- Committing files from `notes/` (they're gitignored for a reason)
- Echoing the npm token in any committed file
- Pile-on of the same 1-2 example companies (Stripe, Mercury) in user-facing prose
