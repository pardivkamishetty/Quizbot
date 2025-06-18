// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import QuizList from './QuizList';
// import QuizCreator from './QuizCreator';
// import QuizTaker from './QuizTaker';
// import QuizResults from './QuizResults';

// function App() {
//     const [view, setView] = useState('list');
//     const [quizzes, setQuizzes] = useState([]);
//     const [selectedQuizId, setSelectedQuizId] = useState(null);
//     const [sessionId, setSessionId] = useState(null);

//     useEffect(() => {
//         fetchQuizzes();
//     }, []);

//     const fetchQuizzes = async () => {
//         try {
//             const response = await fetch('http://localhost:5000/api/quizzes');
//             if (!response.ok) throw new Error('Failed to fetch quizzes');
//             const data = await response.json();
//             setQuizzes(data);
//         } catch (error) {
//             console.error('Error fetching quizzes:', error);
//             alert('Failed to load quizzes. Please try again.');
//         }
//     };

//     const handleViewChange = (newView, quizId = null, session = null) => {
//         setView(newView);
//         if (quizId) setSelectedQuizId(quizId);
//         if (session) setSessionId(session);
//     };

//     return (
//         <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//             className="w-screen h-screen overflow-auto"
//         >
//             <nav className="glass sticky top-0 z-10 p-4">
//                 <div className="max-w-7xl mx-auto flex justify-between items-center">
//                     <motion.h1
//                         initial={{ x: -20 }}
//                         animate={{ x: 0 }}
//                         className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400"
//                     >
//                         QuizVerse
//                     </motion.h1>
//                     <div className="space-x-4">
//                         <motion.button
//                             whileHover={{ scale: 1.1 }}
//                             onClick={() => handleViewChange('list')}
//                             className="text-white hover:text-teal-300 transition"
//                         >
//                             Home
//                         </motion.button>
//                         <motion.button
//                             whileHover={{ scale: 1.1 }}
//                             onClick={() => handleViewChange('creator')}
//                             className="gradient-button"
//                         >
//                             Create Quiz
//                         </motion.button>
//                     </div>
//                 </div>
//             </nav>
//             <main className="p-6">
//                 {view === 'list' && <QuizList quizzes={quizzes} onSelectQuiz={(id) => handleViewChange('taker', id)} />}
//                 {view === 'creator' && <QuizCreator onCreateQuiz={() => { fetchQuizzes(); handleViewChange('list'); }} />}
//                 {view === 'taker' && <QuizTaker quizId={selectedQuizId} onComplete={(result) => handleViewChange('results', selectedQuizId, result.session_id)} />}
//                 {view === 'results' && <QuizResults quizId={selectedQuizId} sessionId={sessionId} />}
//             </main>
//         </motion.div>
//     );
// }

// export default App;



// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import QuizList from './QuizList';
// import QuizCreator from './QuizCreator';
// import QuizTaker from './QuizTaker';
// import QuizResults from './QuizResults';
// import QuestionBank from './QuestionBank';
// import SharedResultsView from './SharedResultsView';

// function App() {
//     const [view, setView] = useState('list');
//     const [quizzes, setQuizzes] = useState([]);
//     const [selectedQuizId, setSelectedQuizId] = useState(null);
//     const [sessionId, setSessionId] = useState(null);
//     const [filters, setFilters] = useState({
//         category: '',
//         tag: '',
//         search: ''
//     });

//     useEffect(() => {
//         fetchQuizzes();
//     }, [filters]);

//     const fetchQuizzes = async () => {
//         try {
//             let url = 'http://localhost:5000/api/quizzes';
//             const params = new URLSearchParams();
            
//             if (filters.category) params.append('category', filters.category);
//             if (filters.tag) params.append('tag', filters.tag);
//             if (filters.search) params.append('search', filters.search);
            
//             if (params.toString()) {
//                 url += `?${params.toString()}`;
//             }

//             const response = await fetch(url);
//             if (!response.ok) throw new Error('Failed to fetch quizzes');
//             const data = await response.json();
//             setQuizzes(data);
//         } catch (error) {
//             console.error('Error fetching quizzes:', error);
//             alert('Failed to load quizzes. Please try again.');
//         }
//     };

//     const handleViewChange = (newView, quizId = null, session = null) => {
//         setView(newView);
//         if (quizId) setSelectedQuizId(quizId);
//         if (session) setSessionId(session);
//     };

//     // Check for shared result view in URL
//     useEffect(() => {
//         const path = window.location.pathname;
//         if (path.startsWith('/shared-results/')) {
//             const parts = path.split('/');
//             if (parts.length === 4) {
//                 setSelectedQuizId(parts[2]);
//                 setSessionId(parts[3]);
//                 setView('shared');
//             }
//         }
//     }, []);

