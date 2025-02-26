
// React: resources.jsx
"use client";
import React, { useState } from "react";

function MainComponent() {
  const [resources, setResources] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    class_id: "",
    description: "",
    permissions: "private",
    file: null,
  });

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleFileUpload = async () => {
    if (!formData.file || !formData.class_id || !formData.permissions) {
      setError("All fields are required.");
      return;
    }

    const data = new FormData();
    data.append("file", formData.file);
    data.append("class_id", formData.class_id);
    data.append("description", formData.description);
    data.append("permissions", formData.permissions);

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch("http://localhost:5000/resources/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.msg || "Failed to upload");

      setResources((prev) => [...prev, result]);
      setIsModalOpen(false);
      setFormData({ class_id: "", description: "", permissions: "private", file: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Resources</h1>
      </div>
      <button onClick={() => setIsModalOpen(true)}>Upload Resource</button>
      {isModalOpen && (
        <div>
          <input
            type="text"
            placeholder="Class ID"
            value={formData.class_id}
            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <select
            value={formData.permissions}
            onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleFileUpload}>{loading ? "Uploading..." : "Upload"}</button>
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
}

export default MainComponent;