import React, { useState } from 'react';
import { motion } from 'framer-motion';

function QuizCreator({ onCreateQuiz }) {
    const [quiz, setQuiz] = useState({
        title: '',
        description: '',
        time_limit: 30,
        is_public: true,
        questions: []
    });

    const addQuestion = () => {
        setQuiz({
            ...quiz,
            questions: [...quiz.questions, {
                id: Date.now().toString(),
                text: '',
                type: 'multiple',
                options: ['', '', '', ''],
                correct_answer: 0,
                points: 10
            }]
        });
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...quiz.questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQuestions = [...quiz.questions];
        const newOptions = [...newQuestions[qIndex].options];
        newOptions[oIndex] = value;
        newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...quiz, created_by: 'user' })
            });
            if (!response.ok) throw new Error('Failed to create quiz');
            onCreateQuiz();
            setQuiz({ title: '', description: '', time_limit: 30, is_public: true, questions: [] });
        } catch (error) {
            console.error('Error creating quiz:', error);
            alert('Failed to create quiz. Please try again.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto p-6"
        >
            <div className="glass p-8">
                <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Create New Quiz</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Quiz Title</label>
                        <input
                            type="text"
                            placeholder="Enter quiz title"
                            value={quiz.title}
                            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                            className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            placeholder="Enter description"
                            value={quiz.description}
                            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                            className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
                        <input
                            type="number"
                            placeholder="Time limit"
                            value={quiz.time_limit}
                            onChange={(e) => setQuiz({ ...quiz, time_limit: parseInt(e.target.value) })}
                            className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
                            required
                        />
                    </div>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={quiz.is_public}
                            onChange={(e) => setQuiz({ ...quiz, is_public: e.target.checked })}
                            className="form-checkbox text-teal-400"
                        />
                        <span>Public Quiz</span>
                    </label>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        type="button"
                        onClick={addQuestion}
                        className="gradient-button"
                    >
                        Add Question
                    </motion.button>
                    {quiz.questions.map((question, index) => (
                        <motion.div
                            key={question.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-6 mt-4"
                        >
                            <input
                                type="text"
                                placeholder="Question Text"
                                value={question.text}
                                onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                                className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400 mb-4"
                                required
                            />
                            <select
                                value={question.type}
                                onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                                className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black focus:ring-2 focus:ring-teal-400 mb-4"
                            >
                                <option value="multiple">Multiple Choice</option>
                                <option value="true_false">True/False</option>
                                <option value="text">Text</option>
                            </select>
                            {question.type === 'multiple' && question.options.map((option, optIndex) => (
                                <input
                                    key={optIndex}
                                    type="text"
                                    placeholder={`Option ${optIndex + 1}`}
                                    value={option}
                                    onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400 mb-2"
                                    required
                                />
                            ))}
                            {question.type === 'multiple' && (
                                <select
                                    value={question.correct_answer}
                                    onChange={(e) => updateQuestion(index, 'correct_answer', parseInt(e.target.value))}
                                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black focus:ring-2 focus:ring-teal-400 mb-4"
                                >
                                    {question.options.map((_, i) => (
                                        <option key={i} value={i}>Option {i + 1}</option>
                                    ))}
                                </select>
                            )}
                            <input
                                type="number"
                                placeholder="Points"
                                value={question.points}
                                onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                                className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400 mb-4"
                                required
                            />
                        </motion.div>
                    ))}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        type="submit"
                        className="gradient-button"
                    >
                        Create Quiz
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
}

export default QuizCreator;