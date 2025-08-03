const authController = {}
const User = require("../model/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "이메일이 존재하지 않습니다." })
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (isPasswordCorrect) {
      const token = await user.generateToken()
      return res.status(200).json({ status: "success", user, token })
    } else {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." })
    }
  } catch (err) {
    return res.status(400).json({ status: "fail", error: err.message })
  }
}

authController.getMe = async (req, res) => {
  try {
    console.log("getMe endpoint called");
    console.log("Headers:", req.headers);
    
    const token = req.headers.authorization?.split(' ')[1];
    console.log("Token extracted:", token ? "Yes" : "No");
    
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "토큰이 없습니다." });
    }

    console.log("Verifying token with secret:", process.env.JWT_SECRET_KEY ? "Secret exists" : "No secret");
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Token decoded:", decoded);
    
    const user = await User.findById(decoded.id).select('-password');
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }

    console.log("Sending success response");
    return res.status(200).json({ 
      status: "success", 
      user: user 
    });
  } catch (err) {
    console.log("Error in getMe:", err);
    if (err.name === 'JsonWebTokenError') {
      console.log("JWT verification failed");
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }
    if (err.name === 'TokenExpiredError') {
      console.log("Token expired");
      return res.status(401).json({ message: "토큰이 만료되었습니다." });
    }
    console.log("Other error occurred");
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
}


module.exports = authController