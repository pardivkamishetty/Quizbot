// import React, { useState } from 'react';
// import { motion } from 'framer-motion';

// function QuizCreator({ onCreateQuiz }) {
//     const [quiz, setQuiz] = useState({
//         title: '',
//         description: '',
//         time_limit: 30,
//         is_public: true,
//         questions: []
//     });

//     const addQuestion = () => {
//         setQuiz({
//             ...quiz,
//             questions: [...quiz.questions, {
//                 id: Date.now().toString(),
//                 text: '',
//                 type: 'multiple',
//                 options: ['', '', '', ''],
//                 correct_answer: 0,
//                 points: 10
//             }]
//         });
//     };

//     const updateQuestion = (index, field, value) => {
//         const newQuestions = [...quiz.questions];
//         newQuestions[index] = { ...newQuestions[index], [field]: value };
//         setQuiz({ ...quiz, questions: newQuestions });
//     };

//     const updateOption = (qIndex, oIndex, value) => {
//         const newQuestions = [...quiz.questions];
//         const newOptions = [...newQuestions[qIndex].options];
//         newOptions[oIndex] = value;
//         newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
//         setQuiz({ ...quiz, questions: newQuestions });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await fetch('http://localhost:5000/api/quizzes', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ ...quiz, created_by: 'user' })
//             });
//             if (!response.ok) throw new Error('Failed to create quiz');
//             onCreateQuiz();
//             setQuiz({ title: '', description: '', time_limit: 30, is_public: true, questions: [] });
//         } catch (error) {
//             console.error('Error creating quiz:', error);
//             alert('Failed to create quiz. Please try again.');
//         }
//     };

//     return (
//         <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="max-w-3xl mx-auto p-6"
//         >
//             <div className="glass p-8">
//                 <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Create New Quiz</h1>
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div>
//                         <label className="block text-sm font-medium mb-1">Quiz Title</label>
//                         <input
//                             type="text"
//                             placeholder="Enter quiz title"
//                             value={quiz.title}
//                             onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
//                             className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
//                             required
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium mb-1">Description</label>
//                         <textarea
//                             placeholder="Enter description"
//                             value={quiz.description}
//                             onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
//                             className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
//                         <input
//                             type="number"
//                             placeholder="Time limit"
//                             value={quiz.time_limit}
//                             onChange={(e) => setQuiz({ ...quiz, time_limit: parseInt(e.target.value) })}
//                             className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
//                             required
//                         />
//                     </div>
//                     <label className="flex items-center space-x-2">
//                         <input
//                             type="checkbox"
//                             checked={quiz.is_public}
//                             onChange={(e) => setQuiz({ ...quiz, is_public: e.target.checked })}
//                             className="form-checkbox text-teal-400"
//                         />
//                         <span>Public Quiz</span>
//                     </label>
//                     <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         type="button"
//                         onClick={addQuestion}
//                         className="gradient-button"
//                     >
//                         Add Question
//                     </motion.button>
//                     {quiz.questions.map((question, index) => (
//                         <motion.div
//                             key={question.id}
//                             initial={{ opacity: 0, y: 10 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             className="glass p-6 mt-4"
//                         >
//                             <input
//                                 type="text"
//                                 placeholder="Question Text"
//                                 value={question.text}
//                                 onChange={(e) => updateQuestion(index, 'text', e.target.value)}
//                                 className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400 mb-4"
//                                 required
//                             />
//                             <select
//                                 value={question.type}
//                                 onChange={(e) => updateQuestion(index, 'type', e.target.value)}
//                                 className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black focus:ring-2 focus:ring-teal-400 mb-4"
//                             >
//                                 <option value="multiple">Multiple Choice</option>
//                                 <option value="true_false">True/False</option>
//                                 <option value="text">Text</option>
//                             </select>
//                             {question.type === 'multiple' && question.options.map((option, optIndex) => (
//                                 <input
//                                     key={optIndex}
//                                     type="text"
//                                     placeholder={`Option ${optIndex + 1}`}
//                                     value={option}
//                                     onChange={(e) => updateOption(index, optIndex, e.target.value)}
//                                     className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400 mb-2"
//                                     required
//                                 />
//                             ))}
//                             {question.type === 'multiple' && (
//                                 <select
//                                     value={question.correct_answer}
//                                     onChange={(e) => updateQuestion(index, 'correct_answer', parseInt(e.target.value))}
//                                     className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black focus:ring-2 focus:ring-teal-400 mb-4"
//                                 >
//                                     {question.options.map((_, i) => (
//                                         <option key={i} value={i}>Option {i + 1}</option>
//                                     ))}
//                                 </select>
//                             )}
//                             <input
//                                 type="number"
//                                 placeholder="Points"
//                                 value={question.points}
//                                 onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
//                                 className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400 mb-4"
//                                 required
//                             />
//                         </motion.div>
//                     ))}
//                     <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         type="submit"
//                         className="gradient-button"
//                     >
//                         Create Quiz
//                     </motion.button>
//                 </form>
//             </div>
//         </motion.div>
//     );
// }

