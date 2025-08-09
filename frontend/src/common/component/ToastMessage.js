import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { clearToastMessage } from "../../features/common/uiSlice";

const ToastMessage = () => {
  const { toastMessage } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const location = useLocation();
  
  // 페이지 이동 시 모든 토스트 제거
  useEffect(() => {
    toast.dismiss();
  }, [location.pathname]);
  
  useEffect(() => {
    if (toastMessage && toastMessage.message !== "" && toastMessage.status !== "") {
      const { message, status } = toastMessage;
      
      // 기존 토스트 제거
      toast.dismiss();
      
      // 토스트 표시 (텍스트만, 아이콘 중복 제거)
      const toastId = toast[status](message, {
        autoClose: 3000,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        pauseOnFocusLoss: false,
        closeButton: false,
      });
      
      // 백업 타이머: 3.5초 후 강제 제거 (혹시 autoClose가 작동하지 않을 경우)
      setTimeout(() => {
        toast.dismiss(toastId);
      }, 3500);
      
      dispatch(clearToastMessage());
    }
  }, [toastMessage, dispatch]);
  
  return (
    <ToastContainer
      position="top-left"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss={false}
      draggable={false}
      pauseOnHover={false}
      theme="light"
      limit={1}
      closeButton={false}
      toastStyle={{
        borderRadius: '8px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    />
  );
};

export default ToastMessage;
