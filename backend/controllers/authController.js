import SignUp from '../models/SignUp.js';
import LoginInfo from '../models/LoginInfo.js';
import HabitInfo from '../models/HabitInfo.js';
import CompletionLog from '../models/CompletionLog.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

/**
 * SIGN UP Controller: Stores user details in 'sign_up' collection
 */
export async function register(req, res) {
  try {
    const { username, email, password, avatar } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    const existingUser = await SignUp.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername }
      ]
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
      }
      return res.status(400).json({ message: 'This username is already taken. Please choose another.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save in 'sign_up' table
    const user = new SignUp({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      avatar: avatar || '⚔️'
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });

    const userObject = user.toObject();
    delete userObject.password;

    res.status(201).json({ token, user: userObject, message: 'Registration successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
}

/**
 * LOG IN Controller: Authenticates user & logs attempt in 'login_info' collection
 */
export async function login(req, res) {
  try {
    const { identifier, password } = req.body;
    const loginId = (identifier || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Username/Email and password are required.' });
    }

    // Support logging in with EITHER email OR username
    const user = await SignUp.findOne({
      $or: [
        { email: loginId.toLowerCase() },
        { username: loginId }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'No account found with this username or email.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Record failed attempt in 'login_info'
      await LoginInfo.create({
        user: user._id,
        loginIdentifier: loginId,
        status: 'FAILED'
      });
      return res.status(400).json({ message: 'Incorrect password. Please try again.' });
    }

    // Record successful login in 'login_info' table
    await LoginInfo.create({
      user: user._id,
      loginIdentifier: loginId,
      status: 'SUCCESS'
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });

    const userObject = user.toObject();
    delete userObject.password;

    res.json({ token, user: userObject, message: 'Login successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await SignUp.findById(req.userId).select('-password').populate('friends', 'username avatar level xp title');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile.', error: error.message });
  }
}

export async function togglePremium(req, res) {
  try {
    const user = await SignUp.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.isPremium = !user.isPremium;
    await user.save();

    res.json({
      message: `Premium tier ${user.isPremium ? 'activated' : 'deactivated'}!`,
      isPremium: user.isPremium
    });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling premium status.', error: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { username, avatar } = req.body;
    const user = await SignUp.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (username) user.username = username.trim();
    if (avatar) user.avatar = avatar;

    await user.save();
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile.', error: error.message });
  }
}

export async function addFriend(req, res) {
  try {
    const { friendUsername } = req.body;
    const friend = await SignUp.findOne({ username: friendUsername.trim() });
    if (!friend) {
      return res.status(404).json({ message: 'Friend with that username not found.' });
    }

    if (friend._id.toString() === req.userId) {
      return res.status(400).json({ message: 'You cannot add yourself as a friend.' });
    }

    const user = await SignUp.findById(req.userId);
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'User is already in your friends list.' });
    }

    user.friends.push(friend._id);
    await user.save();

    const populatedUser = await SignUp.findById(req.userId).select('-password').populate('friends', 'username avatar level xp title');

    res.json({ message: `Added ${friend.username} to your friends!`, friends: populatedUser.friends });
  } catch (error) {
    res.status(500).json({ message: 'Error adding friend.', error: error.message });
  }
}

/**
 * DELETE ACCOUNT: Automatically deletes data across all 4 tables:
 * 1. 'sign_up'
 * 2. 'login_info'
 * 3. 'habit_info'
 * 4. 'completionlogs'
 */
export async function deleteAccount(req, res) {
  try {
    const userId = req.userId;

    const user = await SignUp.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    // 1. Delete from 'habit_info' table
    await HabitInfo.deleteMany({ owner: userId });

    // 2. Delete from 'completionlogs' table
    await CompletionLog.deleteMany({ user: userId });

    // 3. Delete from 'login_info' table
    await LoginInfo.deleteMany({ user: userId });

    // 4. Remove from other users' friends lists
    await SignUp.updateMany(
      { friends: userId },
      { $pull: { friends: userId } }
    );

    // 5. Delete from 'sign_up' table
    await SignUp.findByIdAndDelete(userId);

    res.json({ message: 'Account and all data across sign_up, login_info, habit_info, and completionlogs tables permanently deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user account.', error: error.message });
  }
}
