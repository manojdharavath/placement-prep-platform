# AI Placement Prep Platform

A full-stack placement preparation platform designed to help students prepare for technical placements through DSA practice, mock tests, company-specific preparation, resume analysis, interview practice, and AI-powered guidance.

The platform brings important placement preparation activities into one application with a simple and structured user experience.

---

## Features

### User Authentication
- User registration and login
- JWT-based authentication
- Protected application routes
- Secure access to user-specific features

### Dashboard
- Centralized placement preparation dashboard
- Quick access to major preparation modules
- Displays preparation-related information and progress
- AI-powered guidance integrated into the dashboard

### DSA Tracker
- Topic-wise DSA preparation
- Practice problems across important DSA topics
- Track problem-solving progress
- Structured preparation for coding interviews

DSA topics include:

- Arrays
- Strings
- Linked Lists
- Stack
- Queue
- Binary Search
- Trees
- Graphs
- Heap
- Dynamic Programming

### Mock Tests
- Placement-oriented mock tests
- Dedicated test interface
- Submit answers and evaluate performance
- Store test results for progress tracking

### Company DNA
- Company-specific placement preparation
- Helps students understand preparation requirements for different companies
- Provides focused preparation guidance
- AI-assisted company preparation support

### Resume Analyzer
- Resume analysis for placement preparation
- AI-assisted resume feedback
- Helps identify possible improvements in a candidate's resume

### Interview Simulator
- Practice technical and interview questions
- AI-assisted interview interaction
- Helps students improve their interview preparation
- Interview results can be stored for tracking

### AI Assistance
- AI-powered preparation support
- Personalized guidance across different preparation modules
- AI services integrated with the backend
- Helps make placement preparation more interactive

### Progress Tracking
- Tracks preparation progress
- Stores user activity and results
- Helps users monitor their preparation over time

---

## Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- React Router

### Backend

- Node.js
- Express.js
- REST APIs
- JWT Authentication

### Database

- MongoDB
- Mongoose

### AI

- AI API integration
- AI-powered placement guidance
- Resume analysis
- Interview assistance
- Company-specific preparation assistance

### Development Tools

- Git
- GitHub
- VS Code
- npm

---

## Project Structure

```text
placement-prep-platform/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── services/
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Application Modules

```text
Authentication
      │
      ▼
   Dashboard
      │
      ├── DSA Tracker
      │
      ├── Mock Tests
      │
      ├── Company DNA
      │
      ├── Resume Analyzer
      │
      └── Interview Simulator
```

---

## How It Works

The React frontend provides the user interface for the platform.

The frontend communicates with the Node.js and Express backend through REST APIs.

The backend handles:

- Authentication
- DSA problems
- Mock tests
- User progress
- Dashboard data
- Company preparation
- Resume analysis
- Interview functionality
- AI-related requests

MongoDB is used to store application data.

---

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git
- MongoDB or MongoDB Atlas

---

## Clone the Repository

```bash
git clone https://github.com/manojdharavath/placement-prep-platform.git
```

Then:

```bash
cd placement-prep-platform
```

---

## Backend Setup

Move to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder.

Add the environment variables required by the application, for example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Add the required AI API credentials according to your local configuration.

Start the backend using the script configured in `backend/package.json`.

For example:

```bash
npm start
```

or:

```bash
npm run dev
```

---

## Frontend Setup

Open another terminal and move to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure the required frontend environment variables in a local `.env` file.

Start the frontend:

```bash
npm run dev
```

The application will run on the local URL provided by Vite.

---

## Environment Variables

Environment files are excluded from GitHub using `.gitignore`.

```text
.env
.env.*
```

Sensitive information such as:

- MongoDB connection strings
- JWT secrets
- AI API keys

should never be committed to the repository.

---

## Security

The project includes:

- JWT-based authentication
- Protected frontend routes
- Authentication middleware
- Protected backend endpoints
- Environment variables for sensitive credentials

---

## Screenshots

Screenshots of the final deployed application will be added here.

### Dashboard

Coming soon.

### DSA Tracker

Coming soon.

### Mock Tests

Coming soon.

### Company DNA

Coming soon.

### Resume Analyzer

Coming soon.

### Interview Simulator

Coming soon.

---

## Deployment

The application will be deployed after final production configuration and testing.

**Live Demo:** Coming Soon

---

## Future Improvements

Possible future improvements include:

- Additional DSA problems
- More company-specific preparation content
- More mock-test questions
- Enhanced AI recommendations
- Improved interview analysis
- Advanced progress analytics
- UI and performance improvements

---

## Author

**Dharavath Manoj**

B.Tech - Electronics and Communication Engineering  
Malaviya National Institute of Technology Jaipur

GitHub:  
https://github.com/manojdharavath

---

## Project Status

Core development is complete.

Current finalization work:

- GitHub documentation
- Production deployment
- Final testing

---

## Repository

GitHub Repository:

https://github.com/manojdharavath/placement-prep-platform
