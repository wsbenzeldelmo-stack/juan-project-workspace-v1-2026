#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
echo "JUAN PROJECT Workspace"
echo "Open http://localhost:8080 in your browser."
python3 -m http.server 8080 --bind 127.0.0.1
