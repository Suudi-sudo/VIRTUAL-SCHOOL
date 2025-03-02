"use client";
import React, { useState, useEffect } from "react";

function MainComponent() {
  const [resources, setResources] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editResource, setEditResource] = useState(null);
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

   // 🗑️ DELETE RESOURCE FUNCTION
   const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/resources/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete resource");

      setResources((prev) => prev.filter((resource) => resource.id !== id));
      setSuccess("Resource deleted successfully!");
    } catch (err) {
      setError(err.message);
    }
  };
   // ✏️ EDIT RESOURCE FUNCTION
   const handleEdit = (resource) => {
    setEditResource(resource);
    setFormData({
      class_id: resource.class_id,
      description: resource.description,
      permissions: resource.permissions,
      file: null, // File won't be updated
    });
    setIsModalOpen(true);
  };
   
  // ✅ UPDATE RESOURCE FUNCTION
  const handleUpdate = async () => {
    if (!formData.class_id || !formData.permissions) {
      setError("All fields are required.");
      return;
    }

    const data = {
      class_id: formData.class_id,
      description: formData.description,
      permissions: formData.permissions,
    };

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/resources/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.msg || "Failed to update");

      setResources((prev) =>
        prev.map((resource) => (resource.id === editResource.id ? { ...resource, ...data } : resource))
      );
      setIsModalOpen(false);
      setEditResource(null);
      setSuccess("Resource updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 text-white mb-4 md:mb-0">Resources</h1>
        
      </div>

      {/* Modal for Uploading Resources */}
   
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className=" p-6 rounded-lg shadow-lg w-full max-w-md">
            
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
                onClick={handleFileUpload}
                disabled={loading}
                className="bg-blue-500 text-white  rounded hover:bg-blue-50"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
     

      {/* Display Resources */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        {resources.map((resource) => (
          <div key={resource.id} className=" p-4 rounded-lg shadow">
            <h3 className="text-white font-bold">{resource.description}</h3>
            <p>Class ID: {resource.class_id}</p>
            <p>Permissions: {resource.permissions}</p>
            <a
                    href={resource.file_url.startsWith("http") ? resource.file_url : `http://127.0.0.1:5000${resource.file_url}`}
                    
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-black text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                       view the note
                    <i className="fas fa-external-link-alt ml-2"></i>
                   </a>
            <div className="">
              {/* Small Edit Button */}
              <button
                onClick={() => handleEdit(resource)}
                className=""
              >
                Edit
              </button>

              {/* Small Delete Button */}
              <button
                onClick={() => handleDelete(resource.id)}
                className=""
              >
                Delete
              </button>
            </div>
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