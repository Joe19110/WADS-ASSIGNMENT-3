import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Users from '../models/users.js';
import { userSendMail } from './userSendMail.js';
import fetch from 'node-fetch'; // Import fetch if using Node < 18. If using Node 18+, it's global.

const { DEFAULT_CLIENT_URL, DEFAULT_SERVER_URL } = process.env

// check password and confirmPassword
function isMatch(password, confirm_password) {
    if (password === confirm_password) return true
    return false
}

// validate email
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// validate password
function validatePassword(password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/
    return re.test(password)
}

// create refresh token
function createRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' })
}

// create access token
function createAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' }); // Access tokens are typically short-lived
}

// user sign-up
export const signUp = async (req, res) => {
    try {
        const { personal_id, name, email, password, confirmPassword, address, phone_number } = req.body;

        if (!personal_id || !name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        if (name.length < 3) return res.status(400).json({ message: "Your name must be at least 3 letters long" });

        if (!isMatch(password, confirmPassword)) return res.status(400).json({ message: "Password did not match" });

        if (!validateEmail(email)) return res.status(400).json({ message: "Invalid emails" });

        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"
            });
        }

        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "This email is already registered" });
        }

        // Log the password before hashing (for debugging purposes only - remove in production!)
        console.log('Signup - Plain password:', password);

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Log the hashed password
        console.log('Signup - Hashed password:', hashedPassword);

        const newUser = {
            personal_id,
            name,
            email,
            password: hashedPassword,
            address,
            phone_number
        };

        // create email notification for user activation
        const refreshToken = createRefreshToken(newUser)

        // Update the URL to point to the new backend GET route
        const url = `http://localhost:${process.env.PORT || 5000}/service/user/user/activate/${refreshToken}`;

        userSendMail(email, url, "Verify your email address", "Confirm Email")

        res.json({ message: "Register Success! Please activate your email to start" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// email activation
export const activateEmail = async (req, res) => {
    try {
        const { activation_token } = req.body;
        const user = jwt.verify(activation_token, process.env.REFRESH_TOKEN_SECRET)

        const { personal_id, name, email, password, address, phone_number } = user

        const existingUser = await Users.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "This email already exists." });
        }

        const newUser = new Users({
            personal_id,
            name,
            email,
            password,
            address,
            phone_number
        })

        await newUser.save()

        res.json({ message: "Account has been activated. Please login now!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// user sign-in
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Log received email and password
        console.log('Signin - Received Email:', email);
        console.log('Signin - Received Password:', password); // Be cautious logging passwords, even for debugging

        const user = await Users.findOne({ email })

        // Log the user object found (or null if not found)
        console.log('Signin - User found:', user);
        if (user) {
            console.log('Signin - Stored Hashed Password:', user.password);
        }

        if (!email || !password) return res.status(400).json({ message: "Please fill in all fields" })

        if (!user) return res.status(400).json({ message: "Invalid Credentials" })

        const isMatch = await bcrypt.compare(password, user.password)

        // Log the result of the password comparison
        console.log('Signin - bcrypt.compare result:', isMatch);

        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" })

        const refresh_token = createRefreshToken({ id: user._id })
        const access_token = createAccessToken({ id: user._id })

        const expiry = 24 * 60 * 60 * 1000 // 1 day

        res.cookie('refreshtoken', refresh_token, {
            httpOnly: true,
            path: '/api/user/refresh_token',
            maxAge: expiry,
            expires: new Date(Date.now() + expiry)
        })

        res.json({
            message: "Sign In successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            access_token
        })

        console.log('Signin - Sending JSON response:', {
            message: "Sign In successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            access_token
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// user information
export const userInfor = async (req, res) => {
    try {
        const userId = req.user.id
        const userInfor = await Users.findById(userId).select("-password")

        res.json(userInfor)
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// user logout
export const logout = (req, res) => {
    try {
        res.clearCookie('refreshtoken', {
            path: '/api/user/refresh_token' // Make sure the path matches the one set during login
        });
        return res.status(200).json({ message: "Logged out successfully!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from authenticated request
        const updates = req.body; // Updated profile data from the client

        // Optional: Filter allowed fields to prevent updating sensitive info like password or role
        const allowedUpdates = ['name', 'personal_id', 'address', 'phone_number', 'user_image'];
        const actualUpdates = {};
        Object.keys(updates).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                actualUpdates[key] = updates[key];
            }
        });

        if (Object.keys(actualUpdates).length === 0) {
            return res.status(400).json({ message: "No valid fields provided for update." });
        }

        // Find and update the user. { new: true } returns the updated document.
        const updatedUser = await Users.findByIdAndUpdate(userId, { $set: actualUpdates }, { new: true }).select("-password");

        if (!updatedUser) {
            // This case should ideally not be reached if auth middleware works correctly
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "Profile updated successfully!", user: updatedUser });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Handle email activation link click (backend side)
export const getActivationToken = async (req, res) => {
    const { activation_token } = req.params; // Get token from URL params

    if (!activation_token) {
      // We might redirect to a client-side error page here instead of sending a response
      if (req.accepts('html')) {
         return res.redirect(`${DEFAULT_CLIENT_URL}/activation-failed?message=Invalid or missing token`);
      } else {
         return res.status(400).json({ message: 'Invalid or missing token.' });
      }
    }
  
    try {
      // Make a POST request to the internal /service/user/activation endpoint
      const backendActivationUrl = `http://localhost:${process.env.PORT || 5000}/service/user/activation`;
      
      const response = await fetch(backendActivationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activation_token }),
      });
  
      const responseData = await response.json(); // Assuming backend activation returns JSON

      if (req.accepts('html')) {
        // Redirect to client-side home page with status and message query params
        const status = response.ok ? 'success' : 'error';
        const message = encodeURIComponent(responseData.message || (response.ok ? 'Email activated successfully!' : 'Email activation failed.'));
        const redirectUrl = `${DEFAULT_CLIENT_URL}/?status=${status}&message=${message}`;
        console.log('Redirecting to:', redirectUrl); // Log the redirect URL
        return res.redirect(redirectUrl);
      } else {
         // If not accepting HTML, send JSON response (e.g., for API client testing)
        return res.status(response.ok ? 200 : 400).json(responseData);
      }

    } catch (error) {
      console.error("Error in getActivationToken:", error);
      // Redirect to a client-side error page on internal server error
      if (req.accepts('html')) {
        return res.redirect(`${DEFAULT_CLIENT_URL}/activation-failed?message=${encodeURIComponent('Internal server error during activation.')}`);
      } else {
        return res.status(500).json({ message: 'Internal server error during activation.' });
      }
    }
};