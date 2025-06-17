import React from 'react';
import { motion } from 'framer-motion';

function QuizList({ quizzes, onSelectQuiz }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            {quizzes.map((quiz, index) => (
                <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass p-6 hover:shadow-xl transition-transform transform hover:-translate-y-2"
                >
                    <h2 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">{quiz.title}</h2>
                    <p className="text-gray-200 mb-4">{quiz.description}</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => onSelectQuiz(quiz.id)}
                        className="gradient-button"
                    >
                        Take Quiz
                    </motion.button>
                </motion.div>
            ))}
        </motion.div>
    );
}

export default QuizList;