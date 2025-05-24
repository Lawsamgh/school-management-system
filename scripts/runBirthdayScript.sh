#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Go to project root
cd "$PROJECT_ROOT"

# Run the TypeScript script using ts-node
npx ts-node scripts/sendBirthdayWishes.ts >> logs/birthday_notifications.log 2>&1 