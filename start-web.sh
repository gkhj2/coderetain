#!/bin/bash
# Start CodeRetain in web mode
cd "$(dirname "$0")"
node node_modules/@expo/cli/build/bin/cli start --web
