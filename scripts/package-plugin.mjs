import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, "obsidian-plugin");
const dist = join(root, "dist");
const installDir = join(dist, "diary-review");
const manifest = JSON.parse(readFileSync(join(source, "manifest.json"), "utf8"));
const releaseName = `obsidian-echo-journal-${manifest.version}.zip`;

rmSync(dist, { recursive: true, force: true });
mkdirSync(installDir, { recursive: true });

for (const file of ["main.js", "manifest.json", "styles.css"]) {
  copyFileSync(join(source, file), join(installDir, file));
}

try {
  execFileSync("zip", ["-qr", releaseName, "diary-review"], { cwd: dist, stdio: "inherit" });
  console.log(`Created dist/${releaseName}`);
} catch (error) {
  console.error("Prepared dist/diary-review, but could not create ZIP. Install the system 'zip' command and rerun npm run package.");
  process.exitCode = 1;
}
