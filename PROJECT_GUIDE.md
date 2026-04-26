# Smart Exam Portal - Complete Guide

A full-stack MERN (MongoDB, Express, React, Node.js) exam management system for teachers and students.

## Features

### For Admin/Teachers:
- 🎓 **Create Exams**: Build custom exams with multiple-choice questions
- 📊 **View Statistics**: Track student performance and exam completion rates
- 👥 **Manage Students**: View all registered students
- 📈 **Real-time Monitoring**: See which students are currently taking exams
- 📝 **Detailed Results**: View individual student scores and submission times

### For Students:
- 📚 **Take Exams**: Access and complete available exams
- ⏱️ **Timer Management**: Automatic timer with warnings when time is running out
- 💾 **Auto-save Progress**: Exam progress is automatically saved every 30 seconds
- ▶️ **Resume Capability**: Continue interrupted exams from where you left off
- 🏆 **View Results**: Check your scores and performance history
- 📊 **Progress Tracking**: See answered vs. unanswered questions in real-time

### Advanced Features:
- ✅ **Auto-submission**: Exams are automatically submitted when time expires
- 🔄 **Session Recovery**: Resume exams if browser closes or connection drops
- 🎨 **Professional UI**: Modern, gradient-based design with smooth animations
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🔐 **Secure Authentication**: JWT-based authentication system
- 🚦 **Status Tracking**: Track exam status (in-progress, interrupted, completed)

## Setup Instructions

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Make sure your `.env` file has the following:
   ```
   MONGO_CONN=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

4. Start the backend server:
   ```bash
   node server.js
   ```
   
   The server will run on http://localhost:3000

### Frontend Setup

1. Navigate to the FS (frontend) folder:
   ```bash
   cd FS
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will run on http://localhost:5173

## How to Use

### For Teachers (Admin):

1. **Sign Up as Admin**:
   - Go to Sign Up page
   - Fill in your details
   - Select "Admin (Teacher)" from the dropdown
   - Click Sign Up

2. **Create an Exam**:
   - Log in with your admin credentials
   - Click "Create Exam" in the sidebar
   - Fill in exam details:
     - Title (e.g., "Mathematics Final Exam")
     - Subject
     - Duration in minutes
     - Start and End dates
   - Add questions:
     - Click "Add Question"
     - Enter question text
     - Add 4 options
     - Select the correct answer
     - Set marks for the question
   - Click "Create Exam" to save

3. **View Exam Statistics**:
   - Click "My Exams" in the sidebar
   - Click "View Stats" on any exam
   - See:
     - Total students who attempted
     - Completed submissions
     - In-progress/interrupted exams
     - Individual student scores
     - Submission times

4. **Manage Students**:
   - Click "Students" in the sidebar
   - View all registered students
   - See registration dates

### For Students:

1. **Sign Up as Student**:
   - Go to Sign Up page
   - Fill in your details
   - Select "Student" from the dropdown (default)
   - Click Sign Up

2. **Take an Exam**:
   - Log in with your student credentials
   - Click "Available Exams" tab
   - Click "Start Exam" on any available exam
   - Answer questions by selecting options
   - Progress is auto-saved every 30 seconds
   - Submit when done or wait for auto-submission when time expires

3. **Resume an Interrupted Exam**:
   - If you exit during an exam, you can resume it
   - Click "Resume Exam" on the exam card
   - Your answers and remaining time are preserved

4. **View Your Results**:
   - Click "My Results" tab
   - See all your exam submissions
   - View scores and percentages for completed exams
   - Check status of in-progress exams

## Exam Taking Rules

1. **Timer**: 
   - Timer starts when you begin the exam
   - Shows remaining time in HH:MM:SS format
   - Turns red and pulses when less than 5 minutes remain
   - Exam auto-submits when timer reaches 0

2. **Progress Tracking**:
   - Question navigator shows which questions are answered (green) or unanswered (white)
   - Progress bar shows completion percentage
   - Counter shows "X of Y answered"

3. **Saving Progress**:
   - Progress auto-saves every 30 seconds
   - Progress is saved if you close the browser
   - You can resume from where you left off

4. **Submission**:
   - Manual: Click "Submit Exam" button
   - Automatic: Happens when time expires
   - Confirmation: Asked if you have unanswered questions
   - Once submitted, you cannot retake the exam

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user

### Student APIs
- `GET /api/exams` - Get all available exams
- `GET /api/exams/:id` - Get exam by ID
- `POST /api/exams/start` - Start/resume exam
- `POST /api/exams/save-progress` - Save exam progress
- `POST /api/exams/submit` - Submit exam
- `GET /api/submissions` - Get student's submissions

### Admin APIs
- `POST /api/admin/exams` - Create new exam
- `GET /api/admin/exams` - Get admin's exams
- `GET /api/admin/exams/:examId/statistics` - Get exam statistics
- `GET /api/admin/students` - Get all students
- `DELETE /api/admin/exams/:id` - Delete exam

## Database Models

### User Model
- name: String
- email: String (unique)
- password: String (hashed)
- role: String (student/admin)

### Exam Model
- title: String
- subject: String
- duration: Number (minutes)
- totalMarks: Number
- questions: Array of Question objects
- createdBy: ObjectId (ref: User)
- startDate: Date
- endDate: Date
- isActive: Boolean

### ExamSubmission Model
- examId: ObjectId (ref: Exam)
- studentId: ObjectId (ref: User)
- studentName: String
- studentEmail: String
- answers: Array of Answer objects
- score: Number
- totalMarks: Number
- startTime: Date
- endTime: Date
- timeRemaining: Number (seconds)
- status: String (in-progress/completed/interrupted)
- submittedAt: Date

## Technologies Used

### Backend:
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

### Frontend:
- React.js with Hooks
- React Router for navigation
- Axios for API calls
- React Toastify for notifications
- Remix Icon for icons

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected routes (Private Routes)
- Token expiration handling
- CORS enabled for cross-origin requests

## Tips for Best Experience

1. **For Admins**:
   - Set realistic exam durations
   - Include clear, unambiguous questions
   - Test exams before assigning to students
   - Monitor statistics regularly

2. **For Students**:
   - Start exams when you have stable internet
   - Read questions carefully before answering
   - Use the question navigator to track progress
   - Don't refresh the page during exam (progress is auto-saved)

## Troubleshooting

**Backend not connecting?**
- Check if MongoDB is running
- Verify `.env` file has correct connection string
- Make sure port 3000 is not in use

**Frontend not loading?**
- Check if backend is running on port 3000
- Verify API URLs in frontend match backend port
- Clear browser cache

**Can't login?**
- Check email and password are correct
- Verify user was created successfully
- Check backend console for errors

## Future Enhancements

- [ ] Essay-type questions
- [ ] Image/media support in questions
- [ ] Exam categories and filtering
- [ ] Student analytics dashboard
- [ ] Email notifications
- [ ] Exam scheduling
- [ ] Certificate generation
- [ ] Export results to Excel

## License

MIT License - Feel free to use and modify as needed.

## Support

For issues or questions, please check the backend console logs and browser console for error messages.
