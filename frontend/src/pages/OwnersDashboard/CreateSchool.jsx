import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const CreateSchool = () => {
  const navigate = useNavigate();

  const [schoolName, setSchoolName] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [logo, setLogo] = useState(null);

  const handleCreate = (e) => {
    e.preventDefault();
    // Here you can integrate with an API call to create the school
    console.log("Creating school:", {
      schoolName,
      description,
      contact,
      logo,
    });
    // After creation, redirect or show success message
    navigate("/schools"); // go back to the Manage Schools page
  };

  return (
    <div>
      <h2>Create New School</h2>
      <form onSubmit={handleCreate}>
        <div className="mb-3">
          <label className="form-label">School Name</label>
          <input
            type="text"
            className="form-control"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description/Bio</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Contact Details</label>
          <input
            type="text"
            className="form-control"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Upload School Logo</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setLogo(e.target.files[0])}
          />
        </div>
        {/* Additional advanced settings if needed */}
        <button type="submit" className="btn btn-primary me-2">
          Create School
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/schools")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateSchool;
