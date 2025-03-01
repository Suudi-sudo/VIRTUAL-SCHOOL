"use client";
import React, { useState, useEffect } from "react";

function MainComponent() {
  const [resources, setResources] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    class_id: "",
    description: "",
    permissions: "private",
    file: null,
  });

  // Fetch resources on component mount
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/resources", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch resources");

      const data = await response.json();
      setResources(data.resources);
    } catch (err) {
      setError(err.message);
    }
  };

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
      setSuccess(null);

      const token = localStorage.getItem("token");
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
      setSuccess("Resource uploaded successfully!");
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Upload Resource
        </button>
      </div>

      {/* Modal for Uploading Resources */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className=" p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload Resource</h2>
            <input
              type="text-black"
              placeholder="Class ID"
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            />
            <select
              value={formData.permissions}
              onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <div key={resource.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-black font-bold">{resource.description}</h3>
            <p>Class ID: {resource.class_id}</p>
            <p>Permissions: {resource.permissions}</p>
            <a
              href={resource.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View File
            </a>
          </div>
        ))}
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded">
          {success}
        </div>
      )}
    </div>
  );
}

export default MainComponent;