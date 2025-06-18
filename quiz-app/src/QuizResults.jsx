import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function QuizResults() {
    const { quizId, sessionId } = useParams();
    const [results, setResults] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('results'); // 'results' or 'analytics'

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}/results/${sessionId}`);
                if (!res.ok) throw new Error('Failed to fetch results');
                const data = await res.json();
                setResults(data);
               
                const analyticsRes = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}/analytics`);
                if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');
                const analyticsData = await analyticsRes.json();
                setAnalytics({
                    avg_score: isNaN(analyticsData.avg_score) ? 0 : parseFloat(analyticsData.avg_score).toFixed(2),
                    completion_rate: analyticsData.completion_rate || 0,
                    question_performance: analyticsData.question_performance.map(perf => ({
                        id: perf.question_id,
                        percentage: parseFloat(perf.correct_percentage).toFixed(2)
                    }))
                });
            } catch (err) {
                console.error('Error fetching results:', err);
                setError(err.message);
            }
        };

        fetchResults();
    }, [quizId, sessionId]);

    const handleExportCSV = () => {
        window.open(`http://localhost:5000/api/quizzes/${quizId}/results/${sessionId}/export/csv`, '_blank');
    };
    
    const handleExportPDF = () => {
        window.open(`http://localhost:5000/api/quizzes/${quizId}/results/${sessionId}/export/pdf`, '_blank');
    };

    // For social sharing
    const shareUrl = `${window.location.origin}/shared-results/${quizId}/${sessionId}`;
    const shareTitle = results ? `I scored ${results.score} out of ${results.total_points} on "${results.quiz.title}"!` : "Check out my quiz results!";
    
    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
    };

    if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;
    if (!results) return <div className="p-6 text-center">Loading results...</div>;

    const percentage = Math.round((results.score / results.total_points) * 100);

    // Prepare chart data
    const prepareScoreComparisonData = () => {
        return {
            labels: ['Your Score', 'Average Score'],
            datasets: [
                {
                    label: 'Score (%)',
                    data: [percentage, analytics ? parseFloat(analytics.avg_score) : 0],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                    ],
                    borderColor: [
                        'rgb(54, 162, 235)',
                        'rgb(255, 99, 132)',
                    ],
                    borderWidth: 1
                }
            ]
        };
    };

    const prepareQuestionPerformanceData = () => {
        if (!analytics || !results) return null;
        
        const labels = results.answers.map((_, index) => `Q${index + 1}`);
        
        // User performance (1 for correct, 0 for incorrect)
        const userPerformance = results.answers.map(answer => answer.correct ? 100 : 0);
        
        // Average performance from analytics
        const avgPerformance = results.answers.map(answer => {
            const questionId = answer.question_id;
            const question = analytics.question_performance.find(q => q.id === questionId);
            return question ? parseFloat(question.percentage) : 0;
        });
        
        return {
            labels,
            datasets: [
                {
                    label: 'Your Performance',
                    data: userPerformance,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                },
                {
                    label: 'Average Performance',
                    data: avgPerformance,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                }
            ]
        };
    };

    const prepareCorrectVsIncorrectData = () => {
        const correctCount = results.answers.filter(answer => answer.correct).length;
        const incorrectCount = results.answers.length - correctCount;
        
        return {
            labels: ['Correct', 'Incorrect'],
            datasets: [
                {
                    data: [correctCount, incorrectCount],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 99, 132, 0.6)'
                    ],
                    borderColor: [
                        'rgb(75, 192, 192)',
                        'rgb(255, 99, 132)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'white'
                }
            },
            title: {
                display: true,
                color: 'white'
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: {
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'white'
                }
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass p-8"
            >
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Quiz Results</h1>

                <div className="mt-6 p-6 glass">
                    <h2 className="text-2xl font-bold">{results.quiz.title}</h2>
                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <p className="text-xl">Your score: <strong>{results.score} / {results.total_points}</strong></p>
                            <p className="text-lg">Percentage: <strong>{percentage}%</strong></p>
                        </div>
                        {analytics && (
                            <div>
                                <p className="text-md">Average score: <strong>{analytics.avg_score}%</strong></p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-white border-opacity-20 mt-8">
                    <button 
                        className={`py-2 px-4 ${activeTab === 'results' ? 'border-b-2 border-blue-400 text-blue-400' : 'text-black'}`}
                        onClick={() => setActiveTab('results')}
                    >
                        Questions
                    </button>
                    <button 
                        className={`py-2 px-4 ${activeTab === 'analytics' ? 'border-b-2 border-blue-400 text-blue-400' : 'text-black'}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        Analytics
                    </button>
                </div>

                {/* Results Tab Content */}
                {activeTab === 'results' && (
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">Questions</h3>
                        {results.answers.map((answer, index) => {
                            const question = results.quiz.questions.find(q => q.id === answer.question_id);
                            if (!question) return null;
                            
                            const questionPerformance = analytics?.question_performance?.find(p => p.id === question.id);
                            
                            return (
                                <div key={index} className={`p-4 mb-4 rounded-lg ${answer.correct ? 'bg-green-100 bg-opacity-20' : 'bg-red-100 bg-opacity-20'}`}>
                                    <p className="font-semibold">{index + 1}. {question.text}</p>
                                    <p className="mt-1">Your answer: <strong>{answer.user_answer}</strong></p>
                                    <p className="mt-1">Correct answer: <strong>{question.correct_answer}</strong></p>
                                    <div className="flex justify-between mt-2">
                                        <p className={`${answer.correct ? 'text-green-500' : 'text-red-500'}`}>
                                            {answer.correct ? 'Correct' : 'Incorrect'} ({answer.points} points)
                                        </p>
                                        {questionPerformance && (
                                            <p className="text-sm opacity-75">
                                                {questionPerformance.percentage}% of users got this right
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Analytics Tab Content */}
                {activeTab === 'analytics' && analytics && (
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">Performance Analytics</h3>
                        
                        {/* Score Comparison Chart */}
                        <div className="glass p-6 mb-8">
                            <h4 className="text-lg font-semibold mb-4">Your Score vs Average</h4>
                            <div style={{ height: '300px' }}>
                                <Bar data={prepareScoreComparisonData()} options={chartOptions} />
                            </div>
                        </div>
                        
                        {/* Correct vs Incorrect Doughnut Chart */}
                        <div className="glass p-6 mb-8">
                            <h4 className="text-lg font-semibold mb-4">Correct vs Incorrect Answers</h4>
                            <div style={{ height: '300px' }}>
                                <Doughnut data={prepareCorrectVsIncorrectData()} options={doughnutOptions} />
                            </div>
                        </div>
                        
                        {/* Question Performance Comparison */}
                        <div className="glass p-6 mb-8">
                            <h4 className="text-lg font-semibold mb-4">Question Performance</h4>
                            <div style={{ height: '300px' }}>
                                <Bar data={prepareQuestionPerformanceData()} options={chartOptions} />
                            </div>
                            <p className="text-sm mt-4 opacity-75 text-center">
                                This chart shows how you performed on each question compared to other quiz takers.
                            </p>
                        </div>

                        {/* Completion Rate */}
                        <div className="glass p-6 mb-8">
                            <h4 className="text-lg font-semibold mb-2">Quiz Completion Rate</h4>
                            <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-5 mr-4">
                                    <div 
                                        className="bg-blue-600 h-5 rounded-full" 
                                        style={{ width: `${analytics.completion_rate * 100}%` }}
                                    ></div>
                                </div>
                                <span>{(analytics.completion_rate * 100).toFixed(0)}%</span>
                            </div>
                            <p className="text-sm mt-2 opacity-75">
                                Percentage of users who completed this quiz after starting it.
                            </p>
                        </div>
                    </div>
                )}

                {/* Export Options */}
                <div className="mt-8 p-4 glass">
                    <h3 className="text-xl font-semibold mb-2">Export Results</h3>
                    <div className="flex space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={handleExportCSV}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg"
                        >
                            Export as CSV
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={handleExportPDF}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                            Export as PDF
                        </motion.button>
                    </div>
                </div>

                {/* Social Sharing */}
                <div className="mt-8 p-4 glass">
                    <h3 className="text-xl font-semibold mb-2">Share Your Results</h3>
                    <p className="mb-4">Let others know how you did!</p>
                    
                    <div className="flex flex-wrap gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
                            className="px-4 py-2 bg-blue-400 text-white rounded-lg"
                        >
                            Share on Twitter
                        </motion.button>
                        
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                            Share on Facebook
                        </motion.button>
                        
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
                            className="px-4 py-2 bg-blue-800 text-white rounded-lg"
                        >
                            Share on LinkedIn
                        </motion.button>
                    </div>
                    
                    <div className="mt-4 flex">
                        <input 
                            type="text" 
                            value={shareUrl} 
                            readOnly
                            className="p-2 border border-gray-300 rounded-l-lg flex-grow"
                        />
                        <button 
                            onClick={handleCopyLink}
                            className="px-4 py-2 bg-gray-700 text-white rounded-r-lg"
                        >
                            Copy Link
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex justify-between">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => window.location.href = '/'}
                        className="gradient-button"
                    >
                        Back to Quiz List
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => window.location.href = `/quiz/${quizId}`}
                        className="gradient-button"
                    >
                        Retake Quiz
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}

export default QuizResults;