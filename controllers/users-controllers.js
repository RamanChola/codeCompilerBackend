import { hash, compare } from "bcrypt";
import User from "../models/User.js";
// import { unlink } from "fs";
import jwt from "jsonwebtoken";
const { sign, verify } = jwt;

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({
      email: email,
    });
  } catch (err) {
    res.status(500).json(err);
  }
  if (existingUser) {
    return res.status(422).json("User exists already, please login instead");
  }
  let EncPass;
  try {
    EncPass = await hash(password, 12);
  } catch (err) {
    console.log(err);
  }
  const createdUser = new User({
    name,
    email,
    password: EncPass,
  });
  try {
    await createdUser.save();
  } catch (err) {
    res.status(500).json(err);
  }
  let token;
  try {
    token = sign(
      {
        userId: createdUser.id,
        role: "user",
      },
      process.env.JWT_SECRET
      // {
      //   expiresIn: "1h",
      // }
    );
  } catch (error) {
    res.status(500).json(error);
  }
  res.status(201).json({
    userId: createdUser.id,
    token: token,
  });
};


const login = async (req, res) => {
  let existingUser;
  try {
    existingUser = await User.findOne({
      email: req.body.email,
    });
    if (!existingUser) {
      return res.status(400).json("wrong credentials");
    }

    const validated = await compare(req.body.password, existingUser.password);
    if (!validated) {
      return res.status(400).json("wrong credentials");
    }
    let token;
    try {
      token = sign(
        {
          userId: existingUser.id,
          role: existingUser.role,
        },
        process.env.JWT_SECRET
        // {
        //   expiresIn: "1h",
        // }
      );
    } catch (error) {
      res.status(500).json(error + "here");
    }
    res.json({
      userId: existingUser.id,
      token: token,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

export {signup, login };