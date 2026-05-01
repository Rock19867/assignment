# Team Task Manager

A full-stack web application for creating projects, assigning tasks, and tracking progress with role-based access.

## Features
- **Authentication**: Signup and Login with JWT
- **Role-Based Access**: Admin (can create projects/tasks, delete, edit) and Member (can view projects, update task statuses)
- **Projects**: Create and manage team projects
- **Tasks**: Kanban/List tracking with priorities and due dates
- **Dashboard**: Overview of tasks and projects status

## Tech Stack
- Frontend: React (Vite), Zustand, Tailwind-inspired Vanilla CSS, React Router DOM
- Backend: Node.js, Express, MongoDB, Mongoose
- Deployment: Ready for Railway deployment

## Run Locally
1. Clone the repository.
2. Setup `.env` in `server/` with:
   ```
   MONGO_URI=<your_mongodb_uri>
   JWT_SECRET=<your_secret>
   PORT=5000
   ```
3. Run `npm install` in root directory.
4. Run `npm run build` to build the frontend.
5. Run `npm start` to start the backend server which serves the built frontend.

## Deployment to Railway
1. Connect your GitHub repository to Railway.
2. Railway will automatically detect the root `package.json`.
3. Add the environment variables (`MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`) in the Railway dashboard.
4. Deploy!
