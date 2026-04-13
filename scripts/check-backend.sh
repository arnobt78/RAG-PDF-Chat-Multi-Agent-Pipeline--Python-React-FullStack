#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"
cd "$BACKEND"

if [[ -n "${BACKEND_PYTHON:-}" ]]; then
  PY="$BACKEND_PYTHON"
elif [[ -x "$BACKEND/.venv/bin/python" ]]; then
  PY="$BACKEND/.venv/bin/python"
else
  PY="python3"
fi

"$PY" -m compileall -q app
"$PY" -m ruff check app
"$PY" -m mypy app
