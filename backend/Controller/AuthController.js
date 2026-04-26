const UserModel = require("../Models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signUp = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409).json({ message: "User already exists", success: false });
        }
        const userModel = new UserModel({ name, email, password, role: role || 'student' });
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();
        res.status(201).json({ message: "SignUp successful ", success: true });
    }
    catch (err) {
        console.log(err);
        return res.status(500)
            .json({ message: "Server Error", success: false });
    }
}
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        const errorMessage = "Auth failed email or password is wrong";
        if (!user) {
            return res.status(403).json({ message: errorMessage, success: false });
        }

        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403).json({ message: errorMessage, success: false });
        }
        const expiresInSeconds = 3000;
        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: expiresInSeconds},
        )
        const expiryTime = Date.now() + expiresInSeconds * 1000;
        res.status(201).
            json({
                message: "Login successful",
                success: true,
                jwtToken,
                expiryTime,
                email: user.email,
                name: user.name,
                role: user.role
            });
    }
    catch (err) {
        return res.status(500)
            .json({ message: "Server Error", success: false });
    }
}
module.exports = {
    signUp,
    login
}