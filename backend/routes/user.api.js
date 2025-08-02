const express = require("express")
const router = express.Router()
const userController = require("../controller/user.controller")

//회원가입

router.post("/", userController.CreateUser)

module.exports = router