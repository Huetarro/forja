#!/usr/bin/env bash
# Comprobación completa antes de publicar: se detiene ante el primer fallo.
set -euo pipefail
mkdir -p node_modules/.cache
rm -rf node_modules/.tmp
npx prettier --check . > /dev/null
npm run lint --silent
npm test --silent > node_modules/.cache/forja-unit.log 2>&1 || { tail -40 node_modules/.cache/forja-unit.log; exit 1; }
npm run build --silent > node_modules/.cache/forja-build.log 2>&1 || { tail -40 node_modules/.cache/forja-build.log; exit 1; }
npx playwright test > node_modules/.cache/forja-e2e.log 2>&1 || { grep -E "Error|›|passed|failed" node_modules/.cache/forja-e2e.log | head -40; exit 1; }
grep -E "Tests " node_modules/.cache/forja-unit.log
grep -E "passed" node_modules/.cache/forja-e2e.log
echo "TODO EN VERDE"
