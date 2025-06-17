const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();

// MongoDB Atlas connection
mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected to MongoDB Atlas')).catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schemas
const quizSchema = new mongoose.Schema({
    id: { type: String, default: uuidv4, unique: true },
    title: String,
    description: String,
    time_limit: Number,
    is_public: Boolean,
    created_by: String,
    questions: [{
        id: { type: String, default: uuidv4 },
        text: String,
        type: { type: String, enum: ['multiple', 'true_false', 'text'] },
        options: [String],
        correct_answer: mongoose.Mixed,
        points: Number
    }]
});

const quizSessionSchema = new mongoose.Schema({
    session_id: { type: String, default: uuidv4, unique: true },
    quiz_id: String,
    user_name: String,
    started_at: Date,
    completed_at: Date,
    score: Number,
    answers: [{
        question_id: String,
        user_answer: mongoose.Mixed,
        correct: Boolean,
        points: Number
    }]
});

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizSession = mongoose.model('QuizSession', quizSessionSchema);

// Quiz Management Routes
app.post('/api/quizzes', async (req, res) => {
    try {
        const quiz = new Quiz(req.body);
        await quiz.save();
        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/quizzes', async (req, res) => {
    try {
        const quizzes = await Quiz.find({ is_public: true }).select('-questions.correct_answer');
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/quizzes/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ id: req.params.id }).select('-questions.correct_answer');
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/quizzes/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findOneAndUpdate({ id: req.params.id, created_by: req.body.created_by }, req.body, { new: true });
        if (!quiz) return res.status(404).json({ error: 'Quiz not found or unauthorized' });
        res.json(quiz);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/quizzes/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findOneAndDelete({ id: req.params.id, created_by: req.body.created_by });
        if (!quiz) return res.status(404).json({ error: 'Quiz not found or unauthorized' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Quiz Taking Routes
app.post('/api/quizzes/:id/start', async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ id: req.params.id });
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        
        const session = new QuizSession({
            quiz_id: quiz.id,
            user_name: 'anonymous',
            started_at: new Date()
        });
        await session.save();

        res.json({ quiz, session_id: session.session_id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/quizzes/:id/submit', async (req, res) => {
    try {
        const { session_id, answers } = req.body;
        const session = await QuizSession.findOne({ session_id });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const quiz = await Quiz.findOne({ id: req.params.id });
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        let score = 0;
        const processedAnswers = Object.entries(answers).map(([questionIndex, userAnswer]) => {
            const question = quiz.questions[parseInt(questionIndex)];
            const correct = userAnswer == question.correct_answer; // Loose comparison for flexibility
            const points = correct ? question.points : 0;
            score += points;
            return {
                question_id: question.id,
                user_answer: userAnswer,
                correct,
                points
            };
        });

        session.answers = processedAnswers;
        session.score = score;
        session.completed_at = new Date();
        await session.save();

        res.json({ session_id, score, total_points: quiz.questions.reduce((sum, q) => sum + q.points, 0), quiz, answers: processedAnswers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/quizzes/:id/results/:session_id', async (req, res) => {
    try {
        const session = await QuizSession.findOne({ session_id: req.params.session_id });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const quiz = await Quiz.findOne({ id: req.params.id });
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        res.json({
            score: session.score,
            total_points: quiz.questions.reduce((sum, q) => sum + q.points, 0),
            quiz,
            answers: session.answers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/quizzes/:id/analytics', async (req, res) => {
    try {
        const sessions = await QuizSession.find({ quiz_id: req.params.id });
        const quiz = await Quiz.findOne({ id: req.params.id });
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(s => s.completed_at).length;
        const completedSessionsData = sessions.filter(s => s.completed_at && typeof s.score === 'number');

        // Calculate average score as percentage
        const avgScore = completedSessionsData.length > 0
            ? (completedSessionsData.reduce((sum, s) => sum + (s.score / quiz.questions.reduce((sum, q) => sum + q.points, 0) * 100), 0) / completedSessionsData.length).toFixed(2)
            : 0;

        // Calculate question performance based on completed sessions only
        const questionPerformance = quiz.questions.map((q, index) => {
            const correctAnswers = completedSessionsData.reduce((count, s) => {
                const answer = s.answers.find(a => a.question_id === q.id);
                return count + (answer && answer.correct ? 1 : 0);
            }, 0);
            return {
                question_id: q.id,
                correct_percentage: completedSessionsData.length > 0 ? (correctAnswers / completedSessionsData.length * 100).toFixed(2) : 0
            };
        });

        res.json({
            avg_score: parseFloat(avgScore),
            completion_rate: totalSessions > 0 ? completedSessions / totalSessions : 0,
            question_performance: questionPerformance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
