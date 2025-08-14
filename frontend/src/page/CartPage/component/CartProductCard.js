import React, { useState } from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Row, Col, Form, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { currencyFormat } from "../../../utils/number";
import { updateQty, deleteCartItem, updateQuantityOptimistically } from "../../../features/cart/cartSlice";

const CartProductCard = ({ item }) => {
  const dispatch = useDispatch();
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  
  // 해당 아이템의 업데이트 상태 확인
  const isUpdating = useSelector(state => 
    state.cart.updatingItems[`${item.productId._id}-${item.size}`]
  );

  const handleQtyChange = (productId, size, value) => {
    const newQuantity = parseInt(value);
    const currentStock = item.productId.stock && item.productId.stock[size] !== undefined ? item.productId.stock[size] : 0;
    
    if (newQuantity > currentStock) {
      alert(`${item.productId.name} (${size})의 재고가 부족합니다.\n재고: ${currentStock}개, 요청: ${newQuantity}개`);
      setLocalQuantity(item.quantity); // 원래 값으로 되돌리기
      return;
    }
    
    // 낙관적 업데이트 적용
    setLocalQuantity(newQuantity);
    dispatch(updateQuantityOptimistically({ productId, size, quantity: newQuantity }));
    
    // 서버에 업데이트 요청
    dispatch(updateQty({ productId, size, quantity: newQuantity }));
  };

  const deleteCart = (productId, size) => {
    dispatch(deleteCartItem({ productId, size }));
  };

  // 로컬 수량과 실제 수량이 다를 때 동기화
  React.useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  return (
    <div className={`product-card-cart ${isUpdating ? 'updating' : ''}`}>
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
              item.productId.stock[item.size] >= localQuantity ? (
                <span className="stock-available">✓ 재고: {item.productId.stock[item.size]}개</span>
              ) : (
                <span className="stock-insufficient">⚠ 재고 부족: {item.productId.stock[item.size]}개 (요청: {localQuantity}개)</span>
              )
            ) : (
              <span className="stock-unknown">재고 정보 없음</span>
            )}
          </div>
          
          <div className="total-price">
            Total: ₩ {currencyFormat(item.productId.price * localQuantity)}
            {isUpdating && (
              <Spinner 
                animation="border" 
                size="sm" 
                className="ms-2 updating-spinner"
              />
            )}
          </div>
          
          <div className="quantity-section">
            <span>Quantity:</span>
            <Form.Select
              onChange={(event) =>
                handleQtyChange(item.productId._id, item.size, event.target.value)
              }
              required
              value={localQuantity}
              key={`${item.productId._id}-${item.size}-${localQuantity}`}
              className={`qty-dropdown ${isUpdating ? 'updating' : ''}`}
              disabled={
                isUpdating || 
                (item.productId.stock && 
                 item.productId.stock[item.size] !== undefined && 
                 item.productId.stock[item.size] === 0)
              }
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
