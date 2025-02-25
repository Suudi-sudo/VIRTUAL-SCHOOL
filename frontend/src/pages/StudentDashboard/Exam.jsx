import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ExamPage = () => {
  const [exam, setExam] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({});
  const { examId } = useParams();

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`/api/exams/${examId}`);
        setExam(response.data);
        setTimeLeft(response.data.duration * 60); // Convert duration to seconds
      } catch (error) {
        console.error('Error fetching exam:', error);
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

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const alertTeacher = async () => {
    try {
      await axios.post('/api/alert-teacher', { examId, studentId: 'current-student-id' });
    } catch (error) {
      console.error('Error alerting teacher:', error);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  const submitExam = async () => {
    try {
      await axios.post(`/api/exams/${examId}/submit`, { answers });
      // Handle successful submission (e.g., redirect to results page)
    } catch (error) {
      console.error('Error submitting exam:', error);
    }
  };

  if (!exam) return <div>Loading exam...</div>;

  return (
    <div>
      <h1>{exam.title}</h1>
      <div>Time left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}</div>
      {exam.questions.map((question) => (
        <div key={question.id}>
          <p>{question.text}</p>
          {question.options.map((option) => (
            <label key={option.id}>
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                onChange={() => handleAnswerChange(question.id, option.id)}
                checked={answers[question.id] === option.id}
              />
              {option.text}
            </label>
          ))}
        </div>
      ))}
      <button onClick={submitExam}>Submit Exam</button>
    </div>
  );
};

export default ExamPage;