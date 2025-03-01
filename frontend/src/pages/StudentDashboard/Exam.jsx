import React from 'react';
import { Container, Button, Card } from 'react-bootstrap';

const Exam = () => {
  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>Physics Lab Exam</Card.Header>
        <Card.Body>
          <p>Time remaining: 1:00:00</p>
          {/* Display exam questions here */}
          <Button variant="primary">Start Exam</Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Exam;