// export default QuizCreator;



import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function QuizCreator({ onCreateQuiz }) {
    const [quiz, setQuiz] = useState({
        title: '',
        description: '',
        time_limit: 30,
        is_public: true,
        category: '',
        tags: [],
        questions: []
    });
    const [availableCategories, setAvailableCategories] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [questionBankItems, setQuestionBankItems] = useState([]);

    useEffect(() => {
        // Fetch available categories
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/quiz-categories');
                if (response.ok) {
                    const data = await response.json();
                    setAvailableCategories(data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        // Fetch question bank items
        const fetchQuestionBank = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/question-bank');
                if (response.ok) {
                    const data = await response.json();
                    setQuestionBankItems(data);
                }
            } catch (error) {
                console.error('Error fetching question bank:', error);
            }
        };

        fetchCategories();
        fetchQuestionBank();
    }, []);

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

    const addFromQuestionBank = (question) => {
        // Create a copy to ensure we don't modify the original
        const newQuestion = {
            ...question,
            id: Date.now().toString() // Generate a new ID to avoid conflicts
        };
        
        setQuiz({
            ...quiz,
            questions: [...quiz.questions, newQuestion]
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

    const handleAddTag = () => {
        if (newTag && !quiz.tags.includes(newTag)) {
            setQuiz({
                ...quiz,
                tags: [...quiz.tags, newTag]
            });
            setNewTag('');
        }
    };
    
    const handleRemoveTag = (tagToRemove) => {
        setQuiz({
            ...quiz,
            tags: quiz.tags.filter(tag => tag !== tagToRemove)
        });
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
            setQuiz({ 
                title: '', 
                description: '', 
                time_limit: 30, 
                is_public: true, 
                category: '',
                tags: [],
                questions: [] 
            });
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
                    
                    {/* Category field */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <div className="flex space-x-2">
                            <select 
                                value={quiz.category} 
                                onChange={(e) => setQuiz({ ...quiz, category: e.target.value })}
                                className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black focus:ring-2 focus:ring-teal-400"
                            >
                                <option value="">Select Category</option>
                                {availableCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <input 
                                type="text" 
                                placeholder="Or create new category" 
                                onChange={(e) => setQuiz({ ...quiz, category: e.target.value })}
                                className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                    </div>
                    
                    {/* Tags field */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Tags</label>
                        <div className="flex space-x-2">
                            <input 
                                type="text" 
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)} 
                                placeholder="Add a tag"
                                className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                type="button"
                                onClick={handleAddTag}
                                className="px-4 py-2 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-lg"
                            >
                                Add
                            </motion.button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {quiz.tags.map(tag => (
                                <span key={tag} className="bg-blue-500 bg-opacity-30 px-2 py-1 rounded-full flex items-center text-sm">
                                    {tag}
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveTag(tag)}
                                        className="ml-1 text-white hover:text-red-300"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
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
                    
                    <div className="flex space-x-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            type="button"
                            onClick={addQuestion}
                            className="gradient-button"
                        >
                            Add Question
                        </motion.button>
                        
                        {questionBankItems.length > 0 && (
                            <div className="relative inline-block">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    type="button"
                                    className="gradient-button bg-gradient-to-r from-purple-500 to-indigo-500"
                                    onClick={() => document.getElementById('question-bank-dropdown').classList.toggle('hidden')}
                                >
                                    Add from Question Bank
                                </motion.button>
                                <div id="question-bank-dropdown" className="hidden absolute z-10 mt-2 w-96 bg-gray-800 rounded-lg shadow-lg p-3 max-h-96 overflow-auto">
                                    {questionBankItems.map(item => (
                                        <div 
                                            key={item.id} 
                                            className="p-3 hover:bg-gray-700 cursor-pointer rounded-lg mb-2"
                                            onClick={() => {
                                                addFromQuestionBank(item);
                                                document.getElementById('question-bank-dropdown').classList.add('hidden');
                                            }}
                                        >
                                            <p className="font-medium">{item.text}</p>
                                            <p className="text-xs text-gray-400">Type: {item.type} • Points: {item.points}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
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
                            <button
                                type="button"
                                onClick={() => {
                                    const newQuestions = quiz.questions.filter((_, i) => i !== index);
                                    setQuiz({ ...quiz, questions: newQuestions });
                                }}
                                className="text-red-400 hover:text-red-500"
                            >
                                Remove Question
                            </button>
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