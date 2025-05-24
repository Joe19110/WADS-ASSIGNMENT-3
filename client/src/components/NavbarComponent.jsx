import React, { useEffect, useState } from "react";
import LogoImg from "../assets/logo.png";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { logout, reset } from "../features/auth/authSlice";

const NavbarComponent = ({ isProfilePage }) => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  console.log('NavbarComponent rendering - user:', user);

  const handleLogout = async () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/signin");
  };

  return (
    <nav className="flex w-full justify-between items-center bg-green-100 shadow-md py-3 px-10">
      {/* Logo */}
      <a href="/">
        <div className="flex gap-1 justify-center items-center cursor-pointer">
          <img src={LogoImg} alt="logo-image" className="h-6 w-6" />
          <p className="text-lg font-semibold text-green-600 hover:text-green-700 transition ease-in-out">
            ToDoSome
          </p>
        </div>
      </a>

      {/* Navigation Menu */}
      <div className="flex gap-6 justify-center items-center text-green-900 font-semibold">
        <span className="text-sm">
          My ToDo
        </span>
        {user ? (
          <div className="flex items-center gap-3">
            <a href="/profile" className="text-sm">Profile</a>
            {isProfilePage && (
              user.photoURL ? (
                <img
                  src={user?.photoURL}
                  alt="profile"
                  className="w-8 h-8 rounded-full"
                />
              ) : user?.user_image ? (
                <img
                  src={user.user_image}
                  alt="profile"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-800 text-white flex items-center justify-center font-semibold">
                  {user.email && user.email.charAt(0) ? user.email.charAt(0).toUpperCase() : ''}
                </div>
              )
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white text-sm py-2 px-4 rounded-md hover:bg-red-500 transition ease-in-out"
            >
              Logout
            </button>
          </div>
        ) : (
          <a
            href="/signin"
            className="bg-green-800 text-white text-sm py-2 px-6 rounded-md hover:bg-green-700 transition ease-in-out"
          >
            Login
          </a>
        )}
      </div>
    </nav>
  );
};

export default NavbarComponent;
