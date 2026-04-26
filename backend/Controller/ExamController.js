const ExamModel = require("../Models/exam");
const ExamSubmissionModel = require("../Models/examSubmission");
const UserModel = require("../Models/user");

// Admin: Create a new exam
const createExam = async (req, res) => {
    try {
        const { title, subject, duration, totalMarks, questions, startDate, endDate } = req.body;
        
        const exam = new ExamModel({
            title,
            subject,
            duration,
            totalMarks,
            questions,
            startDate,
            endDate,
            createdBy: req.user._id
        });
        
        await exam.save();
        res.status(201).json({ 
            message: "Exam created successfully", 
            success: true, 
            exam 
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

// Get all exams (for students)
const getAllExams = async (req, res) => {
    try {
        const currentDate = new Date();
        const exams = await ExamModel.find({ 
            isActive: true
        }).select('-questions.correctAnswer').sort({ startDate: 1 });
        
        res.status(200).json({ success: true, exams });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

// Get exam by ID (for students - without correct answers)
const getExamById = async (req, res) => {
    try {
        const { id } = req.params;
        const exam = await ExamModel.findById(id).select('-questions.correctAnswer');
        
        if (!exam) {
            return res.status(404).json({ message: "Exam not found", success: false });
        }
        
        res.status(200).json({ success: true, exam });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

// Start exam (create submission)
const startExam = async (req, res) => {
    try {
        const { examId } = req.body;
        const userId = req.user._id;
        
        // Check if exam exists
        const exam = await ExamModel.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: "Exam not found", success: false });
        }
        
        // Check if student has already completed this exam
        const completedSubmission = await ExamSubmissionModel.findOne({ 
            examId, 
            studentId: userId,
            status: 'completed'
        });
        
        if (completedSubmission) {
            return res.status(400).json({ 
                message: "You have already completed this exam", 
                success: false,
                alreadyCompleted: true
            });
        }
        
        // Use findOneAndUpdate with upsert to atomically find or create submission
        // This prevents race conditions where multiple requests create duplicate submissions
        let submission = await ExamSubmissionModel.findOneAndUpdate(
            { 
                examId, 
                studentId: userId,
                status: { $in: ['in-progress', 'interrupted'] }
            },
            {
                $setOnInsert: {
                    examId,
                    studentId: userId,
                    totalMarks: exam.totalMarks,
                    startTime: new Date(),
                    timeRemaining: exam.duration * 60,
                    answers: [],
                    status: 'in-progress'
                }
            },
            { 
                upsert: true, 
                new: true,
                setDefaultsOnInsert: true
            }
        )
        .populate('examId', 'title subject duration')
        .populate('studentId', 'name email');
        
        res.status(200).json({ 
            message: "Exam started", 
            success: true, 
            submission 
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

// Save exam progress
const saveExamProgress = async (req, res) => {
    try {
        const { submissionId, answers, timeRemaining } = req.body;
        
        const submission = await ExamSubmissionModel.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ message: "Submission not found", success: false });
        }
        
        submission.answers = answers;
        submission.timeRemaining = timeRemaining;
        submission.status = 'interrupted';
        
        await submission.save();
        res.status(200).json({ 
            message: "Progress saved", 
            success: true 
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

// Submit exam
const submitExam = async (req, res) => {
    try {
        const { submissionId, answers } = req.body;
        
        const submission = await ExamSubmissionModel.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ message: "Submission not found", success: false });
        }
        
        // Check if already submitted
        if (submission.status === 'completed') {
            return res.status(400).json({ message: "Exam already submitted", success: false });
        }
        
        // Get exam with correct answers
        const exam = await ExamModel.findById(submission.examId);
        
        // Calculate score - ensure proper type comparison
        let score = 0;
        answers.forEach(answer => {
            const question = exam.questions.id(answer.questionId);
            if (question && question.correctAnswer === Number(answer.selectedAnswer)) {
                score += question.marks;
            }
        });
        
        submission.answers = answers;
        submission.score = score;
        submission.status = 'completed';
        submission.endTime = new Date();
        submission.submittedAt = new Date();
        
        await submission.save();
        res.status(200).json({ 
            message: "Exam submitted successfully", 
            success: true,
            score,
            totalMarks: submission.totalMarks
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

// Get student's submissions
const getStudentSubmissions = async (req, res) => {
    try {
        const userId = req.user._id;
        const submissions = await ExamSubmissionModel.find({ studentId: userId })
            .populate('examId', 'title subject duration totalMarks')
            .populate('studentId', 'name email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, submissions });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

// Admin: Get all exams created by admin
const getAdminExams = async (req, res) => {
    try {
        const exams = await ExamModel.find({ createdBy: req.user._id })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, exams });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

// Admin: Get exam statistics
const getExamStatistics = async (req, res) => {
    try {
        const { examId } = req.params;
        
        const submissions = await ExamSubmissionModel.find({ examId })
            .populate('examId', 'title subject duration totalMarks')
            .populate('studentId', 'name email');
        
        const totalStudents = submissions.length;
        const completedSubmissions = submissions.filter(s => s.status === 'completed');
        const inProgressSubmissions = submissions.filter(s => s.status === 'in-progress' || s.status === 'interrupted');
        
        res.status(200).json({ 
            success: true, 
            statistics: {
                totalStudents,
                completedCount: completedSubmissions.length,
                inProgressCount: inProgressSubmissions.length,
                submissions: submissions
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

// Admin: Get all students
const getAllStudents = async (req, res) => {
    try {
        const students = await UserModel.find({ role: 'student' })
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, students });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

// Admin: Delete exam
const deleteExam = async (req, res) => {
    try {
        const { id } = req.params;
        await ExamModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Exam deleted successfully", success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

module.exports = {
    createExam,
    getAllExams,
    getExamById,
    startExam,
    saveExamProgress,
    submitExam,
    getStudentSubmissions,
    getAdminExams,
    getExamStatistics,
    getAllStudents,
    deleteExam
};
