import Queue from "bull";
import Job from "./models/Job.js";
import executeCpp from "./executeCpp.js";
import executePy from "./executePy.js";
import Question from "./models/Question.js";
import User from "./models/User.js";
import Bull from "bull";

// Create a Bull queue
const jobQueue = new Bull("job-runner-queue", {
  redis: {
    host: "redis",
    port: 6379,
  },
});

const NUM_WORKERS = 5;

// Setting the job timeout duration in milliseconds
const JOB_TIMEOUT = 10000; // 10 seconds

jobQueue.process(NUM_WORKERS, async ({ data }) => {
  const jobId = data.id;
  const input = data.input;
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error(`Cannot find Job with id ${jobId}`);
  }

  try {
    console.log("executed");
    let output;
    job.startedAt = new Date();
    // need to change this
    if (job.language === "cpp") {
      output = await executeCpp(job.filepath, input, JOB_TIMEOUT);
    } else if (job.language === "py") {
      output = await executePy(job.filepath, input, JOB_TIMEOUT);
    }
    console.log("executed");
    job.completedAt = new Date();
    job.output = output;
    job.status = "success";
    await job.save();
    return true;
  } catch (err) {
    console.log(err);
    const { stderr } = err;
    if (job.language === "cpp") {
      const errorLines = stderr
        .split("\n")
        .filter((line) => line.includes("error:"));
      const firstErrorLine = errorLines[0];
      const line = stderr.match(/\:(\d+)/)[1];
      const errorMessageStart =
        firstErrorLine.indexOf("error:") + "error:".length;
      const errorMessage = firstErrorLine.slice(errorMessageStart).trim();
      job.completedAt = new Date();
      job.output = `Error occurred at line ${line}: ${errorMessage}`;
      job.status = "error";
      console.log("here");
      await job.save();
      throw new Error(`Error occurred at line ${line}: ${errorMessage}`);
    } else {
      const errorLines = stderr.split("\n"); // Split the stderr content by line breaks

      if (errorLines.length > 0) {
        // Check if stderr contains any error lines
        const errorMessage = errorLines[errorLines.length - 2];

        // Check if errorMessage is not undefined before extracting errorExplanation
        const errorExplanation = errorMessage
          ? errorMessage.substring(errorMessage.indexOf(":") + 2)
          : "Unknown Error";

        // Extract the line number from the first line of the error
        const errorLine = errorLines[0].substring(
          errorLines[0].lastIndexOf("line ") + 5
        );

        // Update job data
        job.completedAt = new Date();
        job.output = `Error occurred at line ${errorLine}: ${errorExplanation}`;
        job.status = "error";
        await job.save();

        // Throw an error with the extracted information
        throw new Error(
          `Error occurred at line ${errorLine}: ${errorExplanation}`
        );
      }
    }
  }
});

jobQueue.on("failed", (error) => {
  console.error(error.data.id, error.failedReason);
});

const addJobToQueue = async (jobId, input) => {
  jobQueue.add({
    id: jobId,
    input: input,
  });
};

export { addJobToQueue };
