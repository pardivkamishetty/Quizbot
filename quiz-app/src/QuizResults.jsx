import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function QuizResults({ quizId, sessionId }) {
    const [results, setResults] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}/results/${sessionId}`);
                if (!res.ok) throw new Error('Failed to fetch results');
                const data = await res.json();
                setResults(data);

                const analyticsRes = await fetch(`http://localhost:5000/api/quizzes/${quizId}/analytics`);
                if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');
                const analyticsData = await analyticsRes.json();
                setAnalytics({
                    avg_score: isNaN(analyticsData.avg_score) ? 0 : parseFloat(analyticsData.avg_score).toFixed(2),
                    completion_rate: analyticsData.completion_rate || 0,
                    question_performance: analyticsData.question_performance.map(perf => ({
                        ...perf,
                        correct_percentage: isNaN(perf.correct_percentage) ? 0 : parseFloat(perf.correct_percentage).toFixed(2)
                    }))
                });
            } catch (error) {
                console.error('Error fetching results:', error);
                setError('Failed to load results. Please try again.');
            }
        };
        fetchResults();
    }, [quizId, sessionId]);

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-6 text-2xl text-red-400"
            >
                {error}
            </motion.div>
        );
    }

    if (!results || !analytics) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-6 text-2xl"
            >
                Loading...
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto p-6"
        >
            <div className="glass p-8">
                <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Quiz Results</h1>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-semibold mb-4">Your Score: {results.score}/{results.total_points} ({((results.score / results.total_points) * 100).toFixed(2)}%)</h2>
                    {results.answers.map((answer, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="mb-6 p-4 glass"
                        >
                            <p className="font-medium text-lg">{results.quiz.questions[index].text}</p>
                            <p className="text-gray-200">Your Answer: {answer.user_answer}</p>
                            <p className="text-gray-200">Correct Answer: {results.quiz.questions[index].correct_answer}</p>
                            <p className={answer.correct ? 'text-teal-400' : 'text-red-400'}>
                                {answer.correct ? 'Correct' : 'Incorrect'} ({answer.points} points)
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6"
                >
                    <h2 className="text-2xl font-semibold mb-4">Quiz Analytics</h2>
                    <p className="text-gray-200 mb-2">Average Score: {analytics.avg_score}%</p>
                    <p className="text-gray-200 mb-4">Completion Rate: {(analytics.completion_rate * 100).toFixed(2)}%</p>
                    <h3 className="font-medium mb-4">Question Performance</h3>
                    <div className="space-y-4">
                        {analytics.question_performance.map((perf, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center"
                            >
                                <span className="w-24 text-sm">Question {index + 1}</span>
                                <div className="w-full bg-white/20 rounded-lg h-3">
                                    <motion.div
                                        className="bg-gradient-to-r from-teal-400 to-blue-400 h-3 rounded-lg"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${perf.correct_percentage}%` }}
                                        transition={{ duration: 0.8 }}
                                    />
                                </div>
                                <span className="ml-3 text-sm">{perf.correct_percentage}%</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default QuizResults;