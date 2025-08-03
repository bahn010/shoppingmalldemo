import React, { useEffect } from "react";
import { useLocation } from "react-router";
import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../common/component/Sidebar";
import Navbar from "../common/component/Navbar";
import ToastMessage from "../common/component/ToastMessage";
import { loginWithToken } from "../features/user/userSlice";
import { getCartQty } from "../features/cart/cartSlice";
import { clearToastMessage } from "../features/common/uiSlice";

const AppLayout = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);
  useEffect(() => {
    console.log("🔍 DEBUG - AppLayout useEffect triggered");
    console.log("🔍 DEBUG - About to dispatch loginWithToken");
    dispatch(loginWithToken());
  }, []);
  useEffect(() => {
    if (user) {
      dispatch(getCartQty());
    }
  }, [user]);

  // 페이지 이동 시 토스트 메시지 초기화
  useEffect(() => {
    dispatch(clearToastMessage());
  }, [location.pathname, dispatch]);
  return (
    <div>
      <ToastMessage />
      {location.pathname.includes("admin") ? (
        <Row className="vh-100">
          <Col xs={12} md={3} className="sidebar mobile-sidebar">
            <Sidebar />
          </Col>
          <Col xs={12} md={9}>
            {children}
          </Col>
        </Row>
      ) : (
        <>
          <Navbar user={user} />
          {children}
        </>
      )}
    </div>
  );
};

export default AppLayout;
