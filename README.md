# Lattice Manager

Lattice Manager is a web application that allows users to manage their Lattice1 device.

## About this fork

This is a maintained fork of [GridPlus/lattice-manager](https://github.com/GridPlus/lattice-manager). The upstream `master` branch has had no commits since October 2025, and its dependencies were far behind. This fork runs the app with current, patched software, next to a self-hosted [Lattice Connect](https://github.com/MysticRyuujin/lattice-connect-v2) relay.

### What changed

| Area | Upstream | This fork |
|---|---|---|
| Runtime and tools | Node 16, TypeScript 4, Vite 4, vitest 0.28 | Node 24 LTS, TypeScript 7, Vite 8, vitest 5 |
| UI | React 18, antd 4 | React 19, antd 6 |
| Device SDK | gridplus-sdk 3.4 | gridplus-sdk 4.0 |
| Image | `node:12`, runs the Vite dev server | Static files served by `nginx-unprivileged` on port 3001, as non-root (about 100 MB) |
| Relay URL | `VITE_BASE_SIGNING_URL` had no effect | `VITE_BASE_SIGNING_URL` sets the default relay at build time |

All other dependencies are at their latest versions.

We also fixed these bugs:

- **Signature validation:** `bs58` 6 returns a `Uint8Array`. The Validate Hardware page now converts it to a `Buffer`, so valid device signatures still verify.
- **Connection Endpoint:** the settings page saved an invalid URL even when it showed an error. It now refuses to save it.
- **Login data in logs:** the keyring login flow can put the device ID and password in the URL (`?loginCache=`). The nginx access log records the path only, never the query string or the Referer.

### What we removed

- Sentry error reporting and session replay. Without a DSN it did nothing, and a self-hosted manager should not send data to a third party.
- The GridPlus GitHub Pages deployment (`publish.yml` and `public/CNAME`).
- The unused packages `gulp`, `@ethereumjs/tx` and `nanoid`.

### Results

| Check | Upstream | This fork |
|---|---|---|
| `npm audit` | 59 findings (10 critical, 22 high) | 8 low findings from one advisory (see below) |
| Unit and render tests | 21 | 41 |
| Browser smoke test | none | 4 checks against the built image |

One advisory remains: [GHSA-848j-6mx2-7j84](https://github.com/advisories/GHSA-848j-6mx2-7j84) in `elliptic` (severity low). No fixed release exists. `gridplus-sdk` 4 pins `elliptic`, and the app uses it directly to verify signatures. CI fails only on moderate or higher findings, so this advisory does not block it. Remove this note when a fix ships.

### How we test

- **vitest:** the existing unit tests, plus render tests for each screen that needs a paired device. They fail on any React or antd warning. They also include a form-binding test for address tags, and a signature test vector built with a test root key.
- **Playwright smoke test** (`test/e2e/run.sh`): starts the image and checks the connect page, the default relay, a saved Connection Endpoint, asset caching, the SPA fallback, and that query strings stay out of the access log.
- **Real device:** screens after pairing need a real Lattice1. Check them by hand after each release.

### How we stay up to date

- **CI** (`.github/workflows/ci.yml`) runs on each pull request, on each push to `master`, every Monday, and on demand. It runs `tsc`, vitest, `npm audit`, the image build, the smoke test and a Trivy scan. Results go to the Security tab.
- **Dependabot** opens weekly pull requests for npm packages, the Docker base images and the GitHub Actions. It does not propose a new Node major version or a new Playwright version. Update those by hand: Node together with `@types/node` and `.nvmrc`, and Playwright together with the container tag in `test/e2e/run.sh`.
- **CodeQL** scans the TypeScript source, and **secret scanning** blocks pushes that contain credentials.

## Technologies

- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Ant Design](https://ant.design/)

## Getting Started

### Prerequisites

- Node.js v24+ (see `.nvmrc`)
- Docker, for the image and the smoke test

### Run from source

```bash
npm ci
npm start            # Vite dev server on http://localhost:3000
```

### Run the tests

```bash
npm test             # vitest in watch mode; use `npx vitest run` for one pass
npx tsc --noEmit -p .
```

### Build and smoke-test the image

```bash
docker build -t lattice-manager .
EXPECT_NGINX=1 test/e2e/run.sh lattice-manager https://signing.gridpl.us
```

The image serves the app on port 3001.

## Using with Lattice Connect

Set the default relay when you build the image:

```bash
docker build --build-arg VITE_BASE_SIGNING_URL=https://lattice-connect.example.com -t lattice-manager .
```

Without the build argument, the app uses the GridPlus relay at `https://signing.gridpl.us`. For a source build, set `VITE_BASE_SIGNING_URL` in `.env` (copy `.env.sample`).

A Connection Endpoint saved in the app's Settings page always wins over the default. It is stored in that browser only.
