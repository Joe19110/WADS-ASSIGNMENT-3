import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from './authService'

const user = JSON.parse(localStorage.getItem('user'))

const initialState = {
    user: user ? user : null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    isLoggedOut: user ? false : true,
    message: ""
}

// signin user
export const signin = createAsyncThunk('auth/signin', async (user, thunkAPI) => {
    try {
        const responseData = await authService.signin(user)
        console.log('authSlice - after authService.signin', responseData);
        return responseData
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()

        return thunkAPI.rejectWithValue(message)
    }
})

// logout user
export const logout = createAsyncThunk('auth/logout', async () => {
    await authService.logout()
})

// signup user
export const signup = createAsyncThunk('auth/signup', async (user, thunkAPI) => {
    try {
        return await authService.signup(user)
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()

        return thunkAPI.rejectWithValue(message)
    }
})

// activate email
export const activateEmail = createAsyncThunk('auth/activateEmail', async (token, thunkAPI) => {
    try {
        return await authService.activateEmail(token)
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()

        return thunkAPI.rejectWithValue(message)
    }
})

// Get user info
export const getUserInfo = createAsyncThunk('auth/getUserInfo', async (_, thunkAPI) => {
    try {
        console.log('authSlice - getUserInfo pending');
        // We can access the token from the state if needed, but authService will handle it
        // const token = thunkAPI.getState().auth.user.token;
        const userData = await authService.getUserInfo();
        console.log('authSlice - getUserInfo fulfilled', userData);
        return userData;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()

        // If fetching user info fails, it might mean the token is invalid or expired
        // In a real app, you might want to dispatch logout here
        // thunkAPI.dispatch(logout());

        return thunkAPI.rejectWithValue(message)
    }
})

// Update user profile
export const updateUserProfile = createAsyncThunk('auth/updateUserProfile', async (userData, thunkAPI) => {
    try {
        const responseData = await authService.updateUserProfile(userData);
        // Assuming the backend returns the updated user object in responseData.user
        if (responseData.user) {
            // Update the user state in Redux with the newly fetched data
            return responseData.user;
        } else {
            // If backend didn't return user data, but request was successful
            // You might want to re-fetch user info or handle this case differently
            return thunkAPI.rejectWithValue('Profile updated, but no user data returned.');
        }
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.user = null
            state.isError = false
            state.isSuccess = false
            state.isLoading = false
            state.message = ""
            state.isLoggedOut = true
        }
    },
    extraReducers: (builder) => {
        builder
            // signin builder
            .addCase(signin.pending, (state) => {
                state.isLoading = true
            })
            .addCase(signin.fulfilled, (state, action) => {
                console.log('authSlice - signin.fulfilled', action.payload);
                state.isLoading = false
                state.isSuccess = true
                state.isLoggedOut = false
                state.user = action.payload

            })
            .addCase(signin.rejected, (state, action) => {
                console.log('authSlice - signin.rejected', action.payload);
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            // logout builder
            .addCase(logout.fulfilled, (state) => {
                state.user = null
                state.isLoggedOut = true
            })
            // signup builder
            .addCase(signup.pending, (state) => {
                state.isLoading = true
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.message = action.payload.message || "Signup successful. Please check your email for activation."
            })
            .addCase(signup.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            // activate email builder
            .addCase(activateEmail.pending, (state) => {
                state.isLoading = true
            })
            .addCase(activateEmail.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.message = action.payload.message || "Email activated successfully! Please login."
            })
            .addCase(activateEmail.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            // Get user info builder
            .addCase(getUserInfo.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getUserInfo.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                // Store the fetched user info. The payload should be the user object.
                state.user = action.payload;
            })
            .addCase(getUserInfo.rejected, (state, action) => {
                console.log('authSlice - getUserInfo rejected', action.payload);
                state.isLoading = false
                state.isError = true
                state.message = action.payload
                // Clear user state in Redux if fetching user info fails (e.g., token expired)
                state.user = null;
                state.isLoggedOut = true; // Keep local storage user data
            })
            // Update user profile builder
            .addCase(updateUserProfile.pending, (state) => {
                state.isLoading = true
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.user = action.payload;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    }
})

export const { reset } = authSlice.actions
export default authSlice.reducer