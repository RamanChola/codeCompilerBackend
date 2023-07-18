import { exec } from "child_process";
import { existsSync, mkdirSync, writeFile } from "fs";
import { join, basename, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputPath = join(__dirname, "outputs");

if (!existsSync(outputPath)) {
  mkdirSync(outputPath, { recursive: true });
}

const executePy = (filepath, input, timeout) => {
  const jobId = basename(filepath).split(".")[0];
  const inputPath = join(outputPath, `${jobId}.in`);

  return new Promise((resolve, reject) => {
    writeFile(inputPath, input, (err) => {
      if (err) {
        reject(err);
      } else {
        const command = `python3 ${filepath} < ${inputPath}`;

        const execution = exec(command, (error, stdout, stderr) => {
          error && reject({ error, stderr });
          stderr && reject(stderr);
          resolve(stdout);
        });

        // Set a timeout for the execution
        const timeoutId = setTimeout(() => {
          execution.kill();
          reject("Execution timed out.");
        }, timeout);

        // Clear the timeout if the execution completes before the timeout
        execution.on("exit", () => {
          clearTimeout(timeoutId);
        });
      }
    });
  });
};

export default executePy

