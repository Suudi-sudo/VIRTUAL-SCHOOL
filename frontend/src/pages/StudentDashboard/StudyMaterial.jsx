import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

// SaveToDriveButton component
const SaveToDriveButton = ({ src, filename, sitename }) => {
  useEffect(() => {
    // If the Google API is loaded, render the Save-to-Drive button
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
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    ></div>
  );
};

const StudyMaterial = () => {
  const [materials, setMaterials] = useState([]);

  // Fetch study materials from your backend API
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/study-materials');
        setMaterials(response.data);
      } catch (error) {
        console.error('Error fetching study materials:', error);
      }
    };

    fetchMaterials();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Study Materials</h2>
      {materials.length === 0 ? (
        <p>No study materials available.</p>
      ) : (
        materials.map((material) => (
          <div key={material.id} className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{material.title}</h5>
              <p className="card-text">{material.description}</p>
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mr-2"
              >
                View Material
              </a>
              {/* Save to Google Drive button */}
              <SaveToDriveButton
                src={material.fileUrl}
                filename={`${material.title}.pdf`}
                sitename="Virtual School"
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default StudyMaterial;
