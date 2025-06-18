// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const { v4: uuidv4 } = require('uuid');

// const app = express();
// app.use(cors());
// app.use(express.json());
// require('dotenv').config();

// // MongoDB Atlas connection
// mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected to MongoDB Atlas')).catch(err => console.error('MongoDB connection error:', err));

// // MongoDB Schemas
// const quizSchema = new mongoose.Schema({
//     id: { type: String, default: uuidv4, unique: true },
//     title: String,
//     description: String,
//     time_limit: Number,
//     is_public: Boolean,
//     created_by: String,
//     questions: [{
//         id: { type: String, default: uuidv4 },
//         text: String,
//         type: { type: String, enum: ['multiple', 'true_false', 'text'] },
//         options: [String],
//         correct_answer: mongoose.Mixed,
//         points: Number
//     }]
// });

// const quizSessionSchema = new mongoose.Schema({
//     session_id: { type: String, default: uuidv4, unique: true },
//     quiz_id: String,
//     user_name: String,
//     started_at: Date,
//     completed_at: Date,
//     score: Number,
//     answers: [{
//         question_id: String,
//         user_answer: mongoose.Mixed,
//         correct: Boolean,
//         points: Number
//     }]
// });

// const Quiz = mongoose.model('Quiz', quizSchema);
// const QuizSession = mongoose.model('QuizSession', quizSessionSchema);

// // Quiz Management Routes
// app.post('/api/quizzes', async (req, res) => {
//     try {
//         const quiz = new Quiz(req.body);
//         await quiz.save();
//         res.status(201).json(quiz);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// app.get('/api/quizzes', async (req, res) => {
//     try {
//         const quizzes = await Quiz.find({ is_public: true }).select('-questions.correct_answer');
//         res.json(quizzes);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// app.get('/api/quizzes/:id', async (req, res) => {
//     try {
//         const quiz = await Quiz.findOne({ id: req.params.id }).select('-questions.correct_answer');
//         if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
//         res.json(quiz);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// app.put('/api/quizzes/:id', async (req, res) => {
//     try {
//         const quiz = await Quiz.findOneAndUpdate({ id: req.params.id, created_by: req.body.created_by }, req.body, { new: true });
//         if (!quiz) return res.status(404).json({ error: 'Quiz not found or unauthorized' });
//         res.json(quiz);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// app.delete('/api/quizzes/:id', async (req, res) => {
//     try {
//         const quiz = await Quiz.findOneAndDelete({ id: req.params.id, created_by: req.body.created_by });
//         if (!quiz) return res.status(404).json({ error: 'Quiz not found or unauthorized' });
//         res.status(204).send();
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Quiz Taking Routes
// app.post('/api/quizzes/:id/start', async (req, res) => {
//     try {
//         const quiz = await Quiz.findOne({ id: req.params.id });
//         if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        
//         const session = new QuizSession({
//             quiz_id: quiz.id,
//             user_name: 'anonymous',
//             started_at: new Date()
//         });
//         await session.save();

//         res.json({ quiz, session_id: session.session_id });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// app.post('/api/quizzes/:id/submit', async (req, res) => {
//     try {
//         const { session_id, answers } = req.body;
//         const session = await QuizSession.findOne({ session_id });
//         if (!session) return res.status(404).json({ error: 'Session not found' });

//         const quiz = await Quiz.findOne({ id: req.params.id });
//         if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

//         let score = 0;
//         const processedAnswers = Object.entries(answers).map(([questionIndex, userAnswer]) => {
//             const question = quiz.questions[parseInt(questionIndex)];
//             const correct = userAnswer == question.correct_answer; // Loose comparison for flexibility
//             const points = correct ? question.points : 0;
//             score += points;
//             return {
//                 question_id: question.id,
//                 user_answer: userAnswer,
//                 correct,
//                 points
//             };
//         });

//         session.answers = processedAnswers;
//         session.score = score;
//         session.completed_at = new Date();
//         await session.save();

//         res.json({ session_id, score, total_points: quiz.questions.reduce((sum, q) => sum + q.points, 0), quiz, answers: processedAnswers });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// app.get('/api/quizzes/:id/results/:session_id', async (req, res) => {
//     try {
//         const session = await QuizSession.findOne({ session_id: req.params.session_id });
//         if (!session) return res.status(404).json({ error: 'Session not found' });

