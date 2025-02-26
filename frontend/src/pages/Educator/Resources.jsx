import React, { useState, useEffect } from "react";
import axios from "axios";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState("");
  const [permissions, setPermissions] = useState("public"); // Default permission
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch resources from backend
  useEffect(() => {
    fetchResources();
  }, [currentPage]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/educator/resources?page=${currentPage}`);
      setResources(res.data.resources);
      setTotalPages(res.data.pages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching resources:", error);
      setLoading(false);
    }
  };

  // Upload new resource
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !classId) {
      alert("Please select a file and enter class ID.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("class_id", classId);
    formData.append("permissions", permissions);

    try {
      setLoading(true);
      await axios.post("/api/educator/resources/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Resource uploaded successfully!");
      setShowUploadModal(false);
      fetchResources();
    } catch (error) {
      console.error("Error uploading resource:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Page Title & Upload Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📚 Educator Resources</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Upload Resource
        </button>
      </div>

      {/* Resources List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">📁 File</th>
              <th className="border p-3 text-left">📖 Description</th>
              <th className="border p-3 text-left">🎓 Class ID</th>
              <th className="border p-3 text-left">🔐 Permissions</th>
              <th className="border p-3 text-center">🔗 View</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-4 text-center">Loading...</td>
              </tr>
            ) : resources.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">No resources uploaded yet.</td>
              </tr>
            ) : (
              resources.map((res) => (
                <tr key={res.id} className="border-b">
                  <td className="p-3">{res.file_url.split('/').pop()}</td>
                  <td className="p-3">{res.description || "No description"}</td>
                  <td className="p-3">{res.class_id}</td>
                  <td className="p-3">{res.permissions}</td>
                  <td className="p-3 text-center">
                    <a
                      href={res.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Open
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`mx-1 px-3 py-1 border rounded-md ${
              currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Upload Resource Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Upload Resource</h2>
            <form onSubmit={handleUpload} className="space-y-3">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full p-2 border rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Class ID"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
              <select
                value={permissions}
                onChange={(e) => setPermissions(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="public">Public</option>
                <option value="class-only">Class Only</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
