// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';

// function QuizTaker({ quizId, onComplete }) {
//     const [quiz, setQuiz] = useState(null);
//     const [currentQuestion, setCurrentQuestion] = useState(0);
//     const [answers, setAnswers] = useState({});
//     const [timeLeft, setTimeLeft] = useState(0);
//     const [sessionId, setSessionId] = useState(null);

//     useEffect(() => {
//         const startQuiz = async () => {
//             try {
//                 const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}/start`, { method: 'POST' });
//                 if (!response.ok) throw new Error('Failed to start quiz');
//                 const data = await response.json();
//                 setQuiz(data.quiz);
//                 setSessionId(data.session_id);
//                 setTimeLeft(data.quiz.time_limit * 60);
//             } catch (error) {
//                 console.error('Error starting quiz:', error);
//                 alert('Failed to start quiz. Please try again.');
//             }
//         };
//         startQuiz();
//     }, [quizId]);

//     useEffect(() => {
//         if (timeLeft > 0) {
//             const timer = setInterval(() => setTimeLeft(time => time - 1), 1000);
//             return () => clearInterval(timer);
//         } else if (timeLeft === 0 && quiz) {
//             submitQuiz();
//         }
//     }, [timeLeft, quiz]);

//     const submitQuiz = async () => {
//         try {
//             const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}/submit`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ session_id: sessionId, answers })
//             });
//             if (!response.ok) throw new Error('Failed to submit quiz');
//             const result = await response.json();
//             onComplete(result);
//         } catch (error) {
//             console.error('Error submitting quiz:', error);
//             alert('Failed to submit quiz. Please try again.');
//         }
//     };

//     const handleAnswer = (questionIndex, answer) => {
//         setAnswers({ ...answers, [questionIndex]: answer });
//     };

//     if (!quiz) return (
//         <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="text-center p-6 text-2xl"
//         >
//             Loading...
//         </motion.div>
//     );

//     return (
//         <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="max-w-4xl mx-auto p-6"
//         >
//             <div className="glass p-8">
//                 <div className="flex justify-between items-center mb-6">
//                     <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">{quiz.title}</h1>
//                     <div className="text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
//                         Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
//                     </div>
//                 </div>
//                 <div className="mb-6">
//                     <div className="w-full bg-white bg-opacity-20 rounded-full h-2.5">
//                         <motion.div
//                             className="bg-gradient-to-r from-teal-400 to-blue-400 h-2.5 rounded-full"
//                             initial={{ width: 0 }}
//                             animate={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
//                             transition={{ duration: 0.3 }}
//                         />
//                     </div>
//                 </div>
//                 <motion.div
//                     key={currentQuestion}
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ duration: 0.3 }}
//                     className="p-6"
//                 >
//                     <h2 className="text-2xl font-semibold mb-6">{quiz.questions[currentQuestion].text}</h2>
//                     {quiz.questions[currentQuestion].type === 'multiple' && quiz.questions[currentQuestion].options.map((option, index) => (
//                         <motion.label
//                             key={index}
//                             whileHover={{ scale: 1.02 }}
//                             className="flex items-center mb-4 cursor-pointer"
//                         >
//                             <input
//                                 type="radio"
//                                 name={`question-${currentQuestion}`}
//                                 value={index}
//                                 checked={answers[currentQuestion] === index}
//                                 onChange={() => handleAnswer(currentQuestion, index)}
//                                 className="form-radio text-teal-400 mr-3"
//                             />
//                             <span className="text-gray-100">{option}</span>
//                         </motion.label>
//                     ))}
//                     {quiz.questions[currentQuestion].type === 'true_false' && (
//                         <div className="space-y-4">
//                             {['true', 'false'].map((value) => (
//                                 <motion.label
//                                     key={value}
//                                     whileHover={{ scale: 1.02 }}
//                                     className="flex items-center cursor-pointer"
//                                 >
//                                     <input
//                                         type="radio"
//                                         name={`question-${currentQuestion}`}
//                                         value={value}
//                                         checked={answers[currentQuestion] === value}
//                                         onChange={() => handleAnswer(currentQuestion, value)}
//                                         className="form-radio text-teal-400 mr-3"
//                                     />
//                                     <span className="text-gray-100">{value.charAt(0).toUpperCase() + value.slice(1)}</span>
//                                 </motion.label>
//                             ))}
//                         </div>
//                     )}
//                     {quiz.questions[currentQuestion].type === 'text' && (
//                         <textarea
//                             value={answers[currentQuestion] || ''}
//                             onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
//                             className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
//                             placeholder="Enter your answer"
//                         />
//                     )}
//                     <div className="flex justify-between mt-8">
//                         <motion.button
//                             whileHover={{ scale: 1.05 }}
//                             onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
//                             className="gradient-button bg-gradient-to-r from-gray-500 to-gray-600 disabled:opacity-50"
//                             disabled={currentQuestion === 0}
//                         >
//                             Previous
//                         </motion.button>
//                         <motion.button
//                             whileHover={{ scale: 1.05 }}
//                             onClick={() => currentQuestion < quiz.questions.length - 1 ? setCurrentQuestion(currentQuestion + 1) : submitQuiz()}
//                             className="gradient-button"
//                         >
//                             {currentQuestion < quiz.questions.length - 1 ? 'Next' : 'Submit'}
//                         </motion.button>
//                     </div>
//                 </motion.div>
//             </div>
//         </motion.div>
//     );
// }

