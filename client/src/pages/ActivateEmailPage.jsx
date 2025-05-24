import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { activateEmail, reset } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const ActivateEmailPage = () => {
    const { activationToken } = useParams(); // Get the token from URL params
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { isLoading, isError, isSuccess, message } = useSelector(state => state.auth);

    useEffect(() => {
        if (activationToken) {
            dispatch(activateEmail(activationToken));
        }

        if (isSuccess) {
            toast.success(message);
            // Redirect to signin page after successful activation
            navigate('/signin');
        }

        if (isError) {
            toast.error(message);
        }

        // Clean up state on component unmount or when activation is done
        return () => {
            dispatch(reset());
        };

    }, [activationToken, dispatch, isSuccess, isError, message, navigate]);

    if (isLoading) {
        return (
            <div className="w-full flex justify-center items-center h-screen">
                <span className="loading loading-spinner text-success loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center h-screen">
            {/* You can add a message here indicating that the email is being activated */}
            <p className="text-lg text-green-800">Activating your email...</p>
        </div>
    );
};

export default ActivateEmailPage; 