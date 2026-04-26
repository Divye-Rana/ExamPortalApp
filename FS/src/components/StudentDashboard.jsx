import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleSuccess, handleError } from "../utils";
import { ToastContainer } from 'react-toastify';
import './studentDashBoard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function StudentDashboard() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('available'); // available, results
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedInUser(localStorage.getItem('loggedInUser'));
    fetchExams();
    fetchSubmissions();
  }, []);

  const fetchExams = async () => {
    try {
      const url = `${API_URL}/api/exams`;
      const headers = {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      };
      const response = await fetch(url, headers);
      const result = await response.json();
      if (result.success) {
        setExams(result.exams);
      }
    } catch (err) {
      handleError(err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const url = `${API_URL}/api/submissions`;
      const headers = {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      };
      const response = await fetch(url, headers);
      const result = await response.json();
      if (result.success) {
        setSubmissions(result.submissions);
      }
    } catch (err) {
      handleError(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('expireTime');
    localStorage.removeItem('userRole');
    handleSuccess('User Logged out');
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getExamStatus = (examId) => {
    // Get the most relevant submission for this exam (prefer completed, then in-progress)
    const examSubmissions = submissions.filter(s => s.examId._id === examId);
    if (examSubmissions.length === 0) return null;
    
    // Prefer completed submission
    const completed = examSubmissions.find(s => s.status === 'completed');
    if (completed) return completed;
    
    // Otherwise return in-progress/interrupted
    return examSubmissions.find(s => s.status === 'in-progress' || s.status === 'interrupted');
  };

  // Get unique submissions per exam (only the most relevant one)
  const getUniqueSubmissions = () => {
    const examMap = new Map();
    submissions.forEach(sub => {
      const examId = sub.examId._id;
      const existing = examMap.get(examId);
      
      // Prefer completed submissions
      if (!existing) {
        examMap.set(examId, sub);
      } else if (sub.status === 'completed' && existing.status !== 'completed') {
        examMap.set(examId, sub);
      } else if (sub.status === 'completed' && existing.status === 'completed') {
        // If both completed, keep the latest one
        if (new Date(sub.submittedAt) > new Date(existing.submittedAt)) {
          examMap.set(examId, sub);
        }
      }
    });
    return Array.from(examMap.values());
  };

  return (
    <div className="student-dashboard">
      <nav className="student-nav">
        <div className="logo">
          <i className="ri-graduation-cap-fill"></i>
          <span>Student Portal</span>
        </div>
        <div className="nav-right">
          <span className="user-name">{loggedInUser}</span>
          <button onClick={handleLogout} className="logout-btn">
            <i className="ri-logout-box-line"></i> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={activeTab === 'available' ? 'active' : ''}
            onClick={() => setActiveTab('available')}
          >
            <i className="ri-file-list-3-line"></i> Available Exams
          </button>
          <button
            className={activeTab === 'results' ? 'active' : ''}
            onClick={() => setActiveTab('results')}
          >
            <i className="ri-trophy-line"></i> My Results
          </button>
        </div>

        {activeTab === 'available' && (
          <div className="exams-section">
            <h2>Available Exams</h2>
            {exams.filter(exam => {
              const submission = getExamStatus(exam._id);
              return !submission || submission.status !== 'completed';
            }).length === 0 ? (
              <div className="no-exams">
                <i className="ri-inbox-line"></i>
                <p>No exams available at the moment</p>
              </div>
            ) : (
              <div className="exams-grid">
                {exams.filter(exam => {
                  const submission = getExamStatus(exam._id);
                  return !submission || submission.status !== 'completed';
                }).map(exam => {
                  const submission = getExamStatus(exam._id);
                  return (
                    <div key={exam._id} className="exam-card">
                      <div className="exam-header">
                        <h3>{exam.title}</h3>
                        {submission && (
                          <span className={`status-badge ${submission.status}`}>
                            Resume
                          </span>
                        )}
                      </div>
                      <div className="exam-details">
                        <div className="detail-item">
                          <i className="ri-book-line"></i>
                          <span>{exam.subject}</span>
                        </div>
                        <div className="detail-item">
                          <i className="ri-time-line"></i>
                          <span>{exam.duration} minutes</span>
                        </div>
                        <div className="detail-item">
                          <i className="ri-award-line"></i>
                          <span>{exam.totalMarks} marks</span>
                        </div>
                        <div className="detail-item">
                          <i className="ri-question-line"></i>
                          <span>{exam.questions.length} questions</span>
                        </div>
                      </div>
                      <div className="exam-dates">
                        <p><strong>Start:</strong> {formatDate(exam.startDate)}</p>
                        <p><strong>End:</strong> {formatDate(exam.endDate)}</p>
                      </div>
                      <button 
                        onClick={() => handleStartExam(exam._id)} 
                        className="start-exam-btn"
                      >
                        {submission && (submission.status === 'in-progress' || submission.status === 'interrupted')
                          ? <><i className="ri-play-circle-line"></i> Resume Exam</>
                          : <><i className="ri-play-circle-line"></i> Start Exam</>
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="results-section">
            <h2>My Results</h2>
            {submissions.length === 0 ? (
              <div className="no-exams">
                <i className="ri-inbox-line"></i>
                <p>No exam submissions yet</p>
              </div>
            ) : (
              <div className="results-grid">
                {getUniqueSubmissions().map(submission => (
                  <div key={submission._id} className="result-card">
                    <div className="result-header">
                      <h3>{submission.examId.title}</h3>
                      <span className={`status-badge ${submission.status}`}>
                        {submission.status}
                      </span>
                    </div>
                    <div className="result-details">
                      <p><strong>Subject:</strong> {submission.examId.subject}</p>
                      <p><strong>Started:</strong> {formatDate(submission.startTime)}</p>
                      {submission.status === 'completed' && (
                        <>
                          <p><strong>Submitted:</strong> {formatDate(submission.submittedAt)}</p>
                          <div className="score-display">
                            <div className="score-circle">
                              <span className="score">{submission.score}</span>
                              <span className="total">/ {submission.totalMarks}</span>
                            </div>
                            <div className="percentage">
                              {((submission.score / submission.totalMarks) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </>
                      )}
                      {(submission.status === 'in-progress' || submission.status === 'interrupted') && (
                        <div className="incomplete-message">
                          <i className="ri-error-warning-line"></i>
                          <p>Exam not completed yet. Time remaining: {Math.floor(submission.timeRemaining / 60)} minutes</p>
                          <button 
                            onClick={() => handleStartExam(submission.examId._id)} 
                            className="resume-btn"
                          >
                            <i className="ri-play-circle-line"></i> Resume Exam
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default StudentDashboard;
