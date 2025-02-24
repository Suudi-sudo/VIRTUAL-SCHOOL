import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user/profile');
      setUser(response.data);
      setName(response.data.name);
      setPreviewImage(response.data.profileImage);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile. Please try again later.');
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    if (image) {
      formData.append('profileImage', image);
    }

    try {
      const response = await axios.put('/api/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser(response.data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div>No user data available.</div>;

  return (
    <div className="profile">
      <h2>User Profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            required
          />
        </div>
        <div>
          <label htmlFor="profileImage">Profile Image:</label>
          <input
            type="file"
            id="profileImage"
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>
        {previewImage && (
          <div>
            <img
              src={previewImage}
              alt="Profile Preview"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
          </div>
        )}
        <button type="submit">Update Profile</button>
      </form>
      <div>
        <h3>User Information</h3>
        <p>Username: {user.username}</p>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
      </div>
    </div>
  );
};

export default Profile;



/* ... existing styles ... */

// .profile {
//     max-width: 600px;
//     margin: 0 auto;
//   }
  
//   .profile h2 {
//     margin-bottom: 20px;
//   }
  
//   .profile form {
//     display: flex;
//     flex-direction: column;
//     gap: 15px;
//     margin-bottom: 30px;
//   }
  
//   .profile form div {
//     display: flex;
//     flex-direction: column;
//   }
  
//   .profile label {
//     margin-bottom: 5px;
//     font-weight: bold;
//   }
  
//   .profile input[type="text"],
//   .profile input[type="file"] {
//     padding: 8px;
//     border: 1px solid #ddd;
//     border-radius: 4px;
//   }
  
//   .profile button {
//     padding: 10px;
//     background-color: #007bff;
//     color: white;
//     border: none;
//     border-radius: 4px;
//     cursor: pointer;
//     transition: background-color 0.3s;
//   }
  
//   .profile button:hover {
//     background-color: #0056b3;
//   }
  
//   .profile img {
//     border-radius: 50%;
//     margin-bottom: 10px;
//   }
  
//   .profile h3 {
//     margin-top: 30px;
//     margin-bottom: 10px;
//   }
  
//   .profile p {
//     margin: 5px 0;
//   }