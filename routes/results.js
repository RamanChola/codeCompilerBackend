import { Router } from "express";
var router = Router();
import {
  getUserResult,
} from "../controllers/results-controllers.js";
import checkAuth from "../middleware/check-auth.js";

router.use(checkAuth);

router.get("/getUserResult", getUserResult);

export default router;
