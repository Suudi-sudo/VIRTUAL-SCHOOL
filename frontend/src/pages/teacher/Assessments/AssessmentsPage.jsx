import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, ListGroup, ProgressBar, Alert } from 'react-bootstrap';
import Navbar from '../../../components/Navbar';
import './Assessments.css'; // Custom CSS file

const AssessmentsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isStudentTakingTest, setIsStudentTakingTest] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isTeacher, setIsTeacher] = useState(true); // Change this based on user role
  const [studentLeftPage, setStudentLeftPage] = useState(false);

  useEffect(() => {
    if (isStudentTakingTest && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isStudentTakingTest, timeLeft]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isStudentTakingTest) {
        setStudentLeftPage(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isStudentTakingTest]);

  const addQuestion = () => {
    if (newQuestion.trim() !== '') {
      setQuestions([...questions, newQuestion]);
      setNewQuestion('');
    }
  };

  const startAssessment = () => {
    setIsStudentTakingTest(true);
    setTimeLeft(600);
    setStudentLeftPage(false);
  };

  return (
    <Container className="mt-4">
      <Navbar />
      <h2 className="text-center mb-4">Assessments</h2>

      {isTeacher ? (
        <Card className="shadow p-4">
          <Card.Body>
            <h3 className="mb-3 text-primary">Create Assessment</h3>
            <Form className="d-flex">
              <Form.Control
                type="text"
                placeholder="Enter a question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="me-2"
              />
              <Button variant="success" onClick={addQuestion}>
                Add Question
              </Button>
            </Form>

            {questions.length > 0 && (
              <>
                <h4 className="mt-4 text-secondary">Questions List</h4>
                <ListGroup>
                  {questions.map((q, index) => (
                    <ListGroup.Item key={index}>{q}</ListGroup.Item>
                  ))}
                </ListGroup>
              </>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow p-4">
          <Card.Body>
            <h3 className="text-primary">Available Assessments</h3>
            {questions.length > 0 ? (
              <div>
                {!isStudentTakingTest ? (
                  <Button variant="primary" onClick={startAssessment} className="mt-3">
                    Start Assessment
                  </Button>
                ) : (
                  <div>
                    <h5 className="text-danger mt-3">Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}</h5>
                    <ProgressBar
                      now={(timeLeft / 600) * 100}
                      variant={timeLeft < 60 ? 'danger' : 'info'}
                      animated
                      className="mt-2"
                    />

                    <ListGroup className="mt-3">
                      {questions.map((q, index) => (
                        <ListGroup.Item key={index}>{q}</ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted">No assessments available</p>
            )}
          </Card.Body>
        </Card>
      )}

      {studentLeftPage && (
        <Alert variant="danger" className="mt-3 text-center">
          ⚠️ Teacher has been notified that you left the page!
        </Alert>
      )}
    </Container>
  );
};

export default AssessmentsPage;
