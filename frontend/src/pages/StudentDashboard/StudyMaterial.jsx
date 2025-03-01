import React from 'react';
import { Container, ListGroup, Button } from 'react-bootstrap';

const StudyMaterial = () => {
  return (
    <Container className="mt-4">
      <h3>Study Material</h3>
      <ListGroup>
        <ListGroup.Item>
          <span>Math Formulas</span>
          <Button variant="link" className="float-right">Download</Button>
        </ListGroup.Item>
        <ListGroup.Item>
          <span>Physics Notes</span>
          <Button variant="link" className="float-right">Download</Button>
        </ListGroup.Item>
      </ListGroup>
    </Container>
  );
};

export default StudyMaterial;
