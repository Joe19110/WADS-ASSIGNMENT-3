import express from 'express';
import { activateEmail, signIn, signUp, userInfor, logout, getActivationToken, updateProfile } from '../controllers/users.js';
import { auth } from '../middleware/auth.js';

const router = express.Router()

/**
 * @openapi
 * tags:
 *   - name: User
 *     description: User related operations
 */

/**
 * @openapi
 * /user-infor:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user information (need auth)
 *     responses:
 *       '200':
 *         description: User information retrieved
 *       '403':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.get("/user-infor", auth, userInfor)

/**
 * @openapi
 * /signup:
 *   post:
 *     tags:
 *       - User
 *     summary: Sign up a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personal_id:
 *                 type: string
 *                 example: "BN12363468"
 *               name:
 *                 type: string
 *                 example: "juwono"
 *               email:
 *                 type: string
 *                 example: "juwono@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *               confirmPassword:
 *                 type: string
 *                 example: "Password123"
 *               address:
 *                 type: string
 *                 example: "Bandung, Indonesia"
 *               phone_number:
 *                 type: string
 *                 example: "089286382736431"
 *     responses:
 *       '200':
 *         description: New user registration successfully
 *       '403':
 *         description: Requested resource is forbidden
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.post("/signup", signUp)


/**
 * @openapi
 * /activation:
 *   post:
 *     tags:
 *       - User
 *     summary: Activate user email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activation_token:
 *                 type: string
 *                 example: "your_activation_token"
 *     responses:
 *       '200':
 *         description: Activation successful
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.post("/activation", activateEmail)

/**
 * @openapi
 * /signin:
 *   post:
 *     tags:
 *       - User
 *     summary: Sign in user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "juwono@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *     responses:
 *       '200':
 *         description: Sign in successfully
 *       '403':
 *         description: Requested resource is forbidden
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.post("/signin", signIn)

/**
 * @openapi
 * /logout:
 *   post:
 *     tags:
 *       - User
 *     summary: Logout user by clearing the refresh token cookie
 *     responses:
 *       '200':
 *         description: Logout successful
 *       '500':
 *         description: Internal server error
 */
router.post("/logout", logout)

/**
 * @openapi
 * /update_profile:
 *   patch:
 *     tags:
 *       - User
 *     summary: Update user profile (need auth)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               personal_id:
 *                 type: string
 *               address:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               user_image:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Profile updated successfully
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
router.patch("/update_profile", auth, updateProfile);

/**
 * @openapi
 * /user/activate/{activation_token}:
 *   get:
 *     tags:
 *       - User
 *     summary: Handle email activation link click and redirect to client
 *     parameters:
 *       - name: activation_token
 *         in: path
 *         required: true
 *         description: Email activation token
 *         schema:
 *           type: string
 *     responses:
 *       '302':
 *         description: Redirect to client-side activation success or failure page
 *       '400':
 *         description: Invalid or missing token
 *       '500':
 *         description: Internal server error
 */
router.get("/user/activate/:activation_token", getActivationToken);

export default router