import React, { useState, useEffect, useContext } from "react";
import { Table, Button, Modal, Form, Container } from "react-bootstrap";
import { SchoolContext } from "../../context/SchoolContext"; // Ensure this context exists

const ManageSchools = () => {
  const { schools, fetchSchools } = useContext(SchoolContext);
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [schoolData, setSchoolData] = useState({ name: "", location: "" });

  useEffect(() => {
    fetchSchools(); // Fetch schools when the page loads
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
      fetchSchools(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (schoolId) => {
    if (!window.confirm("Are you sure you want to delete this school?")) return;

    try {
      const response = await fetch(`/api/schools/delete/${schoolId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete school");
      fetchSchools(); // Refresh the list
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-3">Manage Schools</h2>
      <Button onClick={() => handleShowModal()} className="mb-3">+ Add School</Button>

      <Table striped bordered hover>
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
                <Button variant="warning" size="sm" onClick={() => handleShowModal(school)}>Edit</Button>
                {" "}
                <Button variant="danger" size="sm" onClick={() => handleDelete(school.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

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

            <Button variant="primary" type="submit">
              {editingSchool ? "Update School" : "Add School"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManageSchools;
