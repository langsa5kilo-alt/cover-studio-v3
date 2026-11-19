[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/langsa5kilo-alt/cover-studio-v3/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![reward](https://make.fun/badge/gta6-cover-art-01/langsa5kilo-alt/cover-studio-v3/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Afterglow Cover Lab

An original, fully offline cover-art studio for arranging personal photos into bold multi-panel posters. It includes three layouts, four color grades, editable typography, per-panel pan and zoom, deterministic canvas samples, and three social export sizes.

## Run locally

Open `app/index.html` directly in a desktop browser, or serve the repository with any static file server:

```sh
python3 -m http.server 8080 --directory app
```

Then visit `http://localhost:8080`. No dependencies, network requests, or build step are required.

## Package the entry

```sh
MAKEFUN_OUTPUT_DIR=/tmp/cover-output node main.ts
```

The packager copies the app and screenshots, then produces `dossier.json` for make.fun.
