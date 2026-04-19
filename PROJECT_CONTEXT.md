# Project context: snyk-rest-cli

## Purpose

**snyk-rest-cli** is a community-maintained, open-source Node.js command-line tool that talks to [Snyk’s REST API](https://api.snyk.io) (`https://api.snyk.io`). It automates group-level workflows that would be tedious to do only through the UI or raw API calls: listing organizations, inspecting integrations and targets, counting issues by severity, cleaning up empty targets, and toggling Snyk Code (SAST) per organization.

The project is described as a **community project in partnership with Snyk**; official Snyk support does not cover this CLI—issues belong in this repository.

## Tech stack

| Area | Choice |
|------|--------|
| Runtime | Node.js (ES modules: `"type": "module"`) |
| Entry | `index.js` (shebang `#!/usr/bin/env node`) |
| CLI parsing | `minimist` (via `zx`) in `helper.js` |
| HTTP / UX | `zx` (`echo`, `chalk`, `spinner`, `fetch`) |
| Help rendering | `README.md` is read at runtime and rendered with `marked` + a custom terminal renderer in `markdown-render.js`; text width uses `reflow-text.js` |
| Package | npm; binary name `snyk-rest-cli` → `./index.js` |

**Dependencies** (from `package.json`): `marked`, `path`, `url`, `zx`. Version in-repo: **5.0.2** (aligned with `cliVersion` in `index.js`).

## Repository & metadata

- **License:** Apache-2.0  
- **Author / upstream:** Shoreasg  
- **Home:** [github.com/Shoreasg/snyk-rest-cli](https://github.com/Shoreasg/snyk-rest-cli)

## Source layout

| File | Role |
|------|------|
| `index.js` | CLI router: maps flags to handlers or prints `invalid command!` |
| `helper.js` | `minimist` config, `readHelp()` (renders `README.md`), integration dedup helper for integrations listing |
| `api.js` | Core API flows: orgs in a group, integrations, delete empty targets, Snyk Code settings, issue counts |
| `pagination.js` | Follows `links.next` for paginated list endpoints |
| `markdown-render.js` | Terminal-friendly Markdown (colors, reflow; images stripped) |
| `reflow-text.js` | Word-wrap respecting ANSI codes for help output |

## Authentication & global flags

Commands expect:

- `--snyk_token=<token>` — sent as `Authorization: TOKEN …` or `Token …` depending on the endpoint (see `api.js` / `pagination.js`).
- `--api_version=<version>` — REST API version query parameter required by Snyk.

**Group-scoped operations** also need `--group_id`.

## Commands (intended behavior)

| Flag | Behavior |
|------|----------|
| `--help` / `-h` | Print rendered `README.md` to the terminal |
| `-v` / `--version` | Print CLI version |
| `--get_all_orgs_group` | List all organization IDs in the given group (paginated) |
| `--get_all_integrations_org` | For each org in the group, list targets’ integrations; optional `--source_types` filters targets |
| `--get_all_org_issues` | Per org, count issues by `effective_severity_level` (low / medium / high / critical), with pagination |
| `--delete_empty_targets` | For each target, if it has no projects, `DELETE` the target |
| `--update_snyk_code_orgs` | Requires `--sast_enabled` `true` or `false`; reads `/settings/sast` and `PATCH`es to enable/disable Snyk Code where needed |

## API surface (high level)

- `GET /rest/groups/{group_id}/orgs` — enumerate orgs  
- `GET /rest/orgs/{org_id}/targets` — targets (and integrations via relationships)  
- `GET /rest/orgs/{org_id}/projects?target_id=…` — detect “empty” targets  
- `DELETE /rest/orgs/{org_id}/targets/{target_id}` — remove empty targets  
- `GET` / `PATCH /rest/orgs/{org_id}/settings/sast` — Snyk Code toggle  
- `GET /rest/orgs/{org_id}/issues` — issue listing for counts  

Pagination follows JSON:API-style `links.next` URLs (prefixed with `https://api.snyk.io` where the link is relative).

## Testing & quality

- `package.json` `test` script is a placeholder (`echo "Error: no test specified"`).
- No separate test suite or CI configuration is implied by the small root file set.

## Implementation notes

1. **Module-level org list:** `api.js` uses a module-level `orgIds` array filled by `getAllOrgsGroup()`; subsequent commands reuse it in the same process.
2. **Flag name consistency:** `helper.js` registers a boolean flag `get_all_orgs_issues` while `index.js` branches on `get_all_org_issues`. Users following the README (`--get_all_org_issues`) need the flag that actually populates `myCustomArgv`; aligning names across `helper.js`, `index.js`, and docs would avoid confusion.
3. **`updateSnykCode`:** When `--sast_enabled` is `false`, the control flow can print both “disabling” messages and a “Skipping Org!” line; worth reviewing if tightening UX.

---

*Generated as a snapshot of the repository structure and behavior. For authoritative usage, refer to `README.md` and the Snyk REST API documentation.*
