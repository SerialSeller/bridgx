# BridgX deployment

S3 owner: Musa. The live URL is sent to Musa here for review and team sharing.

- Netlify project: [bridgx-6or8](https://app.netlify.com/projects/bridgx-6or8)
- Site: [BridgX](https://bridgx-6or8.netlify.app)
- Git repository: `SerialSeller/bridgx`; production branch: `main`
- Build command: `npx convex deploy --cmd 'npm run build'`
- Published directory: `dist`
- Node version: 24 (from `.nvmrc`)
- SPA redirect: every route serves `index.html`, as configured in `netlify.toml`

Convex production is `neighborly-salamander-577`, at `https://neighborly-salamander-577.convex.cloud`. The production deploy key is stored in Netlify as a secret available only to production builds. Convex's build command supplies the production `VITE_CONVEX_URL`; do not override it with the dev URL.

Server values `LLM_BASE_URL`, `LLM_AUTH`, `LLM_MODEL`, and `FAL_KEY` are configured directly on Convex production. `LLM_MODEL` is the verified `openai/gpt-6-luna`. Keep server values out of VITE-prefixed variables and tracked files.

For a manual source upload through the Netlify plugin, upload a clean Git archive. The uploader can include the regular `.git` pointer file from a managed worktree, which breaks Netlify's repo-preparation stage. A Git archive excludes that pointer and all local env files. GitHub continuous deployment is the normal path once the repository is linked.

Run `npm run build` and `npx tsc --noEmit` before the PR. Verify the published deploy's commit matches the merged GitHub commit, `/` and `/e/test` both return HTTP 200, and the compiled client contains the production Convex URL. Phone/browser visual verification is a separate check for Musa.
