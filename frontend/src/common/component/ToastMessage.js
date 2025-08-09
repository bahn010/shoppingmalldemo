import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faExclamationTriangle, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { clearToastMessage } from "../../features/common/uiSlice";

const ToastMessage = () => {
  const { toastMessage } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const location = useLocation();
  
  // 커스텀 토스트 컨텐츠 생성 함수
  const createToastContent = (message, status) => {
    const icons = {
      success: faCheck,
      error: faTimes,
      warning: faExclamationTriangle,
      info: faInfoCircle
    };

    return (
      <div className="toast-content">
        <div className="toast-icon">
          <FontAwesomeIcon icon={icons[status]} />
        </div>
        <span>{message}</span>
      </div>
    );
  };

  // 페이지 이동 시 모든 토스트 제거
  useEffect(() => {
    toast.dismiss();
  }, [location.pathname]);
  
  useEffect(() => {
    if (toastMessage && toastMessage.message !== "" && toastMessage.status !== "") {
      const { message, status } = toastMessage;
      
      // 커스텀 컨텐츠와 함께 토스트 표시
      toast[status](createToastContent(message, status), {
        toastId: `${status}-${Date.now()}`, // 고유 ID 추가
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        autoClose: 4000,
        closeButton: true, 
      });
      
   
      dispatch(clearToastMessage());
    }
  }, [toastMessage, dispatch]);
  
  return (
    <ToastContainer
      position="top-left"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss={false}
      draggable={true}
      pauseOnHover={true}
      theme="light"
      limit={3}
      closeButton={true}
      enableMultiContainer={false}
      containerId="main-toast-container"
      toastClassName="custom-toast"
    />
  );
};

export default ToastMessage;
