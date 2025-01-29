import { Request, Response } from "express";
import { AppDataSource } from "../config";
import { Quiz } from "../entity/quiz.entity";
import { UserInfo } from "../entity/user.entity";
import { ollamaNoStream } from "../service/ollamaChat";
import { extractQuizArray } from "../utils/extraQuiz";

export const quizController = async (req: Request, res: Response) => {
    const { topic } = req.body;
    const quiz = AppDataSource.getRepository(Quiz);
    const userRepo = AppDataSource.getRepository(UserInfo);

    if (!topic) {
        return res.status(400).json({ message: "topic is required." });
    }

    try {

        const user = await userRepo.findOne({ where: { id: req.user?.id } })
        if (!user) {
            return res.status(404).json({
                message: "user not found",
            })
        }

        const query = `
You are a helpful coding assistant. I want you to create a exercise quizzes in the form of an array of objects. Each object should contain 3 properties: 
        
'question': the question base on topic of user input.
'options': 5 options, 4 incorrect answer and for correct answer.
'correctAnswer': the correction answer.

        Your response only be in this format without any other text outside of array:
        [
        {
            "question": "question 1",
            "options": ["option 1", "option 2", "option 3", "option 4", "option 5"] 
            "correctAnswer": "correct option"
        },
        ]

        Now, create a ${topic} quizzes.`

        const response = await ollamaNoStream([{ role: 'user', content: query }])
        const quizArray = JSON.parse(response.message.content)

        // In loop to save quiz
        console.log(quizArray, '========');
        console.log(response.message.content, "+++++++++++");

        for (const items of quizArray) {
            const quiz = new Quiz();
            quiz.user = items.title;
            quiz.question = items.question;
            quiz.options = items.options
            quiz.correctAnswer = items.correctAnswer
            const quizrepository = AppDataSource.getRepository(Quiz);
            await quizrepository.save(quiz);
        }
        if (topic) {
            res.status(201).json({quiz: user, response: quizArray})
        }


    } catch (error) {
        console.error(error);
        res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
        res.end();
    }
};

export const getQuiz = async (req: Request, res: Response) => {
    const quiz = AppDataSource.getRepository(Quiz);

    try {
        const allQuiz = await quiz.find();
        if (!allQuiz) {
            return res.status(404).json({
                message: "quiz not found"
            })
        }

        const Quiz = allQuiz;

        return res.status(201).json({
            Quiz
        })



    } catch (err) {
        return res.status(500).json({
            message: "Internal server"
        })
    }
}

export const getQuizById = async (req: Request, res: Response) => {
    const quiz = AppDataSource.getRepository(Quiz);
    const quizId = req.params.id;

    try {
        const allQuiz = await quiz.findOneBy({ id: quizId });
        if (!allQuiz) {
            return res.status(404).json({
                message: "quiz not found"
            })
        }

        const Quiz = allQuiz;

        return res.status(201).json({
            Quiz
        })



    } catch (err) {
        return res.status(500).json({
            message: "Internal server"
        })
    }
}

export const delQuizById = async (req: Request, res: Response) => {
    const quiz = AppDataSource.getRepository(Quiz);
    const quizId = req.params.id;

    try {
        const allQuiz = await quiz.findOneBy({ id: quizId });
        await quiz.delete({ id: quizId });
        if (!allQuiz) {
            return res.status(404).json({
                message: "quiz not found"
            })
        }

        const Quiz = allQuiz;

        return res.status(201).json({
            Quiz
        })



    } catch (err) {
        return res.status(500).json({
            message: "Internal server"
        })
    }
}