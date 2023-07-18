import { Schema, Types, model } from "mongoose";

const UserResultSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  question_id: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  test_cases: [
    {
      case_id: { type: String, required: true },
      input: { type: String, required: true },
      output: { type: String, required: true },
      required_output: { type: String, required: true },
      is_correct: { type: Boolean, required: true },
    },
  ],
  score: { type: Number, required: true },
  is_submitted: { type: Boolean, default: false },
  language: { type: String, required: true },
});

export default model("UserResult", UserResultSchema);
