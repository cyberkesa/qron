#!/usr/bin/env node

/**
 * Script to analyze useEffect dependencies in the codebase
 * Helps find missing dependency arrays that can cause unnecessary re-renders
 *
 * Run with: node scripts/analyze-use-effect-deps.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";

// Configure the directories to scan
const DIRECTORIES_TO_SCAN = ["src/components", "src/lib", "src/app"];
const EXCLUDED_DIRS = ["node_modules", ".next", "dist", "build"];
const FILE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];

// Results storage
const issues = [];
const stats = {
  totalFiles: 0,
  totalUseEffects: 0,
  useEffectsWithoutDeps: 0,
  useEffectsWithEmptyDeps: 0,
  filesWithIssues: new Set(),
};

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
};

// Helper to colorize console output
const colorize = (text, color) => `${colors[color]}${text}${colors.reset}`;

// Find all relevant files in the project
function findFiles() {
  const allFiles = [];

  for (const dir of DIRECTORIES_TO_SCAN) {
    const pattern = `${dir}/**/*{${FILE_EXTENSIONS.join(",")}}`;
    const files = glob.sync(pattern, {
      ignore: EXCLUDED_DIRS.map((d) => `**/${d}/**`),
    });
    allFiles.push(...files);
  }

  return allFiles;
}

// Parse file and find useEffect issues
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // Parse the file
    const ast = parser.parse(content, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "decorators-legacy"],
      errorRecovery: true,
    });

    let fileHasIssues = false;

    // Traverse the AST to find useEffect calls
    traverse(ast, {
      CallExpression(path) {
        // Find useEffect calls
        if (
          path.node.callee.type === "Identifier" &&
          path.node.callee.name === "useEffect"
        ) {
          stats.totalUseEffects++;

          // Check if it has a dependency array
          const args = path.node.arguments;

          // No dependency array provided (will run on every render)
          if (args.length < 2) {
            stats.useEffectsWithoutDeps++;
            fileHasIssues = true;

            issues.push({
              file: filePath,
              line: path.node.loc?.start.line || "unknown",
              issue:
                "useEffect is missing dependency array - will run on every render",
              severity: "high",
            });
          }
          // Empty dependency array (will run only once)
          else if (
            args[1].type === "ArrayExpression" &&
            args[1].elements.length === 0
          ) {
            stats.useEffectsWithEmptyDeps++;

            // This is usually fine, just count it
          }
        }
      },
    });

    if (fileHasIssues) {
      stats.filesWithIssues.add(filePath);
    }
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error);
  }
}

// Main function
async function main() {
  console.log(
    colorize(
      "Analyzing React useEffect hooks for potential performance issues...",
      "cyan",
    ),
  );
  console.log(
    colorize(
      "This may take a moment depending on the size of your codebase.",
      "cyan",
    ),
  );
  console.log();

  const files = findFiles();
  stats.totalFiles = files.length;

  console.log(colorize(`Found ${files.length} files to analyze.`, "blue"));

  // Analyze each file
  for (const file of files) {
    analyzeFile(file);
  }

  // Print results
  console.log();
  console.log(colorize("=== Analysis Results ===", "bold"));
  console.log();
  console.log(colorize("Summary:", "bold"));
  console.log(`Total files analyzed: ${stats.totalFiles}`);
  console.log(`Total useEffect hooks found: ${stats.totalUseEffects}`);
  console.log(
    `useEffect without dependency array: ${colorize(stats.useEffectsWithoutDeps, stats.useEffectsWithoutDeps > 0 ? "red" : "green")}`,
  );
  console.log(
    `useEffect with empty dependency array: ${stats.useEffectsWithEmptyDeps}`,
  );
  console.log(
    `Files with issues: ${colorize(stats.filesWithIssues.size, stats.filesWithIssues.size > 0 ? "yellow" : "green")}`,
  );

  if (issues.length > 0) {
    console.log();
    console.log(colorize("Issues detected:", "bold"));
    console.log();

    // Group issues by file
    const issuesByFile = {};
    issues.forEach((issue) => {
      if (!issuesByFile[issue.file]) {
        issuesByFile[issue.file] = [];
      }
      issuesByFile[issue.file].push(issue);
    });

    // Print issues by file
    Object.entries(issuesByFile).forEach(([file, fileIssues]) => {
      console.log(colorize(`File: ${file}`, "magenta"));

      fileIssues.forEach((issue) => {
        const severityColor = issue.severity === "high" ? "red" : "yellow";
        console.log(
          `  Line ${issue.line}: ${colorize(issue.issue, severityColor)}`,
        );
      });

      console.log();
    });

    console.log(colorize("Recommendation:", "bold"));
    console.log("1. Add proper dependency arrays to all useEffect hooks");
    console.log(
      '2. Use the eslint plugin "eslint-plugin-react-hooks" with the "exhaustive-deps" rule',
    );
    console.log(
      "3. Consider using memoization with useMemo for expensive calculations",
    );
    console.log(
      "4. Avoid unnecessary re-renders by using React.memo for components",
    );
  } else {
    console.log();
    console.log(colorize("👍 No critical issues found!", "green"));
  }
}

// Run the main function
main().catch((err) => {
  console.error("Error running analysis:", err);
  process.exit(1);
});
