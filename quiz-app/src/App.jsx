import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QuizList from './QuizList';
import QuizCreator from './QuizCreator';
import QuizTaker from './QuizTaker';
import QuizResults from './QuizResults';

function App() {
    const [view, setView] = useState('list');
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuizId, setSelectedQuizId] = useState(null);
    const [sessionId, setSessionId] = useState(null);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/quizzes');
            if (!response.ok) throw new Error('Failed to fetch quizzes');
            const data = await response.json();
            setQuizzes(data);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            alert('Failed to load quizzes. Please try again.');
        }
    };

    const handleViewChange = (newView, quizId = null, session = null) => {
        setView(newView);
        if (quizId) setSelectedQuizId(quizId);
        if (session) setSessionId(session);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-screen h-screen overflow-auto"
        >
            <nav className="glass sticky top-0 z-10 p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <motion.h1
                        initial={{ x: -20 }}
                        animate={{ x: 0 }}
                        className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400"
                    >
                        QuizVerse
                    </motion.h1>
                    <div className="space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleViewChange('list')}
                            className="text-white hover:text-teal-300 transition"
                        >
                            Home
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleViewChange('creator')}
                            className="gradient-button"
                        >
                            Create Quiz
                        </motion.button>
                    </div>
                </div>
            </nav>
            <main className="p-6">
                {view === 'list' && <QuizList quizzes={quizzes} onSelectQuiz={(id) => handleViewChange('taker', id)} />}
                {view === 'creator' && <QuizCreator onCreateQuiz={() => { fetchQuizzes(); handleViewChange('list'); }} />}
                {view === 'taker' && <QuizTaker quizId={selectedQuizId} onComplete={(result) => handleViewChange('results', selectedQuizId, result.session_id)} />}
                {view === 'results' && <QuizResults quizId={selectedQuizId} sessionId={sessionId} />}
            </main>
        </motion.div>
    );
}

export default App;