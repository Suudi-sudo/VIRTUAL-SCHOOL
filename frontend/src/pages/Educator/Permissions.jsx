import React, { useState, useEffect } from "react";
import { Card, Button, Form, Table, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

const API_URL = "https://virtual-school-2.onrender.com/resources"; // Make sure this is correct!

const Permissions = () => {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch Resources (Without Context)
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setResources(res.data.resources);
      } catch (error) {
        console.error("Error fetching resources:", error);
        setMessage("❌ Failed to load resources.");
      }
      setLoading(false);
    };
    fetchResources();
  }, []);

  // ✅ Select Resource & Load Existing Permissions
  const handleResourceSelect = (resource) => {
    setSelectedResource(resource);
    setPermissions(resource.permissions || {}); // Ensure it's an object
  };

  // ✅ Toggle Permission Checkbox
  const handlePermissionChange = (studentId, isChecked) => {
    setPermissions((prev) => ({
      ...prev,
      [studentId]: isChecked,
    }));
  };

  // ✅ Save Updated Permissions to Backend
  const handleSavePermissions = async () => {
    if (!selectedResource) return;
    setUpdating(true);
    setMessage("");

    try {
      await axios.put(
        `${API_URL}/${selectedResource.id}`, // Ensure correct API pattern
        { permissions },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessage("✅ Permissions updated successfully!");
    } catch (error) {
      console.error("Error updating permissions:", error);
      setMessage("❌ Failed to update permissions.");
    }
    setUpdating(false);
  };

  // ✅ Delete Resource
  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this resource?")) return;
    setMessage("");

    try {
      await axios.delete(`${API_URL}/${resourceId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Remove deleted resource from UI
      setResources(resources.filter((res) => res.id !== resourceId));
      setSelectedResource(null);
      setMessage("🗑️ Resource deleted successfully!");
    } catch (error) {
      console.error("Error deleting resource:", error);
      setMessage("❌ Failed to delete resource.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">🔒 Manage Resource Permissions</h2>

      {/* ✅ Success/Error Message */}
      {message && <Alert variant={message.includes("✅") || message.includes("🗑️") ? "success" : "danger"}>{message}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="row">
          {/* ✅ Resource List */}
          <div className="col-md-5">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>📂 Resources</Card.Title>
                <Table responsive bordered hover>
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Resource</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((resource, index) => (
                      <tr key={resource.id}>
                        <td>{index + 1}</td>
                        <td>{resource.description || "Unnamed Resource"}</td>
                        <td className="d-flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleResourceSelect(resource)}
                          >
                            Manage
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            Delete 🗑️
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>

          {/* ✅ Permissions Table */}
          <div className="col-md-7">
            {selectedResource && (
              <Card className="shadow-lg">
                <Card.Body>
                  <Card.Title>🔑 Set Permissions for: {selectedResource.description}</Card.Title>
                  <Table responsive bordered hover className="mt-3">
                    <thead className="table-light">
                      <tr>
                        <th>Student ID</th>
                        <th>Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(permissions).map((studentId) => (
                        <tr key={studentId}>
                          <td>{studentId}</td>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={permissions[studentId]}
                              onChange={(e) =>
                                handlePermissionChange(studentId, e.target.checked)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Button
                    variant="success"
                    onClick={handleSavePermissions}
                    disabled={updating}
                    className="mt-3"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                </Card.Body>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;