//         const quiz = await Quiz.findOne({ id: req.params.id });
//         if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

//         res.json({
//             score: session.score,
//             total_points: quiz.questions.reduce((sum, q) => sum + q.points, 0),
//             quiz,
//             answers: session.answers
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// app.get('/api/quizzes/:id/analytics', async (req, res) => {
//     try {
//         const sessions = await QuizSession.find({ quiz_id: req.params.id });
//         const quiz = await Quiz.findOne({ id: req.params.id });
//         if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

//         const totalSessions = sessions.length;
//         const completedSessions = sessions.filter(s => s.completed_at).length;
//         const completedSessionsData = sessions.filter(s => s.completed_at && typeof s.score === 'number');

//         // Calculate average score as percentage
//         const avgScore = completedSessionsData.length > 0
//             ? (completedSessionsData.reduce((sum, s) => sum + (s.score / quiz.questions.reduce((sum, q) => sum + q.points, 0) * 100), 0) / completedSessionsData.length).toFixed(2)
//             : 0;

//         // Calculate question performance based on completed sessions only
//         const questionPerformance = quiz.questions.map((q, index) => {
//             const correctAnswers = completedSessionsData.reduce((count, s) => {
//                 const answer = s.answers.find(a => a.question_id === q.id);
//                 return count + (answer && answer.correct ? 1 : 0);
//             }, 0);
//             return {
//                 question_id: q.id,
//                 correct_percentage: completedSessionsData.length > 0 ? (correctAnswers / completedSessionsData.length * 100).toFixed(2) : 0
//             };
//         });

//         res.json({
//             avg_score: parseFloat(avgScore),
//             completion_rate: totalSessions > 0 ? completedSessions / totalSessions : 0,
//             question_performance: questionPerformance
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const { v4: uuidv4 } = require('uuid');
// const { Redis } = require('@upstash/redis');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Upstash Redis client setup
// const redisClient = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN,
// });

// console.log('Upstash Redis client initialized');

// const DEFAULT_EXPIRATION = parseInt(process.env.REDIS_TTL || '3600'); // Default TTL in seconds (1 hour)

// // MongoDB Atlas connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('Connected to MongoDB Atlas'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // MongoDB Schemas
// // ...existing schema code...

// // Cache middleware for quizzes
// async function cacheQuiz(req, res, next) {
//   const { id } = req.params;
  
//   try {
//     const cachedQuiz = await redisClient.get(`quiz:${id}`);
//     if (cachedQuiz) {
//       console.log('Cache hit for quiz', id);
//       return res.json(cachedQuiz);
//     }
//     next();
//   } catch (error) {
//     console.error('Redis error:', error);
//     next();
//   }
// }

// // Cache middleware for public quizzes list
// async function cachePublicQuizzes(req, res, next) {
//   try {
//     const cachedQuizzes = await redisClient.get('public_quizzes');
//     if (cachedQuizzes) {
//       console.log('Cache hit for public quizzes');
//       return res.json(cachedQuizzes);
//     }
//     next();
//   } catch (error) {
//     console.error('Redis error:', error);
//     next();
//   }
// }

// // Quiz Management Routes
// app.post('/api/quizzes', async (req, res) => {
//   try {
//     const quiz = new Quiz(req.body);
//     await quiz.save();
    
//     // Invalidate public quizzes cache if new quiz is public
//     if (quiz.is_public) {
//       try {
//         await redisClient.del('public_quizzes');
//       } catch (redisErr) {
//         console.error('Redis error during cache invalidation:', redisErr);
//       }
//     }
    
//     res.status(201).json(quiz);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// app.get('/api/quizzes', cachePublicQuizzes, async (req, res) => {
//   try {
//     const quizzes = await Quiz.find({ is_public: true }).select('-questions.correct_answer');
    
//     // Cache the result
//     try {
//       await redisClient.set('public_quizzes', quizzes, { ex: DEFAULT_EXPIRATION });
//     } catch (redisErr) {
//       console.error('Redis caching error:', redisErr);
//     }
    
