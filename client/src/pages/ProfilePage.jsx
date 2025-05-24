import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserInfo, updateUserProfile } from '../features/auth/authSlice';
import NavbarComponent from '../components/NavbarComponent';

const ProfilePage = ({ isProfilePage }) => {
  const dispatch = useDispatch();
  const { user, isLoading, isError, message } = useSelector(state => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    personal_id: '',
    address: '',
    phone_number: '',
  });

  console.log('ProfilePage rendering - user:', user, 'isLoading:', isLoading, 'isError:', isError);

  useEffect(() => {
    // Fetch user info when the profile page is visited on mount
    dispatch(getUserInfo());
  }, [dispatch]); // Dependency on dispatch

  // Populate form data when user state is updated
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        personal_id: user.personal_id || '',
        address: user.address || '',
        phone_number: user.phone_number || '',
      });
    }
  }, [user]); // Re-run when user object changes

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to current user info if available
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        personal_id: user.personal_id || '',
        address: user.address || '',
        phone_number: user.phone_number || '',
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveChanges = () => {
    // TODO: Dispatch Redux thunk to update user profile on backend
    // console.log('Saving changes:', formData);
    dispatch(updateUserProfile(formData)); // Dispatch the update thunk
    setIsEditing(false); // Exit edit mode after dispatching
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-screen">
        <span className="loading loading-spinner text-success loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full flex justify-center items-center h-screen">
        <p className="text-red-600">Error loading profile: {message}</p>
      </div>
    );
  }

  // Render user info if user object is available
  return (
    <>
      <NavbarComponent isProfilePage={isProfilePage} />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        {user ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            {isEditing ? (
              <form className="flex flex-col gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold">Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold">Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="input input-bordered w-full" // Email might be non-editable
                    disabled // Email is often not editable
                  />
                </div>
                 <div>
                  <label className="block text-gray-700 font-semibold">Personal ID:</label>
                  <input
                    type="text"
                    name="personal_id"
                    value={formData.personal_id}
                    onChange={handleFormChange}
                    className="input input-bordered w-full"
                  />
                </div>
                 <div>
                  <label className="block text-gray-700 font-semibold">Address:</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    className="input input-bordered w-full"
                  />
                </div>
                 <div>
                  <label className="block text-gray-700 font-semibold">Phone Number:</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleFormChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  <button type="button" className="btn btn-success text-white" onClick={handleSaveChanges}>Save Changes</button>
                  <button type="button" className="btn" onClick={handleCancel}>Cancel</button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-lg"><span className="font-semibold">Personal ID:</span> {user.personal_id || 'N/A'}</p>
                <p className="text-lg"><span className="font-semibold">Name:</span> {user.name || 'N/A'}</p>
                <p className="text-lg"><span className="font-semibold">Email:</span> {user.email || 'N/A'}</p>
                <p className="text-lg"><span className="font-semibold">Address:</span> {user.address || 'N/A'}</p>
                <p className="text-lg"><span className="font-semibold">Phone Number:</span> {user.phone_number || 'N/A'}</p>
                <button className="btn btn-success mt-6" onClick={handleEditToggle}>Edit Profile</button>
              </div>
            )}
          </div>
        ) : (
          <p>User information not available.</p>
        )}
      </div>
    </>
  );
};

export default ProfilePage; 