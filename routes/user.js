const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Il manque un champ pour créer votre compte" });
    } else {
      const existingUser = await User.findOne({ email: email });
      if (!existingUser) {
        const salt = uid2(16);
        const token = uid2(16);
        const saltedPassword = password + salt;
        const hash = SHA256(saltedPassword).toString(encBase64);

        const newUser = new User({
          email: email,
          username: username,
          token: token,
          hash: hash,
          salt: salt,
        });

        await newUser.save();
        const responseObject = {
          _id: newUser._id,
          token: newUser.token,
          username: newUser.username,
        };
        return res.status(201).json(responseObject);
      } else {
        return res
          .status(409)
          .json({ message: "Cet email est déjà utilisé !" });
      }
    }
  } catch (error) {
    console.log("jesuisici");
    return res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const foundUser = await User.findOne({ email: req.body.email });
    console.log(foundUser);
    if (foundUser) {
      const newHash = SHA256(req.body.password + foundUser.salt).toString(
        encBase64
      );
      if (newHash === foundUser.hash) {
        const responseObject = {
          _id: foundUser._id,
          token: foundUser.token,
          username: foundUser.username,
        };
        return res.status(200).json(responseObject);
      } else {
        return res
          .status(400)
          .json({ message: "Email et/ou mot de passe incorrect(s) 😢" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "Email et/ou mot de passe incorrect(s) 😢" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
