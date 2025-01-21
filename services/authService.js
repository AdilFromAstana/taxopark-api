const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const qs = require("qs");
const User = require("../models/User");
const Token = require("../models/Token");

exports.exchangeCodeForToken = async (code) => {
  try {
    const tokenResponse = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      qs.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: process.env.REDIRECT_URI,
        code,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    const longLivedTokenResponse = await axios.get(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.CLIENT_SECRET}&access_token=${access_token}`
    );

    return longLivedTokenResponse.data.access_token;
  } catch (error) {
    console.error(
      "Error during token exchange: ",
      error.response?.data || error
    );
    throw new Error("Failed to exchange code for token");
  }
};

exports.refreshInstagramToken = async (longLivedToken) => {
  if (!longLivedToken) {
    throw new Error("Long-lived access token is required");
  }

  try {
    const response = await axios.get(
      "https://graph.instagram.com/refresh_access_token",
      {
        params: {
          grant_type: "ig_refresh_token",
          access_token: longLivedToken,
        },
      }
    );

    const { access_token, expires_in } = response.data;

    return {
      accessToken: access_token,
      expiresIn: expires_in,
    };
  } catch (error) {
    console.error(
      "Error refreshing Instagram token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to refresh Instagram token");
  }
};

exports.findUserByUsername = async (username) => {
  return await User.findOne({ username });
};

exports.login = async (username, password) => {
  try {
    const user = await exports.findUserByUsername(username);
    if (!user) {
      return { success: false, message: "Invalid username or password." };
    }

    const isPasswordValid = bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: "Invalid username or password." };
    }

    const accessToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: "15m" } // Срок действия access-токена
    );

    const refreshToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "7d" } // Срок действия refresh-токена
    );

    await Token.create({ token: refreshToken });

    return {
      success: true,
      accessToken,
      refreshToken,
      instagramToken: user.instagramToken,
      message: "Login successful.",
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An error occurred during login." };
  }
};

exports.refreshToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      return { success: false, message: "Refresh token is required." };
    }

    const tokenExists = await Token.findOne({ token: refreshToken });
    if (!tokenExists) {
      return { success: false, message: "Invalid refresh token." };
    }

    const userData = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);

    const newAccessToken = jwt.sign(
      { id: userData.id, username: userData.username },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );

    return {
      success: true,
      accessToken: newAccessToken,
      message: "Token refreshed successfully.",
    };
  } catch (error) {
    console.error("Refresh token error:", error);
    return { success: false, message: "Invalid or expired refresh token." };
  }
};

exports.logout = async (refreshToken) => {
  try {
    // Удаление refresh-токена из базы данных
    await Token.deleteOne({ token: refreshToken });
    return { success: true, message: "Logged out successfully." };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, message: "An error occurred during logout." };
  }
};

exports.register = async (username, password) => {
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return { success: false, message: "Username is already taken." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    return { success: true, message: "User registered successfully." };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      message: "An error occurred during registration.",
    };
  }
};
