import { Router } from "express";
var router = Router();
import {
  addQuestion,
  getQuestions,
  getQuestionById,
} from "../controllers/questions-controllers.js";

router.post("/addQuestion", addQuestion);
router.get("/getQuestions", getQuestions);
router.get("/getQuestionById", getQuestionById);

export default router;
