import { useState, useRef } from "react";
import { Webcam } from "../utils/webcam";
const ButtonHandler = ({ cameraRef, videoRef }) => {
  const [streaming, setStreaming] = useState(null); // streaming state
  const inputVideoRef = useRef(null); // video input reference
  const webcam = new Webcam(); // webcam handler
  const audio = new Audio();
  audio.src = "https://github.com/khskhs6991/yolo_react/raw/master/ppip.mp3";
  // closing video streaming
  const closeVideo = () => {
    const url = videoRef.current.src;
    videoRef.current.src = ""; // restore video source
    URL.revokeObjectURL(url); // revoke url
    setStreaming(null); // set streaming to null
    inputVideoRef.current.value = ""; // reset input video
    videoRef.current.style.display = "none"; // hide video
  };
  return (
    <div className="btn-container">
      <button
        onClick={() => {
          audio.play();

          // if not streaming
          if (streaming === null || streaming === "image") {
            // closing image streaming
            if (streaming === "image") closeImage();
            webcam.open(cameraRef.current); // open webcam
            cameraRef.current.style.display = "block"; // show camera
            setStreaming("camera"); // set streaming to camera
          }
          // closing video streaming
          else if (streaming === "camera") {
            webcam.close(cameraRef.current);
            cameraRef.current.style.display = "none";
            setStreaming(null);
          } else alert(`비디오를 끄고 실행해주세요. : ${streaming}`); // if streaming video
        }}
      >
        <img src="https://github.com/JISOO0213/Visual_impairment_assistant/raw/main/VisuAl.png" />
      </button>
    </div>
  );
};
export default ButtonHandler;