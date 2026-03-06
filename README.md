# FitTrack 🏋️

**FitTrack** is a full-stack training management application that allows users to create workout routines, log training sessions, and track their strength progress over time.

The goal of this project is to build a structured, secure, and scalable fitness tracking platform using modern web technologies.

FitTrack is a personal project built to practise full-stack development with React and .NET.

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
