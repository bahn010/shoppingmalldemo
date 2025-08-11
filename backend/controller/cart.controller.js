const cartController = {}
const Cart = require("../model/cart")
const Product = require("../model/product")
const User = require("../model/user")

cartController.createCart = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body
    const userId = req.userID
    

    let cart = await Cart.findOne({ userId })
    
    if (cart) {

      const existingItem = cart.items.find(
        item => item.productId.toString() === productId && item.size === size
      )
      
      if (existingItem) {
        // 중복 상품인 경우 에러 메시지 반환
        return res.status(400).json({ 
          status: "fail", 
          message: "이미 등록된 상품입니다. 카트에서 수량을 변경해주세요." 
        })
      } else {
        // 새 아이템 추가
        cart.items.push({ productId, size, quantity })
      }
      
      await cart.save()
    } else {
      // 새 카트 생성
      cart = await Cart.create({
        userId,
        items: [{ productId, size, quantity }]
      })
    }
    
    res.status(200).json({ status: "success", cart })
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message })
  }
}

cartController.getCart = async (req, res) => {
  try {
    const userId = req.userID
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product'
    })
    res.status(200).json({ status: "success", cart })
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message })
  }
}

cartController.updateCart = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body
    const userId = req.userID
    
    const cart = await Cart.findOne({ userId })
    if (!cart) {
      return res.status(404).json({ status: "fail", message: "Cart not found" })
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.size === size
    )
    
    if (itemIndex === -1) {
      return res.status(404).json({ status: "fail", message: "Item not found in cart" })
    }
    
    if (quantity <= 0) {
      // 수량이 0 이하면 아이템 제거
      cart.items.splice(itemIndex, 1)
    } else {
      // 수량 업데이트
      cart.items[itemIndex].quantity = quantity
    }
    
    await cart.save()
    res.status(200).json({ status: "success", cart })
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message })
  }
}

cartController.deleteCart = async (req, res) => {
  try {
    const { productId, size } = req.body
    const userId = req.userID
    
    const cart = await Cart.findOne({ userId })
    if (!cart) {
      return res.status(404).json({ status: "fail", message: "Cart not found" })
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.size === size
    )
    
    if (itemIndex === -1) {
      return res.status(404).json({ status: "fail", message: "Item not found in cart" })
    }
    
    cart.items.splice(itemIndex, 1)
    await cart.save()
    
    res.status(200).json({ status: "success", message: "Item deleted successfully" })
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message })
  }
}

// 전체 카트 삭제 (옵션)
cartController.clearCart = async (req, res) => {
  try {
    const userId = req.userID
    await Cart.findOneAndDelete({ userId })
    res.status(200).json({ status: "success", message: "Cart cleared successfully" })
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message })
  }
}

module.exports = cartController