# PlacementPrep – AI-Powered Placement Preparation Platform

PlacementPrep is a full-stack web application designed to help students prepare for campus placements through a single integrated platform.

It combines DSA practice, mock assessments, company-specific preparation, resume analysis, AI-powered interview practice, and placement readiness tracking.

## Features

- **User Authentication**
  - Secure registration and login
  - JWT-based authentication
  - Protected routes

- **DSA Practice**
  - Track DSA preparation
  - Organize and monitor problem-solving progress

- **Mock Tests**
  - Take placement-oriented assessments
  - Track test performance

- **Company DNA**
  - Company-specific placement preparation
  - Understand important preparation areas for different companies

- **AI Resume Analyzer**
  - Analyze resumes
  - Receive AI-generated feedback and improvement suggestions

- **AI Interview Simulator**
  - Practice interview questions
  - Receive AI-powered responses and feedback

- **Placement Readiness Dashboard**
  - Centralized overview of preparation progress
  - Placement Readiness Index (PRI)
  - Tracks DSA, mock tests, consistency, and interview preparation

## Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- CSS
- Axios
- React Router

### Backend

- Node.js
- Express.js
- REST APIs
- JWT Authentication

### Database

- MongoDB
- Mongoose

### AI Integration

- Groq API

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Project Architecture

```text
User
 │
 ▼
React + Vite Frontend
 │
 │ REST API Requests
 ▼
Node.js + Express Backend
 │
 ├── Authentication
 ├── DSA APIs
 ├── Mock Test APIs
 ├── Dashboard APIs
 ├── Resume Analyzer
 ├── Interview Simulator
 │
 ▼
MongoDB Atlas
```

## Project Structure

```text
placement-prep-platform/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd placement-prep-platform
```

Install backend dependencies:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

Start the backend:

```bash
node server.js
```

Install and start the frontend:

```bash
cd ../frontend
npm install
npm run dev
```

## Security

Sensitive credentials such as database connection strings, JWT secrets, and API keys are stored using environment variables and are not committed to the repository.

## Live Demo

[View PlacementPrep Live](
placement-prep-platform-kulkvu0fn-manojdharavaths-projects.vercel.app)
## Future Improvements

- Forgot password and email verification
- Advanced placement analytics
- More company-specific preparation data
- Improved AI interview evaluation
- Personalized preparation recommendations

## Author

**Dharavath Manoj**

B.Tech – Electronics and Communication Engineering  
Malaviya National Institute of Technology Jaipur
