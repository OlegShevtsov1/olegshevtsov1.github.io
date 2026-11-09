# Oleh Shevtsov — a personal workbench

Personal portfolio of **Oleh Shevtsov**, an AI-enabled Ruby on Rails engineer: Rails APIs in production, AI product features, and the agentic SDLC workflow that ships them.

**Live site:** https://olegshevtsov1.github.io/

## What's inside

- **Home** (`index.html`) — a pinboard of project notes, three small browser-only demos, a few notes about me, certificates and contacts.
- **Case studies** (`cases/`)
  - `agentic-sdlc.html` — Claude Code plugins + an Archon "factory" workflow: PRD → TRD → ADR → tested, reviewed, deployed PR.
  - `pilot.html` — a project and task management SaaS built end to end: Rails 8 API, React + TypeScript SPA, Kamal 2, tag-only releases, rollback.
  - `self-hosted.html` — the homelab: one server, isolated VMs per project, unattended coding-agent workspaces and CI runners.

## Demos

Three **fictional, browser-only** interactions: an agent tool-approval flow, a tiny RSpec checker, and a fast-vs-release gate comparison. They don't call any API, don't run user code and contain no employer or client code.

## Run locally

A static site with no build step:

```sh
python3 -m http.server 8000
```

- Home: `index.html`
- Styles: `assets/css/warm.css`, `assets/css/brainstorm.css`, `assets/css/case.css`
- Demo interactions: `assets/js/demos.js`; theme highlighting: `assets/js/board.js`

## Links

[GitHub](https://github.com/OlegShevtsov1) · [LinkedIn](https://www.linkedin.com/in/olegshevtsov1/) · [Email](mailto:olegshevtsov1@gmail.com)
