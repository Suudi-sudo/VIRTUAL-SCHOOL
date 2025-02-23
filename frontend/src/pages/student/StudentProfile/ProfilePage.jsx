import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";

const ProfilePage = () => {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    // Fetch student profile from backend
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/students/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) throw new Error("Failed to fetch profile");
        setStudent(data);
      } catch (error) {
        console.error("Error fetching profile:", error.message);
      }
    };

    fetchProfile();
  }, []);

  if (!student) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <Navbar />
      <div className="profile-box">
        <img
          src={student.profilePicture || "https://via.placeholder.com/150"}
          alt="Profile"
          className="profile-pic"
        />
        <h2>{student.fullName}</h2>
        <p><strong>School:</strong> {student.school}</p>
        <p><strong>Course:</strong> {student.course}</p>
        <p><strong>Assignments Completed:</strong> {student.assignmentsCompleted}</p>
        <p><strong>Grades:</strong> {student.grades}</p>
      </div>
    </div>
  );
};

export default ProfilePage;
