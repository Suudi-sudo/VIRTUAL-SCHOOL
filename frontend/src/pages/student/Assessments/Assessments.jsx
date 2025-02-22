import React, { useState, useEffect } from 'react';
import { Container, Card, Button, ListGroup, ProgressBar, Alert, Form } from 'react-bootstrap';
import Navbar from '../../../components/Navbar';
import './Assessments.css';

const Assessments = () => {
  const [questions, setQuestions] = useState([
    { id: 1, text: "What is React?", answer: "" },
    { id: 2, text: "Explain the Virtual DOM.", answer: "" },
    { id: 3, text: "What is a useState hook?", answer: "" },
  ]);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [studentLeftPage, setStudentLeftPage] = useState(false);

  useEffect(() => {
    if (isExamStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isExamStarted, timeLeft]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isExamStarted) {
        setStudentLeftPage(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isExamStarted]);

  const startExam = () => {
    setIsExamStarted(true);
    setTimeLeft(900);
    setStudentLeftPage(false);
  };

  const handleAnswerChange = (id, answer) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, answer } : q));
  };

  return (
    <Container className="mt-4">
      <Navbar />
      <h2 className="text-center mb-4">📚 Online Exams</h2>

      <Card className="shadow p-4">
        <Card.Body>
          <h3 className="text-primary">Available Exams</h3>
          {!isExamStarted ? (
            <Button variant="success" onClick={startExam} className="mt-3">
              Start Exam
            </Button>
          ) : (
            <div>
              <h5 className="text-danger mt-3">Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}</h5>
              <ProgressBar now={(timeLeft / 900) * 100} variant={timeLeft < 60 ? 'danger' : 'info'} animated className="mt-2" />

              <ListGroup className="mt-3">
                {questions.map((q) => (
                  <ListGroup.Item key={q.id}>
                    <strong>{q.text}</strong>
                    <Form.Control
                      type="text"
                      placeholder="Your answer..."
                      value={q.answer}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="mt-2"
                    />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}
        </Card.Body>
      </Card>

      {studentLeftPage && (
        <Alert variant="danger" className="mt-3 text-center">
          ⚠️ Teacher has been notified that you left the page!
        </Alert>
      )}
    </Container>
  );
};

export default Assessments;
