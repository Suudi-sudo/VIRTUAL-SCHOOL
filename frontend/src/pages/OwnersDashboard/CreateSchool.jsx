import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const BASE_URL = "https://virtual-school-2.onrender.com";

const CreateSchool = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BASE_URL}/schools`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          address,
          phone,
          email: schoolEmail,
          description,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.msg || "Failed to create school");
      }

      navigate("/schools");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className="flex-grow-1 p-4" style={{ backgroundColor: "#343a40", color: "#fff" }}>
        <h2 className="mb-4">Create New School</h2>

        {error && <p className="text-danger">{error}</p>}

        <div className="card border-0 shadow bg-dark text-white" style={{ maxWidth: "600px" }}>
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">School Details</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">School Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="My Awesome School"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="123 Main St, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="(555) 555-1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">School Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="school@example.com"
                  value={schoolEmail}
                  onChange={(e) => setSchoolEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Brief description about the school..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-success w-100" disabled={loading}>
                {loading ? "Creating..." : "Create School"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSchool;
