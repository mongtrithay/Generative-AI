import { Router } from "express";
import { quizController, getQuiz, getQuizById, delQuizById } from "../controllers/quiz.controller";
import protectRoute from "../middleware/auth";

const router = Router();

router.post("/generate-quiz",protectRoute(), quizController);
router.get("/generate-quiz", protectRoute(), getQuiz);
router.get("/generate-quiz/:id", protectRoute(), getQuizById);
router.delete("/generate-quiz/:id", protectRoute(), delQuizById);

export default router;