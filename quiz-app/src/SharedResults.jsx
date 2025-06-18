import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from './App';

function SharedResults() {
    const { quizId, sessionId } = useParams();
    const [sharedResult, setSharedResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSharedResult = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/shared-results/${sessionId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch shared results');
                }
                const data = await response.json();
                setSharedResult(data);
            } catch (err) {
                console.error('Error fetching shared results:', err);
                setError('Could not load quiz results. The link might be invalid or expired.');
            } finally {
                setLoading(false);
            }
        };

        fetchSharedResult();
    }, [quizId, sessionId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="glass p-8 text-center">
                    <h2 className="text-xl font-semibold">Loading shared results...</h2>
                    <div className="mt-4 flex justify-center">
                        <div className="loader"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="glass p-8 text-center">
                    <h2 className="text-xl font-semibold text-red-500">Error</h2>
                    <p className="mt-2">{error}</p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        );
    }

    if (!sharedResult) {
        return null;
    }

    const { quiz_title, user_name, score, total_points, percentage, completed_at } = sharedResult;
    const completedDate = new Date(completed_at).toLocaleString();

    // Determine result level based on percentage
    let resultLevel = 'Amazing!';
    let resultColor = 'from-green-400 to-blue-500';
    
    if (percentage < 40) {
        resultLevel = 'Keep practicing!';
        resultColor = 'from-red-400 to-orange-400';
    } else if (percentage < 70) {
        resultLevel = 'Good job!';
        resultColor = 'from-yellow-400 to-orange-400';
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass w-full max-w-lg p-8"
            >
                <div className="text-center">
                    <h1 className="text-2xl font-bold">{quiz_title}</h1>
                    <p className="mt-2 text-lg">Shared Result</p>

                    <div className="my-8">
                        <motion.div 
                            className={`text-4xl font-bold bg-gradient-to-r ${resultColor} bg-clip-text text-transparent`}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                        >
                            {percentage}%
                        </motion.div>
                        <p className="text-xl mt-1">{resultLevel}</p>
                        <p className="mt-4">{score} points out of {total_points}</p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white border-opacity-20">
                        <p><span className="font-semibold">Completed by:</span> {user_name}</p>
                        <p><span className="font-semibold">Date:</span> {completedDate}</p>
                    </div>

                    <div className="mt-8">
                        <p className="mb-4">Take this quiz yourself!</p>
                        <button 
                            onClick={() => window.location.href = `/quiz/${quizId}`}
                            className="gradient-button"
                        >
                            Try this Quiz
                        </button>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white border-opacity-20">
                        <p className="text-sm opacity-70">Results shared via the Quiz App</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default SharedResults;