//     res.json(quizzes);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.get('/api/quizzes/:id', cacheQuiz, async (req, res) => {
//   try {
//     const quiz = await Quiz.findOne({ id: req.params.id }).select('-questions.correct_answer');
//     if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    
//     // Cache the result
//     try {
//       await redisClient.set(`quiz:${req.params.id}`, quiz, { ex: DEFAULT_EXPIRATION });
//     } catch (redisErr) {
//       console.error('Redis caching error:', redisErr);
//     }
    
//     res.json(quiz);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.put('/api/quizzes/:id', async (req, res) => {
//   try {
//     const quiz = await Quiz.findOneAndUpdate({ id: req.params.id, created_by: req.body.created_by }, req.body, { new: true });
//     if (!quiz) return res.status(404).json({ error: 'Quiz not found or unauthorized' });
    
//     // Invalidate caches
//     try {
//       await redisClient.del(`quiz:${req.params.id}`);
//       await redisClient.del('public_quizzes');
//     } catch (redisErr) {
//       console.error('Redis error during cache invalidation:', redisErr);
//     }
    
//     res.json(quiz);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// app.delete('/api/quizzes/:id', async (req, res) => {
//   try {
//     const quiz = await Quiz.findOneAndDelete({ id: req.params.id, created_by: req.body.created_by });
//     if (!quiz) return res.status(404).json({ error: 'Quiz not found or unauthorized' });
    
//     // Invalidate caches
//     try {
//       await redisClient.del(`quiz:${req.params.id}`);
//       await redisClient.del('public_quizzes');
//     } catch (redisErr) {
//       console.error('Redis error during cache invalidation:', redisErr);
//     }
    
//     res.status(204).send();
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Cache analytics results
// async function cacheAnalytics(req, res, next) {
//   const { id } = req.params;
  
//   try {
//     const cachedAnalytics = await redisClient.get(`analytics:${id}`);
//     if (cachedAnalytics) {
//       console.log('Cache hit for analytics', id);
//       return res.json(cachedAnalytics);
//     }
//     next();
//   } catch (error) {
//     console.error('Redis error:', error);
//     next();
//   }
// }

// // Add analytics caching
// app.get('/api/quizzes/:id/analytics', cacheAnalytics, async (req, res) => {
//   try {
//     const sessions = await QuizSession.find({ quiz_id: req.params.id });
//     const quiz = await Quiz.findOne({ id: req.params.id });
//     if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

//     // ... existing analytics calculation code ...

//     const analyticsData = {
//       avg_score: parseFloat(avgScore),
//       completion_rate: totalSessions > 0 ? completedSessions / totalSessions : 0,
//       question_performance: questionPerformance
//     };
    
//     // Cache the analytics data
//     try {
//       await redisClient.set(`analytics:${req.params.id}`, analyticsData, { ex: DEFAULT_EXPIRATION });
//     } catch (redisErr) {
//       console.error('Redis caching error:', redisErr);
//     }

//     res.json(analyticsData);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Add session caching for faster results retrieval
// app.get('/api/quizzes/:id/results/:session_id', async (req, res) => {
//   try {
//     const cacheKey = `result:${req.params.session_id}`;
    
//     // Try to get from cache first
//     try {
//       const cachedResult = await redisClient.get(cacheKey);
//       if (cachedResult) {
//         console.log('Cache hit for session results', req.params.session_id);
//         return res.json(cachedResult);
//       }
//     } catch (redisErr) {
//       console.error('Redis error:', redisErr);
//     }
    
//     const session = await QuizSession.findOne({ session_id: req.params.session_id });
//     if (!session) return res.status(404).json({ error: 'Session not found' });

//     const quiz = await Quiz.findOne({ id: req.params.id });
//     if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

//     const resultData = {
//       score: session.score,
//       total_points: quiz.questions.reduce((sum, q) => sum + q.points, 0),
//       quiz,
//       answers: session.answers
//     };
    
//     // Cache the result
//     try {
//       await redisClient.set(cacheKey, resultData, { ex: DEFAULT_EXPIRATION });
//     } catch (redisErr) {
//       console.error('Redis caching error:', redisErr);
//     }

//     res.json(resultData);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Other existing routes remain the same
// // ...

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const json2csv = require('json2csv').parse;
require('dotenv').config();

const app = express();

