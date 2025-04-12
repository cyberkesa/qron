#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

// Создаем pre-commit хук
const preCommitScript = `#!/bin/sh
echo "🔍 Running code checks and validations..."

echo "🧹 Running Prettier..."
npx prettier --write .

echo "🧹 Running ESLint..."
npx next lint --fix || {
  echo "❌ ESLint found errors. Please fix them and try again."
  exit 1
}

echo "🧪 Running validation scripts..."
npm run validate-all || {
  echo "❌ Validation failed. Please fix the errors and try again."
  exit 1
}

echo "🏗️ Attempting to build the project..."
npm run build || {
  echo "❌ Build failed. Please fix the errors and try again."
  exit 1
}

echo "✅ All checks passed! Committing changes..."
`;

// Записываем скрипт в файл
writeFileSync('.husky/pre-commit', preCommitScript);

// Делаем файл исполняемым
execSync('chmod +x .husky/pre-commit');

console.log('✅ Husky pre-commit hook has been set up successfully!');
