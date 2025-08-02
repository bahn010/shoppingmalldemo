const User = require("../model/user")
const bcrypt = require("bcryptjs")
const saltRounds = 10


const userController = {}

userController.CreateUser = async (req, res) => {
  try {
    const {name, email, password,level} = req.body
    const user = await User.findOne({email})

    if(user) {
      throw new Error("이미 존재하는 이메일입니다.")
    }
    const salt = await bcrypt.genSalt(saltRounds) 
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({name, email, password: hashedPassword, level: level || "customer"})
    await newUser.save()

    return res.status(200).json({status: "success", message: "회원가입이 완료되었습니다."})
    
  }
  catch(err) {
    res.status(400).json({status: "fail", message: err.message})
  }
}

module.exports = userController