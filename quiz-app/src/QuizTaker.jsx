import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function QuizTaker({ quizId, onComplete }) {
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [sessionId, setSessionId] = useState(null);

    useEffect(() => {
        const startQuiz = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}/start`, { method: 'POST' });
                if (!response.ok) throw new Error('Failed to start quiz');
                const data = await response.json();
                setQuiz(data.quiz);
                setSessionId(data.session_id);
                setTimeLeft(data.quiz.time_limit * 60);
            } catch (error) {
                console.error('Error starting quiz:', error);
                alert('Failed to start quiz. Please try again.');
            }
        };
        startQuiz();
    }, [quizId]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(time => time - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && quiz) {
            submitQuiz();
        }
    }, [timeLeft, quiz]);

    const submitQuiz = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, answers })
            });
            if (!response.ok) throw new Error('Failed to submit quiz');
            const result = await response.json();
            onComplete(result);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz. Please try again.');
        }
    };

    const handleAnswer = (questionIndex, answer) => {
        setAnswers({ ...answers, [questionIndex]: answer });
    };

    if (!quiz) return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 text-2xl"
        >
            Loading...
        </motion.div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto p-6"
        >
            <div className="glass p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">{quiz.title}</h1>
                    <div className="text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                </div>
                <div className="mb-6">
                    <div className="w-full bg-white bg-opacity-20 rounded-full h-2.5">
                        <motion.div
                            className="bg-gradient-to-r from-teal-400 to-blue-400 h-2.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                >
                    <h2 className="text-2xl font-semibold mb-6">{quiz.questions[currentQuestion].text}</h2>
                    {quiz.questions[currentQuestion].type === 'multiple' && quiz.questions[currentQuestion].options.map((option, index) => (
                        <motion.label
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center mb-4 cursor-pointer"
                        >
                            <input
                                type="radio"
                                name={`question-${currentQuestion}`}
                                value={index}
                                checked={answers[currentQuestion] === index}
                                onChange={() => handleAnswer(currentQuestion, index)}
                                className="form-radio text-teal-400 mr-3"
                            />
                            <span className="text-gray-100">{option}</span>
                        </motion.label>
                    ))}
                    {quiz.questions[currentQuestion].type === 'true_false' && (
                        <div className="space-y-4">
                            {['true', 'false'].map((value) => (
                                <motion.label
                                    key={value}
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion}`}
                                        value={value}
                                        checked={answers[currentQuestion] === value}
                                        onChange={() => handleAnswer(currentQuestion, value)}
                                        className="form-radio text-teal-400 mr-3"
                                    />
                                    <span className="text-gray-100">{value.charAt(0).toUpperCase() + value.slice(1)}</span>
                                </motion.label>
                            ))}
                        </div>
                    )}
                    {quiz.questions[currentQuestion].type === 'text' && (
                        <textarea
                            value={answers[currentQuestion] || ''}
                            onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                            className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
                            placeholder="Enter your answer"
                        />
                    )}
                    <div className="flex justify-between mt-8">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                            className="gradient-button bg-gradient-to-r from-gray-500 to-gray-600 disabled:opacity-50"
                            disabled={currentQuestion === 0}
                        >
                            Previous
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => currentQuestion < quiz.questions.length - 1 ? setCurrentQuestion(currentQuestion + 1) : submitQuiz()}
                            className="gradient-button"
                        >
                            {currentQuestion < quiz.questions.length - 1 ? 'Next' : 'Submit'}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default QuizTaker;