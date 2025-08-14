import React from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Row, Col, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch } from "react-redux";
import { currencyFormat } from "../../../utils/number";
import { updateQty, deleteCartItem } from "../../../features/cart/cartSlice";
const CartProductCard = ({ item }) => {
  const dispatch = useDispatch();

  const handleQtyChange = (productId, size, value) => {
    const newQuantity = parseInt(value);
    const currentStock = item.productId.stock && item.productId.stock[size] !== undefined ? item.productId.stock[size] : 0;
    
    if (newQuantity > currentStock) {
      alert(`${item.productId.name} (${size})의 재고가 부족합니다.\n재고: ${currentStock}개, 요청: ${newQuantity}개`);
      return;
    }
    
    dispatch(updateQty({ productId, size, quantity: newQuantity }));
  };

  const deleteCart = (productId, size) => {
    dispatch(deleteCartItem({ productId, size }));
  };

  return (
    <div className="product-card-cart">
      <Row>
        <Col md={2} xs={12}>
          <img src={item.productId.image} width={112} alt="product" />
        </Col>
        <Col md={10} xs={12}>
          <div className="display-flex space-between">
            <h3>{item.productId.name}</h3>
            <button className="trash-button">
              <FontAwesomeIcon
                icon={faTrash}
                width={24}
                onClick={() => deleteCart(item.productId._id, item.size)}
              />
            </button>
          </div>

          <div>
            <strong>₩ {currencyFormat(item.productId.price)}</strong>
          </div>
          <div>Size: {item.size}</div>
          
          {/* 재고 상태 표시 */}
          <div className="stock-status">
            {item.productId.stock && item.productId.stock[item.size] !== undefined ? (
              item.productId.stock[item.size] >= item.quantity ? (
                <span className="stock-available">✓ 재고: {item.productId.stock[item.size]}개</span>
              ) : (
                <span className="stock-insufficient">⚠ 재고 부족: {item.productId.stock[item.size]}개 (요청: {item.quantity}개)</span>
              )
            ) : (
              <span className="stock-unknown">재고 정보 없음</span>
            )}
          </div>
          
          <div>Total: ₩ {currencyFormat(item.productId.price * item.quantity)}</div>
          <div>
            Quantity:
            <Form.Select
              onChange={(event) =>
                handleQtyChange(item.productId._id, item.size, event.target.value)
              }
              required
              value={item.quantity}
              key={`${item.productId._id}-${item.size}-${item.quantity}`}
              className="qty-dropdown"
              disabled={item.productId.stock && item.productId.stock[item.size] !== undefined && item.productId.stock[item.size] === 0}
            >
              {(() => {
                const maxStock = item.productId.stock && item.productId.stock[item.size] !== undefined ? item.productId.stock[item.size] : 0;
                const options = [];
                
                for (let i = 1; i <= Math.min(10, maxStock); i++) {
                  options.push(
                    <option key={i} value={i}>{i}</option>
                  );
                }
                
                return options;
              })()}
            </Form.Select>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CartProductCard;
