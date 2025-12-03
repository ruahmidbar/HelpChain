// save as check-missing-deps.cjs
const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");
const packageJson = require(path.join(__dirname, "package.json"));

const installedDeps = Object.keys(packageJson.dependencies || {});
const importedDeps = new Set();

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const importRegex = /import\s+(?:.+?\s+from\s+)?["']([^./][^"']*)["']/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    importedDeps.add(match[1]);
  }
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith(".js") || fullPath.endsWith(".jsx")) {
      scanFile(fullPath);
    }
  }
}

scanDir(srcDir);

const missingDeps = Array.from(importedDeps).filter(dep => !installedDeps.includes(dep));

if (missingDeps.length === 0) {
  console.log("✅ כל הספריות מותקנות");
} else {
  console.log("📦 ספריות חסרות:", missingDeps.join(", "));
  console.log("\n🔧 התקנה עם npm:");
  console.log(`npm install ${missingDeps.join(" ")}`);
}
