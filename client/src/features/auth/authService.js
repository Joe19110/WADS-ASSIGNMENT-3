import axios from 'axios'

const API_URL = '/service/user'

// signin user
const signin = async (userData) => {
    console.log('authService.signin - Sending login request', userData);
    const response = await axios.post(API_URL + "/signin", userData)

    console.log('authService.signin - Received response:', response);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
    }

    return response.data
}

// logout user
const logout = async () => {
    try {
        const response = await axios.post(API_URL + "/logout");
        if (response.status === 200) {
            localStorage.removeItem('user');
            console.log(response.data.message);
        } else {
            console.error("Backend logout failed:", response.data.message);
        }
    } catch (error) {
        console.error("Error during logout API call:", error);
    }
}

// signup user
const signup = async (userData) => {
    const response = await axios.post(API_URL + "/signup", userData)

    return response.data
}

// activate email
const activateEmail = async (token) => {
    const response = await axios.post(API_URL + "/activation", { activation_token: token });

    return response.data;
};

// Get user info
const getUserInfo = async () => {
    console.log('authService.getUserInfo - Attempting to fetch user info');
    // Get token from local storage
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user && user.access_token ? user.access_token : null; // Get access token

    console.log('authService.getUserInfo - Token from localStorage:', token);

    // Set up headers with the token
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    try {
        const response = await axios.get(API_URL + "/user-infor", config);
        console.log('authService.getUserInfo - Received response:', response);
        return response.data;
    } catch (error) {
        console.error('authService.getUserInfo - Error fetching user info:', error);
        throw error; // Re-throw the error so the thunk can catch it
    }
};

// Update user profile
const updateUserProfile = async (userData) => {
    // Get token from local storage
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user && user.access_token ? user.access_token : null; // Get access token

    // Set up headers with the token
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json' // Specify content type
        }
    };

    // Send PATCH request to backend update endpoint
    const response = await axios.patch(API_URL + "/update_profile", userData, config);

    // If update is successful, update local storage and return the updated user data
    if (response.data && response.data.user) {
         // Update the user data in localStorage with the new details
        const updatedUserInStorage = { ...user, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUserInStorage));
    }

    return response.data; // Return the response data (including updated user object)
};

const authService = {
    signin,
    logout,
    signup,
    activateEmail,
    getUserInfo,
    updateUserProfile
}

export default authService