// export default QuizTaker;



import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from './App';

function QuizTaker({ onComplete }) {
    const { id } = useParams(); // Get the quiz ID from URL params
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [sessionId, setSessionId] = useState(null);
    const [userName, setUserName] = useState('');
    const [showStart, setShowStart] = useState(true);
    const [randomize, setRandomize] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Start quiz with user options
    const startQuiz = async () => {
        if (!id) {
            setError('Quiz ID is missing');
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            console.log(`Starting quiz with ID: ${id}`);
            
            
            const response = await fetch(`${API_BASE_URL}/quizzes/${id}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: userName || 'Anonymous',
                    randomize: randomize
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to start quiz: ${response.status} ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Quiz started successfully:', data);
            setQuiz(data.quiz);
            setSessionId(data.session_id);
            setTimeLeft(data.quiz.time_limit * 60);
            setShowStart(false);
        } catch (error) {
            console.error('Error starting quiz:', error);
            setError(error.message);
            alert(`Failed to start quiz: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Anti-cheating measures
    useEffect(() => {
        if (showStart) return; // Don't apply during the start screen
        
        // Prevent back button
        const handleBackButton = (e) => {
            e.preventDefault();
            alert('The back button is disabled during the quiz.');
            window.history.forward();
        };
        
        // Prevent tab switching
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                alert('Warning: Leaving the quiz page may result in automatic submission!');
                // Optionally implement auto-submission here
            }
        };
        
        // Prevent refreshing
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Are you sure you want to leave? Your quiz progress will be lost.';
            return e.returnValue;
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('popstate', handleBackButton);
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        // Push a dummy state to prevent going back
        window.history.pushState(null, null, window.location.href);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('popstate', handleBackButton);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [showStart]);

    // Timer for quiz
    useEffect(() => {
        if (timeLeft > 0 && !showStart) {
            const timer = setInterval(() => setTimeLeft(time => time - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && quiz && !showStart) {
            submitQuiz();
        }
    }, [timeLeft, quiz, showStart]);

    const submitQuiz = async () => {
        if (!id) {
            setError('Quiz ID is missing');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/quizzes/${id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, answers })
            });
            
            if (!response.ok) throw new Error('Failed to submit quiz');
            const result = await response.json();
            
            if (onComplete) {
                // Pass quiz_id to match the expected structure
                onComplete({
                    ...result,
                    quiz_id: id
                });
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            setError(error.message);
            alert('Failed to submit quiz. Please try again.');
        }
    };

    const handleAnswer = (questionIndex, answer) => {
        setAnswers({ ...answers, [questionIndex]: answer });
    };

    // Error state
    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto p-6"
            >
                <div className="glass p-8 text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-500">Error</h1>
                    <p className="mb-6">{error}</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => window.location.href = '/'}
                        className="gradient-button"
                    >
                        Go Back to Quiz List
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    // Show the start screen
    if (showStart) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto p-6"
            >
                <div className="glass p-8">
                    <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Start Quiz</h1>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Your Name</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-teal-400"
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={randomize}
                                onChange={(e) => setRandomize(e.target.checked)}
                                className="form-checkbox text-teal-400"
                            />
                            <span>Randomize question order</span>
                        </label>
                    </div>
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={startQuiz}
                        disabled={isLoading}
                        className="gradient-button w-full"
                    >
                        {isLoading ? 'Starting...' : 'Start Quiz'}
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    // Loading state
    if (!quiz) return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 text-2xl"
        >
            Loading...
        </motion.div>
    );

    // Main quiz view
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