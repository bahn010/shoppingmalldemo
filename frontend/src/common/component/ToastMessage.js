import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { clearToastMessage } from "../../features/common/uiSlice";

const ToastMessage = () => {
  const { toastMessage } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (toastMessage && toastMessage.message !== "" && toastMessage.status !== "") {
      const { message, status } = toastMessage;
      
      // 단순하게 토스트 표시
      toast[status](message);
      
      dispatch(clearToastMessage());
    }
  }, [toastMessage, dispatch]);
  
  return (
    <ToastContainer
      position="top-left"
      autoClose={3000}
      hideProgressBar={false}
      pauseOnHover={false}
      limit={1}
      closeButton={false}
    />
  );
};

export default ToastMessage;
