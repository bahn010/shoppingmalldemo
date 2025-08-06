import React, { Component } from "react";
import { Button } from "react-bootstrap";
import "../App.css";
import "../common/style/common.style.css";

const CLOUDNAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOADPRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

class CloudinaryUploadWidget extends Component {
  componentDidMount() {
    // 환경변수 검증
    if (!CLOUDNAME || !UPLOADPRESET) {
      console.error("Cloudinary 환경변수가 설정되지 않았습니다:", {
        CLOUDNAME,
        UPLOADPRESET
      });
      return;
    }

    try {
      var myWidget = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUDNAME,
          uploadPreset: UPLOADPRESET,
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            console.log("Done! Here is the image info: ", result.info);
            const uploadedImageElement = document.getElementById("uploadedimage");
            if (uploadedImageElement) {
              uploadedImageElement.setAttribute("src", result.info.secure_url);
            }
            this.props.uploadImage(result.info.secure_url);
          } else if (error) {
            console.error("Upload error:", error);
          }
        }
      );

      const uploadWidgetElement = document.getElementById("upload_widget");
      if (uploadWidgetElement) {
        uploadWidgetElement.addEventListener(
          "click",
          function () {
            myWidget.open();
          },
          false
        );
      }
    } catch (error) {
      console.error("Cloudinary 위젯 초기화 오류:", error);
    }
  }

  render() {
    // 환경변수가 없으면 업로드 버튼을 비활성화
    if (!CLOUDNAME || !UPLOADPRESET) {
      return (
        <Button size="sm" className="ml-2" disabled>
          환경변수 설정 필요
        </Button>
      );
    }

    return (
      <Button id="upload_widget" size="sm" className="ml-2">
        Upload Image +
      </Button>
    );
  }
}

export default CloudinaryUploadWidget;
