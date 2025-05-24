import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signup, reset } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import NavbarComponent from '../components/NavbarComponent';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        personal_id: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: '',
        phone_number: ''
    });

    const { personal_id, name, email, password, confirmPassword, address, phone_number } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(state => state.auth);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        // Redirect after signup if successful (user needs to activate email)
        if (isSuccess && !user) { // Check for !user because user is null after signup until activation
            toast.success(message);
            navigate('/signin'); // Redirect to signin after successful signup
        }

        dispatch(reset());

    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
        } else {
            const userData = {
                personal_id,
                name,
                email,
                password,
                confirmPassword, // Backend expects confirmPassword
                address,
                phone_number
            };

            dispatch(signup(userData));
        }
    };

    if (isLoading) {
        return (
            <div className="w-full flex justify-center items-center h-screen">
                <span className="loading loading-spinner text-success loading-lg"></span>
            </div>
        );
    }

    return (
        <>
            <NavbarComponent />
            <div className="flex flex-col items-center justify-center py-10">
                <h1 className="text-2xl text-green-800 font-semibold mb-6">Create an Account</h1>
                <form onSubmit={onSubmit} className="flex flex-col gap-4 w-96">
                    <input
                        type="text"
                        name="personal_id"
                        value={personal_id}
                        onChange={onChange}
                        placeholder="Personal ID"
                        className="input input-bordered w-full"
                        required
                    />
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={onChange}
                        placeholder="Full Name"
                        className="input input-bordered w-full"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="Email"
                        className="input input-bordered w-full"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        placeholder="Password"
                        className="input input-bordered w-full"
                        required
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={onChange}
                        placeholder="Confirm Password"
                        className="input input-bordered w-full"
                        required
                    />
                     <input
                        type="text"
                        name="address"
                        value={address}
                        onChange={onChange}
                        placeholder="Address (Optional)"
                        className="input input-bordered w-full"
                    />
                     <input
                        type="text"
                        name="phone_number"
                        value={phone_number}
                        onChange={onChange}
                        placeholder="Phone Number (Optional)"
                        className="input input-bordered w-full"
                    />
                    <button type="submit" className="btn btn-success text-white w-full">
                        Sign Up
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-600">
                    Already have an account? <a href="/signin" className="text-green-700 hover:underline">Sign In</a>
                </p>
            </div>
        </>
    );
};

export default SignupPage; 