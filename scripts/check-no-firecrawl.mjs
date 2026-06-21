#!/usr/bin/env node
/**
 * CI guard: fail if Firecrawl is reintroduced.
 * - No `@mendable/firecrawl-js` (or any `firecrawl`) entry in package.json
 * - No `firecrawl` references in source (src/, scripts/, app/)
 */
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const errors = [];

// 1) package.json deps
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
  const deps = pkg[field] || {};
  for (const name of Object.keys(deps)) {
    if (/firecrawl/i.test(name)) {
      errors.push(`package.json:${field} contains forbidden dependency "${name}"`);
    }
  }
}

// 2) source grep (ripgrep if available, else grep -R)
const roots = ["src", "scripts", "app"].filter((p) => existsSync(p));
if (roots.length) {
  let hits = "";
  try {
    hits = execSync(
      `rg -n --hidden -S firecrawl ${roots.join(" ")} || true`,
      { encoding: "utf8" },
    );
  } catch {
    hits = "";
  }
  // filter out self-reference
  const lines = hits
    .split("\n")
    .filter(Boolean)
    .filter((l) => !l.includes("check-no-firecrawl"));
  if (lines.length) {
    errors.push("Found 'firecrawl' references in source:\n" + lines.join("\n"));
  }
}

if (errors.length) {
  console.error("❌ Firecrawl guard failed:\n\n" + errors.join("\n\n"));
  process.exit(1);
}
console.log("✅ No Firecrawl references found.");
