# Copilot Cloud Agent Instructions (Universal Baseline)

## Trust and Search Policy
- **Trust this file first.** Do not start with broad codebase searches.
- Only search when:
  1) this file is missing required details for the task, or  
  2) instructions here are proven incorrect by command output or code reality.
- Prefer deterministic commands and existing scripts over ad-hoc shell logic.

## Mission
- Make safe, minimal, reviewable changes that pass CI.
- Optimize for: **correctness**, **build/test reliability**, **security**, **performance**, and **developer readability**.
- Avoid unrelated refactors unless required to complete the task.

## Standard Execution Contract

### 1) Before Editing
1. Identify stack and toolchain from lockfiles/manifests:
   - JS/TS: `package.json`, lockfile (`pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`)
   - Python: `pyproject.toml`, `requirements*.txt`
   - Ruby: `Gemfile`
   - Go: `go.mod`
   - Rust: `Cargo.toml`
   - Java/Kotlin: `pom.xml`, `build.gradle*`
   - .NET: `*.sln`, `*.csproj`
2. Identify CI truth source in `.github/workflows/`.
3. Identify lint/typecheck/test scripts from manifests and config files.
4. Prefer repo-documented versions (`.nvmrc`, `.node-version`, `.python-version`, `.tool-versions`, Dockerfiles, CI config).

### 2) Bootstrap (Always)
- Run dependency install using the lockfile-compatible tool:
  - `pnpm install --frozen-lockfile` | `yarn install --frozen-lockfile` | `npm ci`
  - `pip install -r requirements.txt` or project-specific documented flow
  - Equivalent deterministic install for other ecosystems
- If install fails, read error fully, fix environment/version mismatch first, then retry.
- Do not switch package managers if a lockfile exists for another manager.

### 3) Validation Order (Always)
Run from narrowest to broadest:
1. Format (if required)
2. Lint
3. Typecheck / static analysis
4. Targeted tests for changed area
5. Full test suite (if feasible)
6. Build/package step

If CI defines a stricter order, **CI order wins**.

### 4) After Editing
- Re-run all impacted validations.
- Ensure no accidental changes to generated files unless required.
- Keep diffs focused and minimal.
- Summarize what changed, why, and how it was validated.

## Command Discovery Rules
- Primary sources (in order):
  1. `.github/workflows/*` (authoritative for CI parity)
  2. `README*`, `CONTRIBUTING*`, docs under `docs/`
  3. Manifest scripts (`package.json`, `Makefile`, `justfile`, etc.)
- Prefer single canonical commands used by CI.
- If multiple valid paths exist, choose the one closest to CI behavior.

## Security and Safety Requirements
- Never commit secrets, tokens, credentials, or private keys.
- Flag hardcoded secrets and insecure defaults immediately.
- Validate and sanitize untrusted input.
- Avoid vulnerable patterns (injection, unsafe deserialization, command injection, XSS/SQLi classes).
- Apply least-privilege principles for auth/authz changes.
- For dependency updates, prefer minimal safe bumps and note security rationale.

## Performance Requirements
- Avoid N+1 queries and repeated expensive I/O.
- Watch algorithmic complexity in loops and hot paths.
- Avoid unnecessary allocations/copies in critical sections.
- Add/adjust caching only with clear invalidation behavior.
- Include brief perf rationale when touching high-traffic code.

## Code Quality Requirements
- Keep functions focused and cohesive.
- Use clear names; prefer readability over cleverness.
- Handle errors explicitly with actionable messages.
- Maintain existing architectural patterns unless change is necessary.
- Add/adjust tests near changed behavior.

## Debugging Playbook
1. Reproduce reliably.
2. Capture exact error/log output.
3. Isolate with minimal failing case.
4. Change one variable at a time.
5. Verify fix and check for regressions.

When helping users, explain reasoning briefly and suggest next diagnostic step if uncertain.

## PR/Change Hygiene
- Include:
  - Problem statement
  - Scope and non-goals
  - Risk assessment
  - Validation commands + results
- Keep commits logically grouped and message intent clear.
- Call out breaking changes and migration steps explicitly.

## Monorepo Guidance (if applicable)
- Detect workspace boundaries (`pnpm-workspace.yaml`, `turbo.json`, `nx.json`, Bazel/Pants configs, etc.).
- Run tests/lint only for affected packages first, then broader checks as needed.
- Use repo-provided task runners/filters for impacted projects.

## Fallback Heuristics (when docs are incomplete)
- JS/TS:
  - Install: `npm ci` (or lockfile-matching manager)
  - Lint: `npm run lint --if-present`
  - Typecheck: `npm run typecheck --if-present`
  - Test: `npm test -- --watch=false` or `npm run test --if-present`
  - Build: `npm run build --if-present`
- Python:
  - Install: project-documented env + deps
  - Lint: `ruff check .` / `flake8` (if configured)
  - Typecheck: `mypy .` (if configured)
  - Test: `pytest`
- Other stacks: mirror CI commands from workflow files.

## What to Do When Commands Fail
- Record:
  - exact command
  - exact error
  - likely cause
  - mitigation attempted
- Resolve environment/tool version issues before code changes.
- If blocked by external services or missing secrets, state limitation clearly and continue with maximal local validation.

## Instruction Priority
1. System/developer/user prompt requirements
2. This file
3. Repository docs
4. CI workflow behavior
5. Tool defaults

If conflicts occur, follow the highest-priority source and note the conflict in your summary.
