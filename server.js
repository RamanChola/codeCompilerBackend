import express, { json } from "express";
import cors from "cors";
const app = express();
import { connect, set } from "mongoose";
const port = process.env.PORT || 5000;
import { config } from "dotenv";
import users from "./routes/users.js";
import results from "./routes/results.js";
import questions from "./routes/questions.js";
import generateFile from "./generateFile.js";
import { addJobToQueue } from "./jobQueue.js";
import { addJobToSubmitQueue } from "./submitQueue.js";
import Job from "./models/Job.js";
import checkAuth from "./middleware/check-auth.js";
config();

set("strictQuery", true);
connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.use("/api/users", users);
app.use("/api/result", results);
app.use("/api/questions", questions);

app.post("/run", async (req, res) => {
  const { language = "cpp", code, input } = req.body;
  console.log(req.body);
  console.log(language, "Length:", code.length);

  if (code === undefined) {
    return res.status(400).json({ success: false, error: "Empty code body!" });
  }
  // need to generate a c++ file with content from the request
  const filepath = generateFile(language, code);
  // write into DB
  const job = await new Job({ language, filepath }).save();
  const jobId = job["_id"];
  addJobToQueue(jobId, input);
  res.status(201).json({ jobId });
});

app.get("/status", async (req, res) => {
  const jobId = req.query.id;

  if (jobId === undefined) {
    return res
      .status(400)
      .json({ success: false, error: "missing id query param" });
  }

  const job = await Job.findById(jobId);

  if (job === undefined) {
    return res.status(400).json({ success: false, error: "couldn't find job" });
  }

  return res.status(200).json({ success: true, job });
});

app.use(checkAuth);
app.post("/submit", async (req, res) => {
  const { language = "cpp", code, question_id } = req.body;

  const user_id = req.query.uid;
  // checking if the user is submitting their own question
  if (user_id !== req.userData.userId) {
    return res.status(401).json("You are not authorized to submit");
  }
  if (code === undefined) {
    return res.status(400).json({ success: false, error: "Empty code body!" });
  }
  // need to generate a c++ file with content from the request
  const filepath = generateFile(language, code);
  // write into DB
  const job = await new Job({ user_id, language, filepath }).save();
  const jobId = job["_id"];
  addJobToSubmitQueue(jobId, question_id);
  res.status(201).json({ jobId });
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
