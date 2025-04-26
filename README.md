# Money Flow Compass

A modern, full-stack personal finance management application built with React, TypeScript, and Node.js.

## Features

- 📊 **Interactive Dashboard**: Real-time overview of your financial status
- 💰 **Transaction Management**: Track and categorize your income and expenses
- 📅 **Budget Planning**: Set and monitor budgets by category
- 📈 **Financial Insights**: Analyze spending patterns and trends
- 📱 **Responsive Design**: Seamless experience across all devices
- 🌓 **Dark/Light Mode**: Choose your preferred theme
- 🔒 **Secure**: Built with security best practices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- TailwindCSS for styling
- Shadcn/UI for component library
- React Query for data fetching
- React Router for navigation
- Recharts for data visualization

### Backend
- Node.js with TypeScript
- Express.js for API server
- MongoDB for database (requires separate installation)
- Rate limiting and validation middleware

## Prerequisites

- Node.js 18.x or higher
- MongoDB 5.x or higher
- Git

## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/moneyflowcompass.git
cd moneyflowcompass
\`\`\`

2. Install dependencies for both frontend and backend:
\`\`\`bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
\`\`\`

3. Create environment files:

Frontend (.env in client folder):
\`\`\`env
VITE_API_URL=http://localhost:3000/api
\`\`\`

Backend (.env in server folder):
\`\`\`env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/moneyflowcompass
NODE_ENV=development
\`\`\`

## Running the Application

1. Start the backend server:
\`\`\`bash
cd server
npm run dev
\`\`\`

2. In a new terminal, start the frontend development server:
\`\`\`bash
cd client
npm run dev
\`\`\`

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api

## API Endpoints

### Categories
- GET /api/categories - List all categories
- POST /api/categories - Create a new category
- PUT /api/categories/:id - Update a category
- DELETE /api/categories/:id - Delete a category

### Transactions
- GET /api/transactions - List transactions with pagination
- POST /api/transactions - Create a new transaction
- PUT /api/transactions/:id - Update a transaction
- DELETE /api/transactions/:id - Delete a transaction
- GET /api/transactions/monthly - Get monthly expense summary

### Budgets
- GET /api/budgets - List all budgets
- POST /api/budgets - Create a new budget
- PUT /api/budgets/:id - Update a budget
- DELETE /api/budgets/:id - Delete a budget
- GET /api/budgets/comparison - Get budget vs actual comparison

### Dashboard
- GET /api/dashboard - Get dashboard summary
- GET /api/dashboard/insights - Get spending insights

## Production Deployment

1. Build the frontend:
\`\`\`bash
cd client
npm run build
\`\`\`

2. Build the backend:
\`\`\`bash
cd server
npm run build
\`\`\`

3. Start the production server:
\`\`\`bash
cd server
npm start
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

If you discover any security-related issues, please email security@moneyflowcompass.com instead of using the issue tracker.

## Support

For support questions, bug reports, or feature requests, please use the GitHub Issues section.