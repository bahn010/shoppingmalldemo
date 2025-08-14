import React from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Row, Col, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch } from "react-redux";
import { currencyFormat } from "../../../utils/number";
import { updateQty, deleteCartItem, getCartList } from "../../../features/cart/cartSlice";
const CartProductCard = ({ item }) => {
  const dispatch = useDispatch();

  const handleQtyChange = (productId, size, value) => {
    dispatch(updateQty({ productId, size, quantity: parseInt(value) }))
      .then(() => {
        // 수량 변경 후 카트 목록 새로고침
        dispatch(getCartList());
      });
  };

  const deleteCart = (productId, size) => {
    dispatch(deleteCartItem({ productId, size }))
      .then(() => {
        // 삭제 후 카트 목록 새로고침
        dispatch(getCartList());
      });
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
              defaultValue={item.quantity}
              className="qty-dropdown"
              disabled={item.productId.stock && item.productId.stock[item.size] !== undefined && item.productId.stock[item.size] === 0}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
              <option value={9}>9</option>
              <option value={10}>10</option>
            </Form.Select>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CartProductCard;
