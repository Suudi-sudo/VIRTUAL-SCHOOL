// import React, { useEffect, useState } from "react";
// import Sidebar from "./Sidebar"; // If you have a Sidebar component
// import "bootstrap/dist/css/bootstrap.min.css";

// function ProfilePage() {
//   const [profile, setProfile] = useState({
//     id: "",
//     username: "",
//     email: "",
//     profile_pic: "",
//     role: "",
//     created_at: "",
//   });
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);

//   // For uploading a new profile pic
//   const [file, setFile] = useState(null);

//   // Retrieve user_id and token from localStorage (or decode from JWT)
//   const userId = localStorage.getItem("user_id");
//   const token = localStorage.getItem("token");

//   // Your Flask backend base URL
//   const BASE_URL = "http://localhost:5000";

//   // Fetch the user's profile on mount
//   useEffect(() => {
//     if (!userId) {
//       setError("No user ID found in localStorage.");
//       return;
//     }
//     setLoading(true);

//     fetch(`${BASE_URL}/profile/${userId}`, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((resp) => {
//         if (!resp.ok) {
//           throw new Error("Failed to fetch profile.");
//         }
//         return resp.json();
//       })
//       .then((data) => {
//         setProfile(data);
//         setError(null);
//       })
//       .catch((err) => setError(err.message))
//       .finally(() => setLoading(false));
//   }, [userId, token]);

//   // Handle text input changes (e.g., for username)
//   const handleChange = (e) => {
//     setProfile({ ...profile, [e.target.name]: e.target.value });
//   };

//   // Toggle editing mode
//   const handleEditClick = () => {
//     setIsEditing(true);
//     setSuccess(null);
//     setError(null);
//   };

//   // Cancel editing
//   const handleCancel = () => {
//     setIsEditing(false);
//     setSuccess(null);
//     setError(null);
//   };

//   // Save changes (currently only updates 'username' per your route)
//   const handleSave = () => {
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     fetch(`${BASE_URL}/profile/${userId}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ username: profile.username }),
//       // If you want to update more fields, expand your backend route
//       // and include them here.
//     })
//       .then((resp) => {
//         if (!resp.ok) {
//           return resp.json().then((err) => {
//             throw new Error(err.msg || "Failed to update profile.");
//           });
//         }
//         return resp.json();
//       })
//       .then((data) => {
//         setIsEditing(false);
//         setSuccess(data.msg || "Profile updated successfully!");
//       })
//       .catch((err) => setError(err.message))
//       .finally(() => setLoading(false));
//   };

//   // Handle file selection for profile pic
//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   // Upload a new profile pic (POST /upload-profile-pic)
//   const handleUploadPic = () => {
//     if (!file) {
//       setError("No file selected for upload.");
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     const formData = new FormData();
//     formData.append("file", file);

//     fetch(`${BASE_URL}/upload-profile-pic`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: formData,
//     })
//       .then((resp) => {
//         if (!resp.ok) {
//           return resp.json().then((err) => {
//             throw new Error(err.msg || "Failed to upload image.");
//           });
//         }
//         return resp.json();
//       })
//       .then((data) => {
//         // Update the profile pic in state
//         setProfile({ ...profile, profile_pic: data.url });
//         setSuccess(data.msg || "Profile picture updated successfully!");
//       })
//       .catch((err) => setError(err.message))
//       .finally(() => setLoading(false));
//   };

//   return (
//     <div
//       className="d-flex"
//       style={{ minHeight: "100vh", backgroundColor: "#1B1F3B" }}
//     >
//       {/* Optional Sidebar */}
//       <Sidebar />

//       <div className="container-fluid text-white py-4">
//         <h1 className="mb-4">My Profile</h1>

//         {error && (
//           <div className="alert alert-danger" role="alert">
//             {error}
//           </div>
//         )}
//         {success && (
//           <div className="alert alert-success" role="alert">
//             {success}
//           </div>
//         )}

//         {loading && <p>Loading...</p>}

//         {!loading && (
//           <div
//             className="p-4"
//             style={{ backgroundColor: "#2d2f45", borderRadius: "8px" }}
//           >
//             {/* Profile Picture */}
//             <div className="mb-3 text-center">
//               {profile.profile_pic ? (
//                 <img
//                   src={profile.profile_pic}
//                   alt="Profile"
//                   style={{
//                     width: "150px",
//                     height: "150px",
//                     borderRadius: "50%",
//                     objectFit: "cover",
//                   }}
//                 />
//               ) : (
//                 <p>No profile picture</p>
//               )}
//             </div>

//             {/* File Input for new pic */}
//             <div className="mb-3">
//               <label className="form-label">Change Profile Picture</label>
//               <input
//                 type="file"
//                 className="form-control"
//                 onChange={handleFileChange}
//                 style={{ backgroundColor: "#3b3e5b", color: "#fff" }}
//               />
//               <button
//                 className="btn btn-info mt-2"
//                 style={{ border: "none", backgroundColor: "#3b82f6", color: "#fff" }}
//                 onClick={handleUploadPic}
//                 disabled={loading}
//               >
//                 {loading ? "Uploading..." : "Upload New Pic"}
//               </button>
//             </div>

//             {/* Username (editable) */}
//             <div className="mb-3">
//               <label className="form-label">Username</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="username"
//                 value={profile.username || ""}
//                 onChange={handleChange}
//                 disabled={!isEditing}
//                 style={{ backgroundColor: "#3b3e5b", color: "#fff" }}
//               />
//             </div>

//             {/* Email (read-only) */}
//             <div className="mb-3">
//               <label className="form-label">Email</label>
//               <input
//                 type="email"
//                 className="form-control"
//                 value={profile.email || ""}
//                 disabled
//                 style={{ backgroundColor: "#3b3e5b", color: "#fff" }}
//               />
//             </div>

//             {/* Role (read-only) */}
//             <div className="mb-3">
//               <label className="form-label">Role</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 value={profile.role || ""}
//                 disabled
//                 style={{ backgroundColor: "#3b3e5b", color: "#fff" }}
//               />
//             </div>

//             {/* Created At (read-only) */}
//             <div className="mb-3">
//               <label className="form-label">Joined On</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 value={profile.created_at || ""}
//                 disabled
//                 style={{ backgroundColor: "#3b3e5b", color: "#fff" }}
//               />
//             </div>

//             {/* Edit / Save Buttons */}
//             {!isEditing ? (
//               <button
//                 className="btn"
//                 style={{ backgroundColor: "#6366f1", border: "none", color: "#fff" }}
//                 onClick={handleEditClick}
//               >
//                 Edit Profile
//               </button>
//             ) : (
//               <div className="d-flex">
//                 <button
//                   className="btn me-2"
//                   style={{ backgroundColor: "#10b981", border: "none", color: "#fff" }}
//                   onClick={handleSave}
//                   disabled={loading}
//                 >
//                   {loading ? "Saving..." : "Save Changes"}
//                 </button>
//                 <button
//                   className="btn"
//                   style={{ backgroundColor: "#4b5563", border: "none", color: "#fff" }}
//                   onClick={handleCancel}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ProfilePage;
