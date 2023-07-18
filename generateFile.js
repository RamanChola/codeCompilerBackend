import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dirCodes = join(__dirname, "codes");

if (!existsSync(dirCodes)) {
  mkdirSync(dirCodes, { recursive: true });
}

const generateFile = (format, content) => {
  const jobId = uuid();
  const filename = `${jobId}.${format}`;
  const filepath = join(dirCodes, filename);
  writeFileSync(filepath, content);
  return filepath;
};

export default generateFile

