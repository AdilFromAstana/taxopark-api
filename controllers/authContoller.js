const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const crypto = require("crypto");

const secretKey = Buffer.from("12345678901234567890123456789012", "utf-8"); // 32 байта
const iv = Buffer.from("1234567890123456", "utf-8"); // 16 байт IV

function pkcs7Pad(text) {
  const blockSize = 16;
  const pad = blockSize - (text.length % blockSize);
  return text + String.fromCharCode(pad).repeat(pad);
}

function pkcs7Unpad(text) {
  const pad = text.charCodeAt(text.length - 1);
  return text.slice(0, -pad);
}

function encryptPassword(password) {
  const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);
  let encrypted = cipher.update(pkcs7Pad(password), "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decryptPassword(encryptedPassword) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);
  let decrypted = decipher.update(encryptedPassword, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return pkcs7Unpad(decrypted);
}

class AuthController {
  async register(req, res) {
    try {
      const { userName, name, roles } = req.body;

      if (!userName || !name || !roles || !Array.isArray(roles)) {
        return res.status(400).json({
          message: "Все поля обязательны, а роли должны быть массивом.",
        });
      }

      const existingUser = await User.findOne({ where: { userName } });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Пользователь с таким userName уже существует." });
      }

      const generatedPassword = crypto.randomBytes(8).toString("hex");
      const encryptedPassword = encryptPassword(generatedPassword);

      const newUser = await User.create({
        userName,
        name,
        password: encryptedPassword,
        roles: roles,
      });

      return res.status(201).json({
        message: "Регистрация успешна.",
        user: newUser,
        password: generatedPassword,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { userName, password } = req.body;

      if (!userName || !password) {
        return res.status(400).json({ message: "Все поля обязательны." });
      }

      const user = await User.findOne({ where: { userName } });
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден." });
      }

      const decryptedPassword = decryptPassword(user.password);
      if (password !== decryptedPassword) {
        return res.status(400).json({ message: "Неверный пароль." });
      }

      const token = jwt.sign(
        { id: user.id, userName: user.userName, roles: user.roles },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      return res.status(200).json({ message: "Вход выполнен.", token });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ["id", "userName", "name", "roles"],
      });

      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден." });
      }

      user.roles = JSON.parse(user.roles);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: ["id", "userName", "name", "roles", "password"],
      });
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const { userName, name, roles, password } = req.body;
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден." });
      }

      user.userName = userName || user.userName;
      user.name = name || user.name;
      user.roles = roles || user.roles;
      if (password) user.password = await bcrypt.hash(password, 10);
      await user.save();

      return res.status(200).json({ message: "Данные обновлены.", user });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден." });
      }

      const newPassword = crypto.randomBytes(8).toString("hex");
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return res.status(200).json({ message: "Пароль сброшен.", newPassword });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();
