import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Table, Spinner } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newExam, setNewExam] = useState({
    class_id: "",
    exam_title: "",
    start_time: new Date(),
    duration_minutes: "",
    status: "Scheduled",
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/exams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams(response.data.exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to load exams.");
    }
    setLoading(false);
  };

  const handleCreateExam = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/api/exams", newExam, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Exam Created Successfully!");
      setShowModal(false);
      fetchExams();
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Failed to create exam.");
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/exams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Exam Deleted Successfully!");
      fetchExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Failed to delete exam.");
    }
  };

  return (
    <div className="container mx-auto p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Manage Exams</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Add Exam
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table striped bordered hover>
          <thead className="bg-gray-200">
            <tr>
              <th>#</th>
              <th>Exam Title</th>
              <th>Class ID</th>
              <th>Start Time</th>
              <th>Duration (mins)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.length > 0 ? (
              exams.map((exam, index) => (
                <tr key={exam.id}>
                  <td>{index + 1}</td>
                  <td>{exam.exam_title}</td>
                  <td>{exam.class_id}</td>
                  <td>{new Date(exam.start_time).toLocaleString()}</td>
                  <td>{exam.duration_minutes}</td>
                  <td>{exam.status}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteExam(exam.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No exams available.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Create Exam Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Exam</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Class ID</Form.Label>
              <Form.Control
                type="text"
                value={newExam.class_id}
                onChange={(e) =>
                  setNewExam({ ...newExam, class_id: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Exam Title</Form.Label>
              <Form.Control
                type="text"
                value={newExam.exam_title}
                onChange={(e) =>
                  setNewExam({ ...newExam, exam_title: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Start Time</Form.Label>
              <DatePicker
                selected={newExam.start_time}
                onChange={(date) => setNewExam({ ...newExam, start_time: date })}
                showTimeSelect
                dateFormat="Pp"
                className="form-control"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Duration (minutes)</Form.Label>
              <Form.Control
                type="number"
                value={newExam.duration_minutes}
                onChange={(e) =>
                  setNewExam({ ...newExam, duration_minutes: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                value={newExam.status}
                onChange={(e) =>
                  setNewExam({ ...newExam, status: e.target.value })
                }
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleCreateExam}>
            Save Exam
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Exams;
