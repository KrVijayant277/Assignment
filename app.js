import express from 'express';
import itemsRouter from './routes/items.js';
import db from './config/database.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import limiter from './middleware/rateLimiter.js';
import authRouter from './routes/auth.js';
import auth from './middleware/auth.js';
import errorHandler from './middleware/errorHandler.js';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Test database connection
db.connect()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// Apply rate limiting to all routes
app.use(limiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/items', auth, itemsRouter);

// Global error handler - must be after all routes
app.use(errorHandler);

// Ensure logs.json exists before starting the server
async function initializeLogs() {
  const logsPath = path.join(__dirname, 'logs.json');
  try {
    await fs.access(logsPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Create logs.json with initial structure if it doesn't exist
      await fs.writeFile(logsPath, JSON.stringify({ items: [] }, null, 2));
      console.log('Created logs.json file');
    } else {
      throw error;
    }
  }
}

// Modify the app startup
async function startServer() {
  try {
    await initializeLogs();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

startServer(); 