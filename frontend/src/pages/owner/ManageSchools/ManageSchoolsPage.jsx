import React, { useState, useEffect, useContext } from "react";
import { Table, Button, Modal, Form, Container, Spinner, Alert } from "react-bootstrap";
import { SchoolContext } from "../../context/SchoolContext";
import "./ManageSchools.css"; // Import custom styles

const ManageSchools = () => {
  const { schools, fetchSchools } = useContext(SchoolContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [schoolData, setSchoolData] = useState({ name: "", location: "" });

  useEffect(() => {
    fetchSchools()
      .then(() => setLoading(false))
      .catch((err) => {
        setError("Failed to fetch schools");
        setLoading(false);
      });
  }, []);

  const handleShowModal = (school = null) => {
    setEditingSchool(school);
    setSchoolData(school ? { name: school.name, location: school.location } : { name: "", location: "" });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchool(null);
  };

  const handleInputChange = (e) => {
    setSchoolData({ ...schoolData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editingSchool ? `/api/schools/update/${editingSchool.id}` : "/api/schools/create";
    const method = editingSchool ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schoolData),
      });

      if (!response.ok) throw new Error("Failed to save school");
      fetchSchools();
      handleCloseModal();
    } catch (error) {
      setError("Error saving school");
    }
  };

  const handleDelete = async (schoolId) => {
    if (!window.confirm("Are you sure you want to delete this school?")) return;

    try {
      const response = await fetch(`/api/schools/delete/${schoolId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete school");
      fetchSchools();
    } catch (error) {
      setError("Error deleting school");
    }
  };

  return (
    <Container className="manage-schools-container">
      <h2 className="text-center mb-4">Manage Schools</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button onClick={() => handleShowModal()} className="add-school-btn">
          + Add School
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading schools...</p>
        </div>
      ) : (
        <Table striped bordered hover className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>School Name</th>
              <th>Location</th>
              <th>Students</th>
              <th>Teachers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school, index) => (
              <tr key={school.id}>
                <td>{index + 1}</td>
                <td>{school.name}</td>
                <td>{school.location}</td>
                <td>{school.studentCount || 0}</td>
                <td>{school.teacherCount || 0}</td>
                <td>
                  <Button variant="outline-warning" size="sm" onClick={() => handleShowModal(school)}>
                    ✏️ Edit
                  </Button>{" "}
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(school.id)}>
                    🗑 Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add/Edit School Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingSchool ? "Edit School" : "Add School"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>School Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={schoolData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={schoolData.location}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              {editingSchool ? "Update School" : "Add School"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManageSchools;
