const express = require("express")
const router = express.Router()
const authController = require("../controller/auth.controller")
const userController = require("../controller/user.controller")

router.post("/login", authController.loginWithEmail)
router.get("/me", authController.authenticateToken, userController.getUser)

module.exports = router