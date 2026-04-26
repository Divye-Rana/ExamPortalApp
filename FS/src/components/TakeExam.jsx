import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { handleSuccess, handleError } from "../utils";
import { ToastContainer } from 'react-toastify';
import './takeExam.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function TakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);
  const fetchedRef = useRef(false); // Prevent duplicate API calls

  useEffect(() => {
    // Prevent double fetch in React StrictMode
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    
    fetchExamAndStart();
    
    // Add beforeunload event to save progress
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [examId]);

  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitting) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [timeRemaining, isSubmitting]);

  useEffect(() => {
    // Auto-save every 30 seconds
    if (submission && !isSubmitting) {
      autoSaveRef.current = setInterval(() => {
        saveProgress();
      }, 30000);

      return () => clearInterval(autoSaveRef.current);
    }
  }, [submission, answers, timeRemaining, isSubmitting]);

  const handleBeforeUnload = (e) => {
    if (submission && !isSubmitting) {
      saveProgress();
      e.preventDefault();
      e.returnValue = '';
    }
  };

  const fetchExamAndStart = async () => {
    try {
      // Fetch exam details
      const examResponse = await fetch(`${API_URL}/api/exams/${examId}`, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });
      const examResult = await examResponse.json();
      
      if (examResult.success) {
        setExam(examResult.exam);

        // Start or resume exam
        const startResponse = await fetch(`${API_URL}/api/exams/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
          },
          body: JSON.stringify({ examId })
        });
        const startResult = await startResponse.json();

        if (startResult.success) {
          setSubmission(startResult.submission);
          setTimeRemaining(startResult.submission.timeRemaining);

          // Load existing answers if resuming
          if (startResult.submission.answers && startResult.submission.answers.length > 0) {
            const existingAnswers = {};
            startResult.submission.answers.forEach(ans => {
              existingAnswers[ans.questionId] = Number(ans.selectedAnswer);
            });
            setAnswers(existingAnswers);
          }
        } else if (startResult.alreadyCompleted) {
          handleError('You have already completed this exam');
          setTimeout(() => {
            navigate('/studentDashBoard');
          }, 2000);
          return;
        }
      }
      setLoading(false);
    } catch (err) {
      handleError('Failed to load exam');
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    if (!submission || isSubmitting) return;

    try {
      const answersArray = Object.keys(answers).map(questionId => ({
        questionId,
        selectedAnswer: answers[questionId]
      }));

      await fetch(`${API_URL}/api/exams/save-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({
          submissionId: submission._id,
          answers: answersArray,
          timeRemaining
        })
      });
    } catch (err) {
      console.error('Failed to save progress', err);
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleAutoSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    handleError('Time is up! Submitting your exam...');
    await submitExam();
  };

  const handleManualSubmit = async () => {
    if (isSubmitting) return;

    const unansweredCount = exam.questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    await submitExam();
  };

  const submitExam = async () => {
    try {
      const answersArray = Object.keys(answers).map(questionId => ({
        questionId,
        selectedAnswer: answers[questionId]
      }));

      const response = await fetch(`${API_URL}/api/exams/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({
          submissionId: submission._id,
          answers: answersArray
        })
      });

      const result = await response.json();
      if (result.success) {
        handleSuccess('Exam submitted successfully!');
        setTimeout(() => {
          navigate('/studentDashBoard');
        }, 2000);
      }
    } catch (err) {
      handleError('Failed to submit exam');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => Object.keys(answers).length;

  if (loading) {
    return (
      <div className="exam-loading">
        <div className="loader"></div>
        <p>Loading exam...</p>
      </div>
    );
  }

  if (!exam || !submission) {
    return (
      <div className="exam-error">
        <i className="ri-error-warning-line"></i>
        <p>Failed to load exam</p>
        <button onClick={() => navigate('/studentDashBoard')}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="take-exam">
      <div className="exam-header-bar">
        <div className="exam-title-section">
          <h1>{exam.title}</h1>
          <p>{exam.subject}</p>
        </div>
        <div className="exam-stats">
          <div className="stat-item">
            <i className="ri-time-line"></i>
            <span className={timeRemaining < 300 ? 'time-warning' : ''}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          <div className="stat-item">
            <i className="ri-checkbox-circle-line"></i>
            <span>{getAnsweredCount()} / {exam.questions.length}</span>
          </div>
        </div>
      </div>

      <div className="exam-content">
        <div className="questions-container">
          {exam.questions.map((question, qIndex) => (
            <div key={question._id} className={`question-box ${answers[question._id] !== undefined ? 'answered' : ''}`}>
              <div className="question-header">
                <span className="question-number">Question {qIndex + 1}</span>
                <span className="question-marks">{question.marks} {question.marks === 1 ? 'mark' : 'marks'}</span>
              </div>
              <p className="question-text">{question.question}</p>
              <div className="options-container">
                {question.options.map((option, oIndex) => (
                  <label
                    key={oIndex}
                    className={`option-label ${answers[question._id] === oIndex ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question-${question._id}`}
                      checked={answers[question._id] === oIndex}
                      onChange={() => handleAnswerSelect(question._id, oIndex)}
                      disabled={isSubmitting}
                    />
                    <span className="option-text">
                      <span className="option-letter">{String.fromCharCode(65 + oIndex)}.</span>
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="exam-sidebar">
          <div className="sidebar-card">
            <h3>Progress</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(getAnsweredCount() / exam.questions.length) * 100}%` }}
              ></div>
            </div>
            <p>{getAnsweredCount()} of {exam.questions.length} answered</p>
          </div>

          <div className="sidebar-card">
            <h3>Question Navigator</h3>
            <div className="question-grid">
              {exam.questions.map((question, index) => (
                <button
                  key={question._id}
                  className={`question-nav-btn ${answers[question._id] !== undefined ? 'answered' : 'unanswered'}`}
                  onClick={() => {
                    document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleManualSubmit} 
            className="submit-exam-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="btn-loader"></div> Submitting...
              </>
            ) : (
              <>
                <i className="ri-send-plane-fill"></i> Submit Exam
              </>
            )}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default TakeExam;
