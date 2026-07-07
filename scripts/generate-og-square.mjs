import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const courses = JSON.parse(fs.readFileSync(path.join(rootDir, "courses.json"), "utf8"));
const OG_SIZE = 1200;

function run(command) {
  execSync(command, { stdio: "pipe" });
}

function imageDimensions(filePath) {
  const output = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`, { encoding: "utf8" });
  const width = Number(output.match(/pixelWidth: (\d+)/)?.[1]);
  const height = Number(output.match(/pixelHeight: (\d+)/)?.[1]);
  return { width, height };
}

function createSquareOg(sourcePath, destinationPath) {
  const { width, height } = imageDimensions(sourcePath);
  const cropSize = Math.min(width, height);
  const tmpPath = `${destinationPath}.tmp.jpg`;

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  run(`sips -c ${cropSize} ${cropSize} "${sourcePath}" --out "${tmpPath}"`);
  run(`sips -z ${OG_SIZE} ${OG_SIZE} "${tmpPath}" --out "${destinationPath}"`);
  fs.rmSync(tmpPath, { force: true });
}

function hasSips() {
  try {
    execSync("which sips", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

for (const course of courses) {
  const siteDir = path.join(rootDir, course.siteDir);
  const hugoToml = fs.readFileSync(path.join(siteDir, "hugo.toml"), "utf8");
  const socialImage = hugoToml.match(/socialImage\s*=\s*"(.+?)"/)?.[1] ?? "images/colorchecker.jpg";
  const sourcePath = path.join(siteDir, "static", socialImage);
  const destinationPath = path.join(siteDir, "static", "images", "og-square.jpg");

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing social image for ${course.code}: ${sourcePath}`);
  }

  if (!hasSips()) {
    if (!fs.existsSync(destinationPath)) {
      throw new Error(`Missing ${destinationPath} and sips is unavailable to generate it`);
    }
    console.log(`Using committed ${path.relative(rootDir, destinationPath)} for ${course.code}`);
    continue;
  }

  createSquareOg(sourcePath, destinationPath);
  console.log(`Generated ${path.relative(rootDir, destinationPath)} for ${course.code}`);
}
