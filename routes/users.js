import { Router } from "express";
var router = Router();
import {
  signup,
  login,
} from "../controllers/users-controllers.js";

router.post("/signup", signup);
router.post("/login", login);

export default router;