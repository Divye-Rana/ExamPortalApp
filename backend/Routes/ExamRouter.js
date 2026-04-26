const { 
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
} = require('../Controller/ExamController');
const ensureAuthenticated = require('../Middleware/auth');

const router = require('express').Router();

// Student routes
router.get('/exams', ensureAuthenticated, getAllExams);
router.get('/exams/:id', ensureAuthenticated, getExamById);
router.post('/exams/start', ensureAuthenticated, startExam);
router.post('/exams/save-progress', ensureAuthenticated, saveExamProgress);
router.post('/exams/submit', ensureAuthenticated, submitExam);
router.get('/submissions', ensureAuthenticated, getStudentSubmissions);

// Admin routes
router.post('/admin/exams', ensureAuthenticated, createExam);
router.get('/admin/exams', ensureAuthenticated, getAdminExams);
router.get('/admin/exams/:examId/statistics', ensureAuthenticated, getExamStatistics);
router.get('/admin/students', ensureAuthenticated, getAllStudents);
router.delete('/admin/exams/:id', ensureAuthenticated, deleteExam);

module.exports = router;
