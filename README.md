# Music Player Web Application

A beautiful and feature-rich music player web application built with React, Express, and MongoDB.

## Features

- User authentication (register/login)
- Create and manage custom playlists
- Add songs to playlists
- Play music with a built-in audio player
- Admin dashboard for managing songs
- Responsive and modern UI using Ant Design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd music-player
```

2. Install backend dependencies:

```bash
npm install
```

3. Install frontend dependencies:

```bash
cd client
npm install
```

4. Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/music-player
JWT_SECRET=your-secret-key
PORT=5000
```

## Running the Application

1. Start the backend server:

```bash
npm run dev
```

2. In a new terminal, start the frontend development server:

```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Usage

1. Register a new account or login with existing credentials
2. Browse the available songs on the home page
3. Create custom playlists from the "My Playlists" page
4. Add songs to your playlists
5. Play music using the built-in audio player
6. Admin users can upload and manage songs from the admin dashboard

## Admin Access

To create an admin user, you can either:

1. Register a new user and update their role to 'admin' in the MongoDB database
2. Use the first registered user as admin by updating their role

## Technologies Used

- Frontend:

  - React
  - Ant Design
  - React Router
  - Axios
  - Redux Toolkit

- Backend:
  - Express.js
  - MongoDB with Mongoose
  - JWT Authentication
  - Multer for file uploads

## License

MIT
