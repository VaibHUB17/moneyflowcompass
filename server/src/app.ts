import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import routes
import categoryRoutes from './routes/categoryRoutes';
import transactionRoutes from './routes/transactionRoutes';
import budgetRoutes from './routes/budgetRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

// Import middleware
import { errorHandler } from './middleware/errorMiddleware';
import { rateLimiter } from './middleware/rateLimitMiddleware';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();

// Apply global middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(rateLimiter);

// Mount routes
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is up and running',
    timestamp: new Date()
  });
});

// Default route for API documentation
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Personal Finance Visualizer API',
    documentation: 'API documentation coming soon'
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;