# College Photography Voting Event

A MERN stack application for college cultural photography voting events.

## Tech Stack

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React

## Features

- Student login (register number) with one-time vote for photo & video
- Coordinator login (username/password), JWT secured
- Coordinator dashboard for uploading media, editing titles, deleting, viewing votes & voters
- Gallery with categories, vote confirmation, confetti animation, badges, previews
- Leaderboard sorted by votes

## Prerequisites

- Node.js (16+)
- MongoDB instance (local or Atlas)

## Setup

### Backend

```
bash
cd server
npm install
```

Create `.env` file in server/:
```
MONGODB_URI=mongodb://localhost:27017/photography_event
JWT_SECRET=your_secret_here
PORT=5000
```

Seed coordinator account (optional):
```
bash
node scripts/seedCoordinator.js
```
Default: `admin` / `password123`

Start server:
```
bash
npm run dev
```

### Frontend

```
bash
cd client
npm install
```

Create `.env` file in client/:
```
REACT_APP_API_URL=http://localhost:5000
```

Start frontend:
```
bash
npm start
```

Visit `http://localhost:3000`

## Database Collections

- **students**: registerNumber, votedPhoto, votedVideo
- **media**: title, type (photo/video), url, votes, voters
- **coordinators**: username, password (hashed)

## License

MIT
