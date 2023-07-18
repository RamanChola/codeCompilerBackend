import Question from "../models/Question.js";

const addQuestion = async (req, res) => {
  try {
    const {
      title,
      description,
      test_cases,
      input_type_description,
      output_type_description,
      example_test_cases,
      solution,
    } = req.body;

    const question = new Question({
      title,
      description,
      test_cases,
      input_type_description,
      output_type_description,
      example_test_cases,
      solution,
    });

    const newQuestion = await question.save();

    res.status(201).json(newQuestion);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create question" });
  }
};

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({}, "title"); // Retrieve only the 'title' field

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch question titles" });
  }
};

const getQuestionById = async (req, res) => {
  const question_id = req.query.question_id;
  try {
    const question = await Question.findById(question_id);

    if (question) {
      res.json(question);
    } else {
      res.status(404).json({ error: "Question not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch question" });
  }
}

export { addQuestion, getQuestions, getQuestionById};
