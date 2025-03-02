"use client";
import React, { useState, useEffect } from "react";

function MainComponent() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch("http://localhost:5000/resources", {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setResources(data.resources);
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError("Unable to load resources. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.description
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === "all" || resource.class_id === selectedClass;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = [
    ...new Set(resources.map((resource) => resource.class_id)),
  ];

  const getFileIcon = (fileUrl = "") => {
    if (fileUrl.endsWith(".pdf")) return "fa-file-pdf";
    if (fileUrl.match(/\.(jpg|jpeg|png)$/i)) return "fa-image";
    if (fileUrl.endsWith(".docx")) return "fa-file-word";
    return "fa-file";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl text-white font-bold mb-2">Study Resources</h1>
          <p className="text-gray-400 font-bold mb-2">
            Access all your course materials in one place
          </p>
        </div>

        {/* Search Bar & Filters */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white"
            />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="md:w-48 px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white"
            >
              <option value="all">All Classes</option>
              {uniqueClasses.map((classId) => (
                <option key={classId} value={classId}>
                  Class {classId}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div
            className={`grid ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            } gap-6`}
          >
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <i
                      className={`fas ${getFileIcon(
                        resource.file_url
                      )} text-3xl text-white mr-4`}
                    ></i>
                    <div>
                      <h3 className="text-4xl text-white font-bold mb-2">
                        {resource.description || "Untitled Resource"}
                      </h3>
                      <p className="text-sm text-gray-400 font-semibold">
                        Class {resource.class_id}
                      </p>
                    </div>
                  </div>
                  {/* ✅ FIXED: Open file properly without React Router error */}
                  <a
                    href={resource.file_url.startsWith("http") ? resource.file_url : `http://127.0.0.1:5000${resource.file_url}`}
                    
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-black text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                       View Resource
                    <i className="fas fa-external-link-alt ml-2"></i>
                   </a>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Resources Found */}
        {!loading && filteredResources.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-search text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-400">
              No resources found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;
