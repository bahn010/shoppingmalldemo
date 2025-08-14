import React, { useState } from "react";
import { Form, Modal, Button, Col, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { ORDER_STATUS } from "../../../constants/order.constants";
import { currencyFormat } from "../../../utils/number";
import { updateOrder } from "../../../features/order/orderSlice";

const OrderDetailDialog = ({ open, handleClose }) => {
  const selectedOrder = useSelector((state) => state.order.selectedOrder);
  const [orderStatus, setOrderStatus] = useState(selectedOrder.status);
  const dispatch = useDispatch();

  const handleStatusChange = (event) => {
    setOrderStatus(event.target.value);
  };
  const submitStatus = () => {
    dispatch(updateOrder({ id: selectedOrder._id, status: orderStatus }));
    handleClose();
  };

  if (!selectedOrder) {
    return <></>;
  }
  return (
    <Modal show={open} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Order Detail</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="order-detail-section">
          <div className="order-detail-title">주문 정보</div>
          <div className="order-detail-item">
            <span className="order-detail-label">예약번호:</span>
            <span className="order-detail-value">{selectedOrder.orderNum}</span>
          </div>
          <div className="order-detail-item">
            <span className="order-detail-label">주문날짜:</span>
            <span className="order-detail-value">{selectedOrder.createdAt.slice(0, 10)}</span>
          </div>
          <div className="order-detail-item">
            <span className="order-detail-label">이메일:</span>
            <span className="order-detail-value">{selectedOrder.userId?.email || 'N/A'}</span>
          </div>
          <div className="order-detail-item">
            <span className="order-detail-label">주소:</span>
            <span className="order-detail-value">{selectedOrder.shippingAddress || 'N/A'}</span>
          </div>
          <div className="order-detail-item">
            <span className="order-detail-label">연락처:</span>
            <span className="order-detail-value">{selectedOrder.contact || 'N/A'}</span>
          </div>
        </div>
        
                <div className="order-detail-section">
          <div className="order-detail-title">주문내역</div>
          <div className="overflow-x">
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.length > 0 &&
                  selectedOrder.items.map((item) => (
                    <tr key={item._id}>
                      <td>{item._id}</td>
                      <td>{item.productId.name}</td>
                      <td>{item.size}</td>
                      <td>{currencyFormat(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td>{currencyFormat(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                <tr>
                  <td colSpan={5}>총계:</td>
                  <td>{currencyFormat(selectedOrder.totalPrice)}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
        <Form onSubmit={submitStatus}>
          <Form.Group as={Col} controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Select value={orderStatus} onChange={handleStatusChange}>
              {ORDER_STATUS.map((item, idx) => (
                <option key={idx} value={item.toLowerCase()}>
                  {item}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <div className="order-button-area" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button
              variant="light"
              onClick={handleClose}
              className="order-button"
            >
              닫기
            </Button>
            <Button type="submit" className="btn-submit">저장</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default OrderDetailDialog;
