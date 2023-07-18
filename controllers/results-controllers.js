import UserResult from "../models/UserResult.js";

const getUserResult = async (req, res) => {
  try {
    const user_id = req.query.uid;
    const question_id = req.query.qid;
    const userResult = await UserResult.find({
      user_id,
      question_id,
    })

    if (!userResult) {
      return res.status(404).json({ message: "Question not submitted by user" });
    }
    return res.status(200).json(userResult);
  } catch (error) {
    res.status(500).json({ message: "Failed to get the user's result", error });
  }
};

export { getUserResult };