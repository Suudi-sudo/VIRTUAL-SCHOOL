import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

const Chat = () => {
  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <h3>Class Chat</h3>
          <div className="chat-box" style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll' }}>
            {/* Display chat messages here */}
          </div>
          <Form className="mt-3">
            <Form.Control as="textarea" rows={2} placeholder="Type a message..." />
            <Button variant="primary" className="mt-2">Send</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;
