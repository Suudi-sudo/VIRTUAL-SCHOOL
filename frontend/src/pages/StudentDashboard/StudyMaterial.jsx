import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

// SaveToDriveButton component
const SaveToDriveButton = ({ src, filename, sitename }) => {
  useEffect(() => {
    if (window.gapi && window.gapi.savetodrive) {
      window.gapi.savetodrive.go();
    }
  }, [src, filename, sitename]);

  return (
    <div
      className="g-savetodrive"
      data-src={src}
      data-filename={filename}
      data-sitename={sitename}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    ></div>
  );
};

const StudyMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch study materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/study-materials");
        setMaterials(response.data);
      } catch (error) {
        console.error("Error fetching study materials:", error);
        setError("Unable to load study materials. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  return (
    <div className="container mt-4">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Study Materials</h3>
        </div>
        <div className="card-body">
          {loading && <div className="alert alert-info">Loading study materials...</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {materials.length === 0 && !loading ? (
            <div className="text-center py-5">
              <i className="fas fa-book-open text-secondary display-4 mb-3"></i>
              <p className="text-muted">No study materials available.</p>
            </div>
          ) : (
            <div className="row">
              {materials.map((material) => (
                <div key={material.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <h5 className="card-title text-dark">{material.title}</h5>
                      <p className="card-text text-muted">{material.description}</p>
                      <div className="d-flex align-items-center">
                        <a
                          href={material.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary me-2"
                        >
                          <i className="fas fa-external-link-alt me-1"></i>
                          View Material
                        </a>
                        <SaveToDriveButton
                          src={material.fileUrl}
                          filename={`${material.title}.pdf`}
                          sitename="Virtual School"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyMaterial;