// Enhanced CORS configuration for deployment
const allowedOrigins = [
  'https://quizbot-frontend.vercel.app', // Add your frontend URL when deployed
  'https://quizbot-frontend.onrender.com', // Add alternative frontend URL
  'http://localhost:3000',
  'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check route for Render
app.get('/', (req, res) => {
  res.json({ status: 'QuizBot API is running' });
});

// MongoDB Atlas connection with improved error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  bufferCommands: false
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if we can't connect to the database
});

// Redis configuration - make it optional for environments without Redis
let redisClient = null;
const DEFAULT_EXPIRATION = parseInt(process.env.REDIS_TTL || '3600'); // Default TTL in seconds (1 hour)

// Only initialize Redis if credentials are available
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const { Redis } = require('@upstash/redis');
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log('Upstash Redis client initialized');
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    console.log('Continuing without Redis caching');
  }
}

// MongoDB Schemas
const quizSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  title: String,
  description: String,
  time_limit: Number,
  is_public: Boolean,
  created_by: String,
  category: String,
  tags: [String],
  questions: [{
    id: { type: String, default: uuidv4 },
    text: String,
    type: { type: String, enum: ['multiple', 'true_false', 'text'] },
    options: [String],
    correct_answer: mongoose.Mixed,
    points: Number
  }]
});

const quizSessionSchema = new mongoose.Schema({
  session_id: { type: String, default: uuidv4, unique: true },
  quiz_id: String,
  user_name: String,
  started_at: Date,
  completed_at: Date,
  score: Number,
  answers: [{
    question_id: String,
    user_answer: mongoose.Mixed,
    correct: Boolean,
    points: Number
  }],
  metadata: { type: mongoose.Schema.Types.Mixed }
});

const questionBankSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  text: String,
  type: { type: String, enum: ['multiple', 'true_false', 'text'] },
  options: [String],
  correct_answer: mongoose.Mixed,
  points: Number,
  category: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  tags: [String],
  created_by: String
});

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizSession = mongoose.model('QuizSession', quizSessionSchema);
const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);

// Custom async handler to reduce try-catch boilerplate
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Cache middleware helper function
function getCacheMiddleware(keyFn) {
  return async (req, res, next) => {
    if (!redisClient) return next();
    
    const cacheKey = keyFn(req);
    
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json(cachedData);
      }
    } catch (error) {
      console.error('Redis error:', error);
    }
    
    next();
  };
}

// Cache middleware functions
const cacheQuiz = getCacheMiddleware(req => `quiz:${req.params.id}`);
const cachePublicQuizzes = getCacheMiddleware(() => 'public_quizzes');
const cacheAnalytics = getCacheMiddleware(req => `analytics:${req.params.id}`);

// Question Bank routes
app.post('/api/question-bank', asyncHandler(async (req, res) => {
  const question = new QuestionBank(req.body);
  await question.save();
  res.status(201).json(question);
}));

app.get('/api/question-bank', asyncHandler(async (req, res) => {
  const { category, difficulty, tags, search } = req.query;
  let query = {};
  
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (tags) query.tags = { $in: tags.split(',') };
  if (search) query.text = { $regex: search, $options: 'i' };
  
  const questions = await QuestionBank.find(query);
  res.json(questions);
}));

app.get('/api/question-bank/:id', asyncHandler(async (req, res) => {
  const question = await QuestionBank.findOne({ id: req.params.id });
  if (!question) return res.status(404).json({ error: 'Question not found' });
  res.json(question);
}));

app.put('/api/question-bank/:id', asyncHandler(async (req, res) => {
  const question = await QuestionBank.findOneAndUpdate(
    { id: req.params.id, created_by: req.body.created_by }, 
    req.body, 
    { new: true }
  );
  if (!question) return res.status(404).json({ error: 'Question not found or unauthorized' });
  res.json(question);
}));

app.delete('/api/question-bank/:id', asyncHandler(async (req, res) => {
  const question = await QuestionBank.findOneAndDelete({ 
    id: req.params.id, 
    created_by: req.body.created_by 
  });
  if (!question) return res.status(404).json({ error: 'Question not found or unauthorized' });
  res.status(204).send();
}));

