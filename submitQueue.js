import Queue from "bull";
import Job from "./models/Job.js";
import executeCpp from "./executeCpp.js";
import executePy from "./executePy.js";
import Question from "./models/Question.js";
import UserResult from "./models/UserResult.js";
import Bull from "bull";

// Create a Bull queue
const jobQueue = new Bull("job-submit-queue", {
  redis: {
    host: "redis",
    port: 6379,
  },
});

const NUM_WORKERS = 5;

// Setting the job timeout duration in milliseconds
const JOB_TIMEOUT = 20000; // 20 seconds

jobQueue.process(NUM_WORKERS, async ({ data }) => {
  const jobId = data.id;
  let job = await Job.findById(jobId);
  const question = await Question.findById(data.question_id);
  if (!job) {
    throw new Error(`Cannot find Job with id ${jobId}`);
  }
  if (!question) {
    throw new Error(`Cannot find Question with id ${data.question_id}`);
  }

  const testCasesResults = [];
  let passedTestCases = 0;
  try {
    let testCaseOutput;
    job.startedAt = new Date();
    
    for (let testCase of question.test_cases) {
      if (job.language === "cpp") {
        testCaseOutput = await executeCpp(
          job.filepath,
          testCase.input,
          JOB_TIMEOUT
        );
      } else if (job.language === "py") {
        testCaseOutput = await executePy(
          job.filepath,
          testCase.input,
          JOB_TIMEOUT
        );
      }
      
      let normalizedOutput = testCaseOutput.replace(/\r\n/g, "\n").trim();
      let normalizedReqOut = testCase.required_output
        .replace(/\r\n/g, "\n")
        .trim();

      let isCorrect = normalizedOutput === normalizedReqOut;

      if (isCorrect) {
        passedTestCases++;
      }
      
      const testCaseResult = {
        case_id: testCase.case_id,
        input: testCase.input,
        output: normalizedOutput,
        required_output: normalizedReqOut,
        is_correct: isCorrect,
      };

      testCasesResults.push(testCaseResult);
    }
    
    job.completedAt = new Date();
    job.output = JSON.stringify(testCasesResults);
    job.status = "success";
    await job.save();
    
    const userResult = new UserResult({
      user_id: job.user_id,
      question_id: data.question_id,
      start_time: job.startedAt,
      end_time: new Date(),
      test_cases: testCasesResults,
      score: passedTestCases,
      is_submitted: true,
      language: job.language,
    });
    // Save the user result document
    await userResult.save();
    

    return true;
  } catch (err) {
    job.completedAt = new Date();
    job.output = JSON.stringify(err);
    job.status = "error";
    await job.save();
    const userResult = new UserResult({
      user_id: job.user_id,
      question_id: data.question_id,
      start_time: job.startedAt,
      end_time: new Date(),
      test_cases: testCasesResults,
      score: passedTestCases,
      is_submitted: true,
      language: job.language,
    });
    // Save the user result document
    await userResult.save();
    throw new Error(JSON.stringify(err));
  }
});

jobQueue.on("failed", (error) => {
  console.error(error.data.id, error.failedReason);
});

const addJobToSubmitQueue = async (jobId, question_id) => {
  jobQueue.add({
    id: jobId,
    question_id: question_id,
  });
};

export { addJobToSubmitQueue };
