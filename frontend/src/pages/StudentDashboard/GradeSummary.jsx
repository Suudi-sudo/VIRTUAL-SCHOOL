import React from 'react';
import { Container, Table } from 'react-bootstrap';

const GradeSummary = () => {
  return (
    <Container className="mt-4">
      <h3>Grade Summary</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Course</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Mathematics 101</td>
            <td>A</td>
          </tr>
          <tr>
            <td>Physics 201</td>
            <td>B+</td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
};

export default GradeSummary;
