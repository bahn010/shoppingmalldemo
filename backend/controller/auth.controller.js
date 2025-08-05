const authController = {}
const User = require("../model/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

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

authController.authenticateToken = async (req, res, next) => {
  try {
    const tokenstring = req.headers.authorization
    if (!tokenstring) throw new Error("토큰이 존재하지 않습니다.")
    const token = tokenstring.replace("Bearer ", "")
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) throw new Error("토큰이 유효하지 않습니다.")
      req.userID = payload.id
      next()
    })

  } catch (err) {
    return res.status(400).json({ status: "fail", error: err.message })
  }
}

authController.checkAdminPermission = async (req, res, next) => {
  try {
    const user = await User.findById(req.userID)
    if (user.level !== "admin") throw new Error("관리자 권한이 없습니다.")
    next()
  } catch (err) {
    return res.status(400).json({ status: "fail", error: err.message })
  }
}


module.exports = authController