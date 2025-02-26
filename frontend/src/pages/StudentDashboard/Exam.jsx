import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap

const ExamPage = () => {
  const [exam, setExam] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { examId } = useParams();

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`/api/exams/${examId}`);
        setExam(response.data);
        setTimeLeft(response.data.duration * 60); // Convert duration to seconds
      } catch (error) {
        console.error("Error fetching exam:", error);
      }
    };

    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (!exam) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        alertTeacher();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const alertTeacher = async () => {
    try {
      await axios.post("/api/alert-teacher", { examId, studentId: "current-student-id" });
    } catch (error) {
      console.error("Error alerting teacher:", error);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  const submitExam = async () => {
    setSubmitting(true);
    try {
      await axios.post(`/api/exams/${examId}/submit`, { answers });
      alert("Exam submitted successfully!");
    } catch (error) {
      console.error("Error submitting exam:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!exam) return <div className="text-center mt-5">Loading exam...</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="text-primary">{exam.title}</h1>
          <div className={`badge ${timeLeft <= 60 ? "bg-danger" : timeLeft <= 300 ? "bg-warning" : "bg-primary"} fs-5`}>
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        </div>

        <div className="progress mb-4">
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: `${(Object.keys(answers).length / exam.questions.length) * 100}%` }}
          ></div>
        </div>

        {exam.questions.map((question, index) => (
          <div key={question.id} className="mb-4 p-3 border rounded bg-light">
            <h5>
              {index + 1}. {question.text}
            </h5>
            <div className="form-check">
              {question.options.map((option) => (
                <div key={option.id} className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name={`question-${question.id}`}
                    value={option.id}
                    onChange={() => handleAnswerChange(question.id, option.id)}
                    checked={answers[question.id] === option.id}
                  />
                  <label className="form-check-label">{option.text}</label>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button className="btn btn-primary w-100" onClick={submitExam} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Exam"}
        </button>
      </div>
    </div>
  );
};

export default ExamPage;