// Category and tag routes
app.get('/api/quiz-categories', asyncHandler(async (req, res) => {
  const categories = await Quiz.distinct('category');
  res.json(categories.filter(Boolean)); // Remove null/undefined values
}));

app.get('/api/quiz-tags', asyncHandler(async (req, res) => {
  const tags = await Quiz.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: null, allTags: { $addToSet: '$tags' } } },
  ]);
  res.json(tags.length > 0 ? tags[0].allTags : []);
}));

// Quiz Management Routes
app.post('/api/quizzes', asyncHandler(async (req, res) => {
  const quiz = new Quiz(req.body);
  await quiz.save();
  
  // Invalidate public quizzes cache if new quiz is public and Redis is available
  if (quiz.is_public && redisClient) {
    try {
      await redisClient.del('public_quizzes');
    } catch (redisErr) {
      console.error('Redis error during cache invalidation:', redisErr);
    }
  }
  
  res.status(201).json(quiz);
}));

app.get('/api/quizzes', cachePublicQuizzes, asyncHandler(async (req, res) => {
  const { category, tag, search } = req.query;
  let query = { is_public: true };
  
  if (category) query.category = category;
  if (tag) query.tags = tag;
  if (search) query.title = { $regex: search, $options: 'i' };
  
  const quizzes = await Quiz.find(query).select('-questions.correct_answer');
  
  // Only cache if no filters are applied and Redis is available
  if (!category && !tag && !search && redisClient) {
    try {
      await redisClient.set('public_quizzes', quizzes, { ex: DEFAULT_EXPIRATION });
    } catch (redisErr) {
      console.error('Redis caching error:', redisErr);
    }
  }
  
  res.json(quizzes);
}));

app.get('/api/quizzes/:id', cacheQuiz, asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ id: req.params.id }).select('-questions.correct_answer');
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  
  // Cache the result if Redis is available
  if (redisClient) {
    try {
      await redisClient.set(`quiz:${req.params.id}`, quiz, { ex: DEFAULT_EXPIRATION });
    } catch (redisErr) {
      console.error('Redis caching error:', redisErr);
    }
  }
  
  res.json(quiz);
}));

app.put('/api/quizzes/:id', asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOneAndUpdate(
    { id: req.params.id, created_by: req.body.created_by }, 
    req.body, 
    { new: true }
  );
  
  if (!quiz) return res.status(404).json({ error: 'Quiz not found or unauthorized' });
  
  // Invalidate caches if Redis is available
  if (redisClient) {
    try {
      await redisClient.del(`quiz:${req.params.id}`);
      await redisClient.del('public_quizzes');
    } catch (redisErr) {
      console.error('Redis error during cache invalidation:', redisErr);
    }
  }
  
  res.json(quiz);
}));

app.delete('/api/quizzes/:id', asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOneAndDelete({ 
    id: req.params.id, 
    created_by: req.body.created_by 
  });
  
  if (!quiz) return res.status(404).json({ error: 'Quiz not found or unauthorized' });
  
  // Invalidate caches if Redis is available
  if (redisClient) {
    try {
      await redisClient.del(`quiz:${req.params.id}`);
      await redisClient.del('public_quizzes');
    } catch (redisErr) {
      console.error('Redis error during cache invalidation:', redisErr);
    }
  }
  
  res.status(204).send();
}));

// Quiz Taking Routes with randomization support
app.post('/api/quizzes/:id/start', asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ id: req.params.id });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  
  // Create a copy of the quiz with randomized questions if requested
  const shouldRandomize = req.body.randomize || false;
  let quizToSend = { ...quiz.toObject() };
  
  if (shouldRandomize) {
    // Shuffle questions using Fisher-Yates algorithm
    const shuffledQuestions = [...quizToSend.questions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }
    quizToSend.questions = shuffledQuestions;
    
    // Store original question order in session for later scoring
    const questionOrder = shuffledQuestions.map(q => q.id);
    
    const session = new QuizSession({
      quiz_id: quiz.id,
      user_name: req.body.user_name || 'anonymous',
      started_at: new Date(),
      metadata: { questionOrder }
    });
    await session.save();

    // Remove correct answers before sending
    quizToSend.questions = quizToSend.questions.map(q => ({
      ...q,
      correct_answer: undefined
    }));

    return res.json({ quiz: quizToSend, session_id: session.session_id });
  }
  
  // Otherwise proceed with normal non-randomized quiz
  const session = new QuizSession({
    quiz_id: quiz.id,
    user_name: req.body.user_name || 'anonymous',
    started_at: new Date()
  });
  await session.save();

  // Remove correct answers before sending
  quizToSend.questions = quizToSend.questions.map(q => ({
    ...q,
    correct_answer: undefined
  }));

  res.json({ quiz: quizToSend, session_id: session.session_id });
}));

