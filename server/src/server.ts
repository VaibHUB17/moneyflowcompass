import app from './app';
import connectDB from './config/db';
import config from './config/config';
import seedCategories from './utils/seed';

// Connect to database
connectDB()
  .then(() => {
    console.log('MongoDB connected successfully!');
    
    // Seed default categories
    // return seedCategories();
  })
  .then(() => {
    // Start server
    const server = app.listen(config.port, () => {
      console.log(
        `Server running in ${config.nodeEnv} mode on port ${config.port}`
      );
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      console.log(`Error: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });