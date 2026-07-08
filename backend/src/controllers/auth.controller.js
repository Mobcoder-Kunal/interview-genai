import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import userModel from "../models/user.model.js";
import blacklistTokenModel from "../models/blacklist.model.js"


/**
 *  @name registerUserController
 *  @description register a new user, expects username, email, password in the request body
 *  @access Public
 */

async function registerUserController(req, res) {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]
    })

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword
    })

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 *  @name loginUserController
 *  @description login a user, expects email and password in the request body
 *  @access Public
 */

async function loginUserController(req, res) {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            message: "Please provide email and password"
        })
    }

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        message: "User loggedIn successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 *  @name logoutUserController
 *  @description clear token from user cookie and add the token in blacklist
 *  @access Public
 */

async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        await blacklistTokenModel.create({ token })
    }

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })
}


/** 
 *  @name getMeController
 *  @description get the current logged in user details
 *  @access Private
 */

async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

export {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};