app.post('/api/quizzes/:id/submit', asyncHandler(async (req, res) => {
  const { session_id, answers } = req.body;
  const session = await QuizSession.findOne({ session_id });
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const quiz = await Quiz.findOne({ id: req.params.id });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  let score = 0;
  let processedAnswers = [];
  
  // Check if questions were randomized
  if (session.metadata && session.metadata.questionOrder) {
    // Map answers back to original question order
    processedAnswers = session.metadata.questionOrder.map((questionId, index) => {
      const originalQuestionIndex = quiz.questions.findIndex(q => q.id === questionId);
      const question = quiz.questions[originalQuestionIndex];
      const userAnswer = answers[index];
      
      const correct = userAnswer == question.correct_answer; // Loose comparison for flexibility
      const points = correct ? question.points : 0;
      score += points;
      
      return {
        question_id: questionId,
        user_answer: userAnswer,
        correct,
        points
      };
    });
  } else {
    // Regular processing for non-randomized questions
    processedAnswers = Object.entries(answers).map(([questionIndex, userAnswer]) => {
      const question = quiz.questions[parseInt(questionIndex)];
      const correct = userAnswer == question.correct_answer;
      const points = correct ? question.points : 0;
      score += points;
      
      return {
        question_id: question.id,
        user_answer: userAnswer,
        correct,
        points
      };
    });
  }

  session.answers = processedAnswers;
  session.score = score;
  session.completed_at = new Date();
  await session.save();

  // Clear session cache if exists and Redis is available
  if (redisClient) {
    try {
      await redisClient.del(`result:${session_id}`);
      // Also invalidate analytics cache since new results may change averages
      await redisClient.del(`analytics:${req.params.id}`);
    } catch (redisErr) {
      console.error('Redis error during cache invalidation:', redisErr);
    }
  }

  res.json({
    session_id,
    score,
    total_points: quiz.questions.reduce((sum, q) => sum + q.points, 0),
    quiz,
    answers: processedAnswers
  });
}));

app.get('/api/quizzes/:id/results/:session_id', asyncHandler(async (req, res) => {
  const cacheKey = `result:${req.params.session_id}`;
  
  // Try to get from cache first if Redis is available
  if (redisClient) {
    try {
      const cachedResult = await redisClient.get(cacheKey);
      if (cachedResult) {
        console.log('Cache hit for session results', req.params.session_id);
        return res.json(cachedResult);
      }
    } catch (redisErr) {
      console.error('Redis error:', redisErr);
    }
  }
  
  const session = await QuizSession.findOne({ session_id: req.params.session_id });
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const quiz = await Quiz.findOne({ id: req.params.id });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const resultData = {
    score: session.score,
    total_points: quiz.questions.reduce((sum, q) => sum + q.points, 0),
    quiz,
    answers: session.answers
  };
  
  // Cache the result if Redis is available
  if (redisClient) {
    try {
      await redisClient.set(cacheKey, resultData, { ex: DEFAULT_EXPIRATION });
    } catch (redisErr) {
      console.error('Redis caching error:', redisErr);
    }
  }

  res.json(resultData);
}));

// Export routes for CSV and PDF
app.get('/api/quizzes/:id/results/:session_id/export/csv', asyncHandler(async (req, res) => {
  const session = await QuizSession.findOne({ session_id: req.params.session_id });
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const quiz = await Quiz.findOne({ id: req.params.id });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  
  // Prepare data for CSV
  const fields = ['question', 'your_answer', 'correct_answer', 'points', 'correct'];
  const data = session.answers.map((answer) => {
    const question = quiz.questions.find(q => q.id === answer.question_id) || {};
    return {
      question: question.text || 'Unknown question',
      your_answer: answer.user_answer,
      correct_answer: question.correct_answer,
      points: answer.points,
      correct: answer.correct ? 'Yes' : 'No'
    };
  });
  
  const csv = json2csv(data, { fields });
  
  res.header('Content-Type', 'text/csv');
  res.attachment(`quiz-results-${req.params.session_id}.csv`);
  return res.send(csv);
}));

