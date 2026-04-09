# FitTrack 🏋️

**FitTrack** is a full-stack training management application that allows users to create workout routines, log training sessions, and track their strength progress over time.

The goal of this project is to build a structured, secure, and scalable fitness tracking platform using modern web technologies.

FitTrack is a personal project built to practise full-stack development with React and .NET.

Note: The live demo is currently unavailable because the free backend hosting plan expired. I am working on a solution to redeploy it soon!

## 📸 Screenshots

<p align="center">
  <img src="./docs/screenshots/01-landing.png" width="48%" alt="Landing Page">
  <img src="./docs/screenshots/02-dashboard.png" width="48%" alt="Dashboard and Routines">
</p>
<p align="center">
  <img src="./docs/screenshots/05-workout-log.png" width="48%" alt="Routiones">
  <img src="./docs/screenshots/04-workout-session.png" width="48%" alt="Workout Session">
</p>
<p align="center">
  <img src="./docs/screenshots/03-routines.png" width="30%" alt="Workout-log">
</p>

🔗 **Live demo:** [https://fittrack-prospi.netlify.app/](https://fittrack-prospi.netlify.app/)

## 🚀 Features

**🔐 Authentication**

- User registration and login (JWT-based authentication)
- Secure password hashing with BCrypt
- Protected and public routes
- Automatic session expiration handling

**🏋️ Exercise Catalogue**

- Browse a curated exercise catalogue with muscle group filtering
- Admin-managed catalogue
- Users can submit exercise requests for review

**📋 Routine Management**

- Create, edit, and delete routines
- Add exercises with sets, reps, and weight
- Reorder exercises within a routine
- Personalized data per user

**📝 Workout Logging**

- Log training sessions linked to routines or as free workouts
- Record sets (weight & reps) per exercise
- View and delete past sessions

**👤 User Profile**

- Update display name
- Change password (with current password verification)
- Delete account

**⚙️ Admin Panel**

- Review and approve/reject user exercise requests
- Approved exercises are automatically added to the catalogue

**🌐 Public Pages**

- Landing page, About, Privacy Policy, Terms of Use
- Contact form (EmailJS)

## 💡 Tech Stack

**Frontend**
- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- Axios
- EmailJS

**Backend**
- ASP.NET Core 9 Web API
- Entity Framework Core
- PostgreSQL
- JWT Authentication
- BCrypt

**Infrastructure**
- Docker
- Render (deployment)

## 🗄️ Database Architecture

<img src="./docs/diagrams/db-diagram.png" width="85%" alt="Database Diagram">
The database is designed using a Code-First approach with Entity Framework Core

## 🛠️ Local Setup

### Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
* [PostgreSQL](https://www.postgresql.org/download/)
* [Docker](https://www.docker.com/) (Optional, if you want to run the DB via container)

### 1. Clone the repository
```bash
git clone https://github.com/prospi-dev/FitTrack.git
cd FitTrack
```

### 2. Backend Setup (.NET API)
1. Navigate to the backend directory:
   ```bash
   cd Backend/FitTrack
   ```
2. Update the `appsettings.json` or `appsettings.Development.json` with your PostgreSQL connection string and JWT Secret:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Database=FitTrackDB;Username=postgres;Password=yourpassword"
   },
   "JwtSettings": {
     "Secret": "your_super_secret_jwt_key_here"
   }
   ```
3. Apply Entity Framework migrations to create the database:
   ```bash
   dotnet ef database update
   ```
4. Run the API:
   ```bash
   dotnet run
   ```

### 3. Frontend Setup (React + Vite)
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd Frontend/FitTrack
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the frontend folder and set your API base URL (if needed):
   ```env
   VITE_API_BASE_URL=https://localhost:5001/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

Now you can open `http://localhost:5173` in your browser to see the app!

## 📌 Roadmap

- [x] Authentication System
- [x] Exercise catalogue
- [x] Exercise requests (user → admin flow)
- [x] Routines CRUD
- [x] Workout session logging
- [x] User profile management
- [x] Admin panel
- [x] Deployment

## 🔮 Future Improvements

- Data visualization charts (progress over time)
- Export training history
- Personal records tracking
