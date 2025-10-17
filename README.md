# MindSync - Digital Mental Health Platform

MindSync is a comprehensive digital health platform designed to bridge the gap between traditional clinical mental health services and proactive, community-driven wellness. The platform provides a seamless, secure, and empathetic ecosystem that supports users at every stage of their mental well-being journey.

## Features

### Core Features
- **User Registration & Authentication**: Secure account creation with anonymous login option
- **Doctor & Hospital Search & Booking**: Advanced search and appointment scheduling
- **Appointment Management**: Complete appointment lifecycle with online/offline consultation support
- **Prescription Management**: Digital prescriptions with download and refill capabilities
- **Profile Management**: Comprehensive profile management for users, doctors, and hospitals
- **Dashboard & Analytics**: Personalized dashboards with analytics for users, doctors, hospitals, and admins

### Mental Health Features
- **Therapy Assessments**: PHQ-9 and other validated assessments with personalized recommendations
- **Journaling Notes**: Personal journal with mood tracking and insights
- **AI Chatbots**: Neha (empathetic listener) and Gemini (informational assistant)
- **Course Catalog**: Educational content and therapeutic courses

### Community Features
- **Community Forum**: Supportive community with anonymous posting
- **Feedback & Ratings**: Review system for healthcare providers
- **Email Notifications**: Automated reminders and updates

### Additional Features
- **Cab Booking**: Integration for appointment transportation
- **Admin Panel**: Comprehensive platform management
- **Multi-user Support**: Patient, doctor, hospital, and admin roles

## Tech Stack

### Backend
- **Node.js** with **Express.js** - Web framework
- **MongoDB** with **Mongoose** - Database and ODM
- **JSON Web Tokens (JWT)** - Authentication
- **bcryptjs** - Password hashing
- **Google Gemini API** - AI chatbot functionality
- **Nodemailer** - Email notifications

### Frontend
- **React 19** - User interface library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling framework
- **React Toastify** - Notification system

## Project Structure

```
SoulSync/
├── backend/
│   ├── controllers/     # Request handlers
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Authentication and validation
│   ├── config/          # Configuration files
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Application pages
│   │   ├── context/     # React context providers
│   │   ├── services/    # API services
│   │   ├── utils/       # Utility functions
│   │   ├── hooks/       # Custom React hooks
│   │   ├── styles/      # Styling files
│   │   ├── App.jsx      # Main application component
│   │   └── main.jsx     # Entry point
├── package.json         # Project dependencies
└── README.md            # This file
```

## Setup Instructions

### Prerequisites
- Node.js (version 18 or higher)
- MongoDB (local or cloud instance)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mindsync
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:5173
   # For email notifications (optional)
   # EMAIL_USER=your_email@gmail.com
   # EMAIL_PASS=your_app_password
   GEMINI_API_KEY=your_google_ai_studio_key
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following variable:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### User Management
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login
- `POST /api/users/register-anonymous` - Anonymous registration
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Doctor Management
- `POST /api/doctors/register` - Register as a doctor
- `GET /api/doctors/my-profile` - Get doctor profile
- `PUT /api/doctors/my-profile` - Update doctor profile
- `GET /api/doctors/search` - Search for doctors
- `GET /api/doctors/my-appointments` - Get doctor's appointments

### Appointment Management
- `POST /api/appointments/book` - Book an appointment
- `GET /api/appointments/my-appointments` - Get user appointments
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/confirm` - Confirm appointment
- `PUT /api/appointments/:id/complete` - Complete appointment

### Assessment Management
- `GET /api/assessments/types` - Get available assessment types
- `POST /api/assessments/submit` - Submit assessment answers
- `GET /api/assessments/my-results` - Get user's assessment results
- `GET /api/assessments/questions/:type` - Get assessment questions

### Prescription Management
- `POST /api/prescriptions/create` - Create a prescription
- `GET /api/prescriptions/my-prescriptions` - Get user prescriptions
- `GET /api/prescriptions/doctor-prescriptions` - Get doctor prescriptions
- `PUT /api/prescriptions/:id/refill` - Request prescription refill
- `GET /api/prescriptions/:id/download` - Download prescription

### Community & Support
- `GET /api/forum/posts` - Get forum posts
- `POST /api/forum/posts` - Create forum post
- `POST /api/forum/posts/:id/comments` - Add comment to post
- `GET /api/courses` - Get courses
- `POST /api/courses/:id/enroll` - Enroll in a course

### AI & Notifications
- `POST /api/ai/chat` - AI chat endpoint
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

## Security & Compliance

MindSync implements industry-standard security measures:
- JWT-based authentication with secure token storage
- Password hashing using bcrypt
- Input validation and sanitization
- Rate limiting to prevent abuse
- Secure data transmission with HTTPS
- HIPAA/GDPR compliance features

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mindsync
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GEMINI_API_KEY=your_google_ai_studio_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Deployment

### Backend
1. Set up a MongoDB database (Atlas or self-hosted)
2. Configure environment variables in production
3. Run `npm run start` for production

### Frontend
1. Build the application: `npm run build`
2. Serve the built files using any static server

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.

---

Built with ❤️ for better mental health support.