import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ActivateEmailPage from "./pages/ActivateEmailPage";
import ProfilePage from './pages/ProfilePage';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserInfo } from './features/auth/authSlice';
import React from 'react';

// Temporary Placeholder Component
const ActivationPlaceholder = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg text-blue-600">Loading Activation Page...</p>
    </div>
  );
};

function App() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';

  console.log('App.jsx rendering - user:', user);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={user ? <HomePage /> : <LoginPage />} />
        <Route path="/signin" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupPage />} />
        <Route path="/user/activate/:activationToken" element={<ActivationPlaceholder />} />
        <Route path="/profile" element={user ? <ProfilePage isProfilePage={isProfilePage} /> : <Navigate to="/signin" />} />
        <Route path="*" element={user ? <Navigate to="/" /> : <Navigate to="/signin" />} />
      </Routes>
    </>
  );
}

export default App;
