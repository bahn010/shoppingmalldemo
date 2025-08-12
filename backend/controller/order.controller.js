const orderController = {}
const Order = require("../model/order")
const Cart = require("../model/cart")
const Product = require("../model/product")

orderController.createOrder = async (req, res) => {
  try {
    const userId = req.userID
    const { shippingAddress, contact, totalPrice } = req.body
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "사용자 인증이 필요합니다." 
      })
    }
    
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product',
      select: '_id name price stock'
    })
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "장바구니가 비어있습니다." })
    }

    const orderData = {
      userId,
      shippingAddress,
      contact,
      totalPrice,
      status: "preparing",
      items: cart.items.map(item => ({
        productId: item.productId._id,
        size: item.size,
        quantity: item.quantity,
        price: item.productId.price
      }))
    }

    const order = await Order.create(orderData)
    console.log('order 내역 생성 성공!!!', order)

    // 생성된 order를 통해 재고 차감
    for (const item of order.items) {
      console.log('=== 재고 차감 시작 ===');
      console.log('Order item:', item);
      console.log('Product ID:', item.productId);
      console.log('Size:', item.size);
      console.log('Quantity:', item.quantity);
      
      const product = await Product.findById(item.productId);
      console.log('Found product:', product ? 'Yes' : 'No');
      
      if (product) {
        console.log('Product stock:', product.stock);
        console.log('Stock for size:', product.stock?.[item.size]);
        console.log('Stock type:', typeof product.stock?.[item.size]);
        console.log('차감 전 재고:', product.stock[item.size]);
      } else {
        console.log('❌ Product not found!');
        continue;
      }
      
      try {
        product.stock[item.size] -= item.quantity;
        console.log('차감 후 재고:', product.stock[item.size]);
        console.log('차감된 수량:', item.quantity);
        
        await product.save();
        console.log('✅ 재고 업데이트 완료');
      } catch (error) {
        console.log('❌ 재고 차감 중 오류 발생:', error.message);
        console.log('Error details:', error);
      }
      console.log('=== 재고 차감 완료 ===\n');
    }
    
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    )

    res.status(200).json({
      success: true,
      message: "주문이 성공적으로 생성되었습니다.",
      order,
      updatedCart 
    })

  } catch (error) {
    console.error('주문 생성 오류:', error)
    
    let errorMessage = "주문 생성 중 오류가 발생했습니다."
    
    if (error.name === 'ValidationError') {
      errorMessage = "주문 데이터 검증에 실패했습니다."
    } else if (error.name === 'CastError') {
      errorMessage = "잘못된 데이터 형식입니다."
    }
    
    res.status(400).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

orderController.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userID }).populate({
      path: 'items.productId',
      model: 'Product',
      select: '_id name price image stock'
    })
    res.status(200).json({ success: true, orders })
  } catch (error) {
    res.status(400).json({ success: false, message: "주문 조회 중 오류가 발생했습니다." })
  }
}

orderController.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params
    const { status } = req.body
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true })
    res.status(200).json({ success: true, order })
  } catch (error) {
    res.status(400).json({ success: false, message: "주문 수정 중 오류가 발생했습니다." })
  }
}

orderController.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params
    await Order.findByIdAndDelete(orderId)
    res.status(200).json({ success: true, message: "주문이 성공적으로 삭제되었습니다." })
  } catch (error) {
    res.status(400).json({ success: false, message: "주문 삭제 중 오류가 발생했습니다." })
  }
}

module.exports = orderController

    
