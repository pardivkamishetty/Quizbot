import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function QuestionBank({ onAddToQuiz }) {
    const [questions, setQuestions] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        difficulty: '',
        tags: '',
        search: ''
    });
    const [newQuestion, setNewQuestion] = useState({
        text: '',
        type: 'multiple',
        options: ['', '', '', ''],
        correct_answer: 0,
        points: 10,
        category: '',
        difficulty: 'medium',
        tags: []
    });
    const [isAdding, setIsAdding] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchQuestions();
        fetchCategories();
    }, [filters]);

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            let url = 'http://localhost:5000/api/question-bank';
            const params = new URLSearchParams();
            
            if (filters.category) params.append('category', filters.category);
            if (filters.difficulty) params.append('difficulty', filters.difficulty);
            if (filters.tags) params.append('tags', filters.tags);
            if (filters.search) params.append('search', filters.search);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch questions');
            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/quiz-categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/question-bank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newQuestion, created_by: 'user' })
            });
            
            if (!response.ok) throw new Error('Failed to add question');
            
            // Reset form and refresh questions
            setNewQuestion({
                text: '',
                type: 'multiple',
                options: ['', '', '', ''],
                correct_answer: 0,
                points: 10,
                category: '',
                difficulty: 'medium',
                tags: []
            });
            setIsAdding(false);
            fetchQuestions();
        } catch (error) {
            console.error('Error adding question:', error);
            alert('Failed to add question. Please try again.');
        }
    };

    const updateOption = (index, value) => {
        const newOptions = [...newQuestion.options];
        newOptions[index] = value;
        setNewQuestion({ ...newQuestion, options: newOptions });
    };

    const handleAddTag = () => {
        if (newTag && !newQuestion.tags.includes(newTag)) {
            setNewQuestion({
                ...newQuestion,
                tags: [...newQuestion.tags, newTag]
            });
            setNewTag('');
        }
    };
    
    const handleRemoveTag = (tagToRemove) => {
        setNewQuestion({
            ...newQuestion,
            tags: newQuestion.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleFilterChange = (field, value) => {
        setFilters({ ...filters, [field]: value });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        
        try {
            const response = await fetch(`http://localhost:5000/api/question-bank/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ created_by: 'user' })
            });
            
            if (!response.ok) throw new Error('Failed to delete question');
            fetchQuestions();
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Failed to delete question.');
        }
    };

    const handleAddToQuiz = (question) => {
        if (onAddToQuiz) {
            onAddToQuiz(question);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto p-6"
        >
            <div className="glass p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Question Bank</h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setIsAdding(!isAdding)}
                        className="gradient-button"
                    >
                        {isAdding ? 'Cancel' : 'Add New Question'}
                    </motion.button>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 bg-white bg-opacity-10 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold mb-3">Search & Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Search</label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Search questions..."
                                className="w-full p-2 rounded-md bg-white bg-opacity-20 border border-white border-opacity-20"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm mb-1">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full p-2 rounded-md bg-white bg-opacity-20 border border-white border-opacity-20"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm mb-1">Difficulty</label>
                            <select
                                value={filters.difficulty}
                                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                                className="w-full p-2 rounded-md bg-white bg-opacity-20 border border-white border-opacity-20"
                            >
                                <option value="">All Difficulties</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm mb-1">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={filters.tags}
                                onChange={(e) => handleFilterChange('tags', e.target.value)}
                                placeholder="tag1,tag2,..."
                                className="w-full p-2 rounded-md bg-white bg-opacity-20 border border-white border-opacity-20"
                            />
                        </div>
                    </div>
                </div>

                {/* Add Question Form */}
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8"
                    >
                        <form onSubmit={handleSubmit} className="glass p-6">
                            <h2 className="text-xl font-semibold mb-4">Add New Question</h2>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Question Text</label>
                                <input
                                    type="text"
                                    value={newQuestion.text}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Question Type</label>
                                <select
                                    value={newQuestion.type}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black focus:ring-2 focus:ring-teal-400"
                                >
                                    <option value="multiple">Multiple Choice</option>
                                    <option value="true_false">True/False</option>
                                    <option value="text">Text</option>
                                </select>
                            </div>
                            
                            {newQuestion.type === 'multiple' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Options</label>
                                    {newQuestion.options.map((option, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            value={option}
                                            onChange={(e) => updateOption(index, e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                            className="w-full p-3 mb-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
                                            required
                                        />
                                    ))}
                                </div>
                            )}
                            
                            {newQuestion.type === 'multiple' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Correct Answer</label>
                                    <select
                                        value={newQuestion.correct_answer}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: parseInt(e.target.value) })}
                                        className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black focus:ring-2 focus:ring-teal-400"
                                    >
                                        {newQuestion.options.map((_, index) => (
                                            <option key={index} value={index}>Option {index + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            {newQuestion.type === 'true_false' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Correct Answer</label>
                                    <select
                                        value={newQuestion.correct_answer}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                                        className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black focus:ring-2 focus:ring-teal-400"
                                    >
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                    </select>
                                </div>
                            )}
                            
                            {newQuestion.type === 'text' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Correct Answer</label>
                                    <input
                                        type="text"
                                        value={newQuestion.correct_answer || ''}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                                        className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
                                        required
                                    />
                                </div>
                            )}
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Points</label>
                                <input
                                    type="number"
                                    value={newQuestion.points}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
                                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <div className="flex space-x-2">
                                    <select
                                        value={newQuestion.category}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                                        className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black focus:ring-2 focus:ring-teal-400"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Or create new"
                                        onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                                        className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Difficulty</label>
                                <select
                                    value={newQuestion.difficulty}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black focus:ring-2 focus:ring-teal-400"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Tags</label>
                                <div className="flex mb-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Add a tag"
                                        className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-l-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-teal-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="px-4 bg-blue-500 text-white rounded-r-lg"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {newQuestion.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-blue-500 text-white rounded-full flex items-center">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-2 text-xs bg-red-500 rounded-full w-4 h-4 flex items-center justify-center"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                type="submit"
                                className="gradient-button mt-4"
                            >
                                Add Question
                            </motion.button>
                        </form>
                    </motion.div>
                )}

                {/* Questions List */}
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Questions ({questions.length})</h2>
                    
                    {isLoading ? (
                        <div className="text-center py-8">Loading questions...</div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-8">No questions found matching your criteria</div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map(question => (
                                <motion.div
                                    key={question.id}
                                    className="glass p-4 hover:bg-white hover:bg-opacity-20 transition-colors"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <div className="flex justify-between">
                                        <h3 className="text-lg font-semibold">{question.text}</h3>
                                        <div className="flex space-x-2">
                                            {onAddToQuiz && (
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    onClick={() => handleAddToQuiz(question)}
                                                    className="px-3 py-1 bg-green-500 text-white text-sm rounded"
                                                >
                                                    Use in Quiz
                                                </motion.button>
                                            )}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                onClick={() => handleDelete(question.id)}
                                                className="px-3 py-1 bg-red-500 text-white text-sm rounded"
                                            >
                                                Delete
                                            </motion.button>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-2 text-sm">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-purple-500 bg-opacity-70 rounded">
                                                {question.type === 'multiple' ? 'Multiple Choice' : 
                                                 question.type === 'true_false' ? 'True/False' : 'Text'}
                                            </span>
                                            <span className="px-2 py-0.5 bg-yellow-500 bg-opacity-70 rounded">
                                                {question.points} points
                                            </span>
                                            <span className="px-2 py-0.5 bg-blue-500 bg-opacity-70 rounded">
                                                {question.difficulty}
                                            </span>
                                            {question.category && (
                                                <span className="px-2 py-0.5 bg-green-500 bg-opacity-70 rounded">
                                                    {question.category}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {question.tags && question.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {question.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 bg-gray-500 bg-opacity-50 rounded-full text-xs">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default QuestionBank;