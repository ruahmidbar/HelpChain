const fs = require("fs");
const path = require("path");

const expectedPaths = [
  "@/api/base44Client",
  "@/utils",
  "@/components/ui/button",
  "@/components/ui/input",
  "@/components/ui/label",
  "@/components/ui/select",
  "@/components/ui/dialog",
  "@/components/ui/textarea",
  "@/components/ui/badge",
  "@/components/ui/card",
  "@/components/ui/tabs",
  "@/components/ui/alert",
  "@/components/ui/checkbox"
];

console.log("🔍 בודק קבצים ותיקיות חסרים...\n");

const srcBase = path.join(process.cwd(), "src");

let missing = [];

for (const p of expectedPaths) {
  const clean = p.replace("@/", ""); // remove '@/'
  const full = path.join(srcBase, clean);

  if (!fs.existsSync(full + ".jsx") && 
      !fs.existsSync(full + ".js") &&
      !fs.existsSync(full + ".tsx") &&
      !fs.existsSync(full + ".ts") &&
      !fs.existsSync(full)) {

    missing.push("src/" + clean);
  }
}

if (missing.length === 0) {
  console.log("✅ כל הקבצים והתיקיות המקומיים קיימים. מעולה!");
} else {
  console.log("❌ נמצאו נתיבים חסרים:");
  missing.forEach((m) => console.log("   - " + m));

  console.log("\n📁 עליך ליצור אותם בתיקיית src בדיוק במבנה הזה.");
}

console.log();