//     return (
//         <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//             className="w-screen h-screen overflow-auto"
//         >
//             <nav className="glass sticky top-0 z-10 p-4">
//                 <div className="max-w-7xl mx-auto flex justify-between items-center">
//                     <motion.h1
//                         initial={{ x: -20 }}
//                         animate={{ x: 0 }}
//                         className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400"
//                     >
//                         QuizVerse
//                     </motion.h1>
//                     <div className="space-x-4">
//                         <motion.button
//                             whileHover={{ scale: 1.1 }}
//                             onClick={() => handleViewChange('list')}
//                             className="text-white hover:text-teal-300 transition"
//                         >
//                             Home
//                         </motion.button>
//                         <motion.button
//                             whileHover={{ scale: 1.1 }}
//                             onClick={() => handleViewChange('creator')}
//                             className="gradient-button"
//                         >
//                             Create Quiz
//                         </motion.button>
//                         <motion.button
//                             whileHover={{ scale: 1.1 }}
//                             onClick={() => handleViewChange('questionbank')}
//                             className="gradient-button"
//                         >
//                             Question Bank
//                         </motion.button>
//                     </div>
//                 </div>
//             </nav>
//             <main className="p-6">
//                 {view === 'list' && (
//                     <QuizList 
//                         quizzes={quizzes} 
//                         onSelectQuiz={(id) => handleViewChange('taker', id)} 
//                         onFilterChange={setFilters}
//                         filters={filters}
//                     />
//                 )}
//                 {view === 'creator' && <QuizCreator onCreateQuiz={() => { fetchQuizzes(); handleViewChange('list'); }} />}
//                 {view === 'taker' && <QuizTaker quizId={selectedQuizId} onComplete={(result) => handleViewChange('results', selectedQuizId, result.session_id)} />}
//                 {view === 'results' && <QuizResults quizId={selectedQuizId} sessionId={sessionId} />}
//                 {view === 'questionbank' && <QuestionBank onAddToQuiz={() => handleViewChange('creator')} />}
//                 {view === 'shared' && <SharedResultsView quizId={selectedQuizId} sessionId={sessionId} />}
//             </main>
//         </motion.div>
//     );
// }

// export default App;



import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import QuizList from './QuizList';
import QuizCreator from './QuizCreator';
import QuizTaker from './QuizTaker';
import QuizResults from './QuizResults';
import QuestionBank from './QuestionBank';
import SharedResults from './SharedResults';

// Get API URL from environment variable or use default for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Wrapper component for navigation
function AppContent() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        tag: '',
        search: ''
    });

    useEffect(() => {
        fetchQuizzes();
    }, [filters]);

    const fetchQuizzes = async () => {
        try {
            let url = `${API_BASE_URL}/quizzes`;
            const params = new URLSearchParams();
            
            if (filters.category) params.append('category', filters.category);
            if (filters.tag) params.append('tag', filters.tag);
            if (filters.search) params.append('search', filters.search);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch quizzes');
            const data = await response.json();
            setQuizzes(data);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            alert('Failed to load quizzes. Please try again.');
        }
    };

    // Navigation handlers
    const handleCreateQuiz = () => {
        fetchQuizzes();
        navigate('/');
    };

    const handleQuizComplete = (quizId, sessionId) => {
        navigate(`/results/${quizId}/${sessionId}`);
    };

    return (
        <>
            <nav className="glass sticky top-0 z-10 p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <motion.h1
                        initial={{ x: -20 }}
                        animate={{ x: 0 }}
                        className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400"
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer' }}
                    >
                        QuizVerse
                    </motion.h1>
                    <div className="space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => navigate('/')}
                            className="text-white hover:text-teal-300 transition"
                        >
                            Home
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => navigate('/create')}
                            className="gradient-button"
                        >
                            Create Quiz
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => navigate('/question-bank')}
                            className="gradient-button"
                        >
                            Question Bank
                        </motion.button>
                    </div>
                </div>
            </nav>

            <main className="p-6">
                <Routes>
                    <Route path="/" element={
                        <QuizList 
                            quizzes={quizzes} 
                            onSelectQuiz={(id) => navigate(`/quiz/${id}`)} 
                            onFilterChange={setFilters}
                            filters={filters}
                        />
                    } />
                    <Route path="/create" element={
                        <QuizCreator onCreateQuiz={handleCreateQuiz} />
                    } />
                    <Route path="/quiz/:id" element={
                        <QuizTaker 
                            onComplete={(result) => handleQuizComplete(result.quiz_id, result.session_id)} 
                        />
                    } />
                    <Route path="/results/:quizId/:sessionId" element={
                        <QuizResults />
                    } />
                    <Route path="/question-bank" element={
                        <QuestionBank 
                            onAddToQuiz={(question) => {
                                // Store question in sessionStorage to be used in quiz creation
                                sessionStorage.setItem('addedQuestion', JSON.stringify(question));
                                navigate('/create');
                            }} 
                        />
                    } />
                    <Route path="/shared-results/:quizId/:sessionId" element={
                        <SharedResults />
                    } />
                </Routes>
            </main>
        </>
    );
}

// Main App component with Router
function App() {
    return (
        <Router>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-screen h-screen overflow-auto"
            >
                <AppContent />
            </motion.div>
        </Router>
    );
}

// Export the API_BASE_URL so other components can use it
export { API_BASE_URL };
export default App;