import { Schema, model } from "mongoose";

const questionSchema = new Schema({
  // Your existing question schema fields
  title: String,
  description: String,
  input_type_description: String,
  output_type_description: String,
  example_test_cases: [{
    input: String,
    output: String
  }],
  test_cases: [
    {
      case_id: String,
      input: Schema.Types.Mixed,
      required_output: String,
    },
  ],
  solution: String
});

export default model("Question", questionSchema);