app.get('/api/quizzes/:id/results/:session_id/export/pdf', asyncHandler(async (req, res) => {
  const session = await QuizSession.findOne({ session_id: req.params.session_id });
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const quiz = await Quiz.findOne({ id: req.params.id });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  
  // Create PDF document
  const doc = new PDFDocument();
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  
  // Add content
  doc.fontSize(20).text(`Quiz Results: ${quiz.title}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Score: ${session.score} / ${quiz.questions.reduce((sum, q) => sum + q.points, 0)}`);
  doc.fontSize(12).text(`User: ${session.user_name}`);
  doc.fontSize(12).text(`Completed: ${session.completed_at.toLocaleString()}`);
  doc.moveDown();
  
  session.answers.forEach((answer, idx) => {
    const question = quiz.questions.find(q => q.id === answer.question_id) || {};
    doc.fontSize(12).text(`Question ${idx+1}: ${question.text || 'Unknown question'}`);
    doc.fontSize(10).text(`Your answer: ${answer.user_answer}`);
    doc.fontSize(10).text(`Correct answer: ${question.correct_answer}`);
    doc.fontSize(10).text(`Result: ${answer.correct ? 'Correct' : 'Incorrect'} (${answer.points} points)`);
    doc.moveDown();
  });
  
  doc.end();
  
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(pdfData),
      'Content-Type': 'application/pdf',
      'Content-disposition': `attachment;filename=quiz-results-${req.params.session_id}.pdf`
    });
    res.end(pdfData);
  });
}));

// Shareable results endpoint for social sharing
app.get('/api/quizzes/:id/shared-results/:session_id', asyncHandler(async (req, res) => {
  const session = await QuizSession.findOne({ session_id: req.params.session_id });
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const quiz = await Quiz.findOne({ id: req.params.id });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  
  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  
  // Return limited info for sharing
  res.json({
    quiz_title: quiz.title,
    user_name: session.user_name,
    score: session.score,
    total_points: totalPoints,
    percentage: Math.round((session.score / totalPoints) * 100),
    completed_at: session.completed_at
  });
}));

// Analytics endpoint with caching
app.get('/api/quizzes/:id/analytics', cacheAnalytics, asyncHandler(async (req, res) => {
  const sessions = await QuizSession.find({ quiz_id: req.params.id });
  const quiz = await Quiz.findOne({ id: req.params.id });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.completed_at).length;
  const completedSessionsData = sessions.filter(s => s.completed_at && typeof s.score === 'number');

  // Calculate average score as percentage
  const avgScore = completedSessionsData.length > 0
    ? (completedSessionsData.reduce((sum, s) => sum + (s.score / quiz.questions.reduce((sum, q) => sum + q.points, 0) * 100), 0) / completedSessionsData.length).toFixed(2)
    : 0;

  // Calculate question performance based on completed sessions only
  const questionPerformance = quiz.questions.map((q) => {
    const correctAnswers = completedSessionsData.reduce((count, s) => {
      const answer = s.answers.find(a => a.question_id === q.id);
      return count + (answer && answer.correct ? 1 : 0);
    }, 0);
    return {
      question_id: q.id,
      correct_percentage: completedSessionsData.length > 0 ? (correctAnswers / completedSessionsData.length * 100).toFixed(2) : 0
    };
  });

  const analyticsData = {
    avg_score: parseFloat(avgScore),
    completion_rate: totalSessions > 0 ? completedSessions / totalSessions : 0,
    question_performance: questionPerformance
  };
  
  // Cache the analytics data if Redis is available
  if (redisClient) {
    try {
      await redisClient.set(`analytics:${req.params.id}`, analyticsData, { ex: DEFAULT_EXPIRATION });
    } catch (redisErr) {
      console.error('Redis caching error:', redisErr);
    }
  }

  res.json(analyticsData);
}));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'An internal server error occurred' 
      : err.message
  });
});

// Start server with improved error handling
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle process termination signals
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;