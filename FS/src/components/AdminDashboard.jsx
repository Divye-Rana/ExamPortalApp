import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleSuccess, handleError } from "../utils";
import { ToastContainer } from 'react-toastify';
import './adminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function AdminDashboard() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examStats, setExamStats] = useState(null);
  const [activeTab, setActiveTab] = useState('exams'); // exams, students, create
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedInUser(localStorage.getItem('loggedInUser'));
    fetchExams();
    fetchStudents();
  }, []);

  const fetchExams = async () => {
    try {
      const url = `${API_URL}/api/admin/exams`;
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

  const fetchStudents = async () => {
    try {
      const url = `${API_URL}/api/admin/students`;
      const headers = {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      };
      const response = await fetch(url, headers);
      const result = await response.json();
      if (result.success) {
        setStudents(result.students);
      }
    } catch (err) {
      handleError(err);
    }
  };

  const fetchExamStatistics = async (examId) => {
    try {
      const url = `${API_URL}/api/admin/exams/${examId}/statistics`;
      const headers = {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      };
      const response = await fetch(url, headers);
      const result = await response.json();
      if (result.success) {
        setExamStats(result.statistics);
      }
    } catch (err) {
      handleError(err);
    }
  };

  const handleViewStats = (exam) => {
    setSelectedExam(exam);
    fetchExamStatistics(exam._id);
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    
    try {
      const url = `${API_URL}/api/admin/exams/${examId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });
      const result = await response.json();
      if (result.success) {
        handleSuccess('Exam deleted successfully');
        fetchExams();
        setSelectedExam(null);
        setExamStats(null);
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
    handleSuccess('Logged out successfully');
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="logo">
          <i className="ri-admin-fill"></i>
          <span>Admin Portal</span>
        </div>
        <div className="nav-right">
          <span className="user-name">{loggedInUser}</span>
          <button onClick={handleLogout} className="logout-btn">
            <i className="ri-logout-box-line"></i> Logout
          </button>
        </div>
      </nav>

      <div className="admin-content">
        <div className="sidebar">
          <button 
            className={activeTab === 'exams' ? 'active' : ''} 
            onClick={() => { setActiveTab('exams'); setSelectedExam(null); setExamStats(null); }}
          >
            <i className="ri-file-list-3-line"></i> My Exams
          </button>
          <button 
            className={activeTab === 'create' ? 'active' : ''} 
            onClick={() => setActiveTab('create')}
          >
            <i className="ri-add-circle-line"></i> Create Exam
          </button>
          <button 
            className={activeTab === 'students' ? 'active' : ''} 
            onClick={() => setActiveTab('students')}
          >
            <i className="ri-group-line"></i> Students
          </button>
        </div>

        <div className="main-content">
          {activeTab === 'exams' && !selectedExam && (
            <div className="exams-section">
              <h2>My Exams</h2>
              <div className="exams-grid">
                {exams.length === 0 ? (
                  <p className="no-data">No exams created yet. Click "Create Exam" to get started.</p>
                ) : (
                  exams.map(exam => (
                    <div key={exam._id} className="exam-card">
                      <h3>{exam.title}</h3>
                      <div className="exam-info">
                        <p><strong>Subject:</strong> {exam.subject}</p>
                        <p><strong>Duration:</strong> {exam.duration} minutes</p>
                        <p><strong>Total Marks:</strong> {exam.totalMarks}</p>
                        <p><strong>Questions:</strong> {exam.questions.length}</p>
                        <p><strong>Start Date:</strong> {formatDate(exam.startDate)}</p>
                        <p><strong>End Date:</strong> {formatDate(exam.endDate)}</p>
                      </div>
                      <div className="exam-actions">
                        <button onClick={() => handleViewStats(exam)} className="view-btn">
                          <i className="ri-bar-chart-box-line"></i> View Stats
                        </button>
                        <button onClick={() => handleDeleteExam(exam._id)} className="delete-btn">
                          <i className="ri-delete-bin-line"></i> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'exams' && selectedExam && examStats && (
            <div className="exam-stats-section">
              <button onClick={() => { setSelectedExam(null); setExamStats(null); }} className="back-btn">
                <i className="ri-arrow-left-line"></i> Back to Exams
              </button>
              <h2>{selectedExam.title} - Statistics</h2>
              
              <div className="stats-summary">
                <div className="stat-card">
                  <i className="ri-user-line"></i>
                  <div>
                    <h3>{examStats.totalStudents}</h3>
                    <p>Total Students</p>
                  </div>
                </div>
                <div className="stat-card">
                  <i className="ri-checkbox-circle-line"></i>
                  <div>
                    <h3>{examStats.completedCount}</h3>
                    <p>Completed</p>
                  </div>
                </div>
                <div className="stat-card">
                  <i className="ri-time-line"></i>
                  <div>
                    <h3>{examStats.inProgressCount}</h3>
                    <p>In Progress</p>
                  </div>
                </div>
              </div>

              <div className="submissions-table">
                <h3>Student Submissions</h3>
                {examStats.submissions.length === 0 ? (
                  <p className="no-data">No submissions yet</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Score</th>
                        <th>Start Time</th>
                        <th>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examStats.submissions.map(submission => (
                        <tr key={submission._id}>
                          <td>{submission.studentId?.name || 'N/A'}</td>
                          <td>{submission.studentId?.email || 'N/A'}</td>
                          <td>
                            <span className={`status-badge ${submission.status}`}>
                              {submission.status}
                            </span>
                          </td>
                          <td>
                            {submission.status === 'completed' 
                              ? `${submission.score}/${submission.totalMarks}` 
                              : '-'}
                          </td>
                          <td>{formatDate(submission.startTime)}</td>
                          <td>{submission.submittedAt ? formatDate(submission.submittedAt) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="students-section">
              <h2>Registered Students</h2>
              {students.length === 0 ? (
                <p className="no-data">No students registered yet</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Registered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{formatDate(student.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <CreateExamForm onExamCreated={() => { fetchExams(); setActiveTab('exams'); }} />
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

function CreateExamForm({ onExamCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    duration: '',
    startDate: '',
    endDate: '',
  });
  const [questions, setQuestions] = useState([]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (questions.length === 0) {
      handleError('Please add at least one question');
      return;
    }

    const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks), 0);

    try {
      const url = `${API_URL}/api/admin/exams`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          questions,
          totalMarks
        })
      });
      const result = await response.json();
      if (result.success) {
        handleSuccess('Exam created successfully');
        setTimeout(() => {
          onExamCreated();
        }, 1000);
      } else {
        handleError(result.message);
      }
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="create-exam-section">
      <h2>Create New Exam</h2>
      <form onSubmit={handleSubmit} className="exam-form">
        <div className="form-row">
          <div className="form-group">
            <label>Exam Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., Mathematics Final Exam"
            />
          </div>
          <div className="form-group">
            <label>Subject *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              placeholder="e.g., Mathematics"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration (minutes) *</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              required
              min="1"
              placeholder="e.g., 60"
            />
          </div>
          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>End Date *</label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="questions-section">
          <div className="questions-header">
            <h3>Questions</h3>
            <button type="button" onClick={addQuestion} className="add-question-btn">
              <i className="ri-add-line"></i> Add Question
            </button>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="question-card">
              <div className="question-header">
                <h4>Question {qIndex + 1}</h4>
                <button type="button" onClick={() => removeQuestion(qIndex)} className="remove-btn">
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  required
                  placeholder="Enter your question here"
                  rows="3"
                />
              </div>

              <div className="options-grid">
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="option-group">
                    <label>Option {oIndex + 1} *</label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      required
                      placeholder={`Option ${oIndex + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Correct Answer *</label>
                  <select
                    value={q.correctAnswer}
                    onChange={(e) => updateQuestion(qIndex, 'correctAnswer', Number(e.target.value))}
                    required
                  >
                    <option value={0}>Option 1</option>
                    <option value={1}>Option 2</option>
                    <option value={2}>Option 3</option>
                    <option value={3}>Option 4</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Marks *</label>
                  <input
                    type="number"
                    value={q.marks}
                    onChange={(e) => updateQuestion(qIndex, 'marks', Number(e.target.value))}
                    required
                    min="1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="submit-btn">
          <i className="ri-check-line"></i> Create Exam
        </button>
      </form>
    </div>
  );
}

export default AdminDashboard;
