import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Loader from "./components/loader";
import ButtonHandler from "./components/btn-handler";
import { detectImage, detectVideo } from "./utils/detect";
import "./style/App.css";

const App = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }); // init model & input shape

  // references
  const imageRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // model configs
  const modelName = "yolov5s";
  const classThreshold = 0.2;

  useEffect(() => {
    tf.ready().then(async () => {
      const yolov5 = await tf.loadGraphModel(
        `${window.location.origin}/${modelName}_200_1st_web_model/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions }); // set loading fractions
          },
        }
      ); // load model

      // warming up model
      const dummyInput = tf.ones(yolov5.inputs[0].shape);
      const warmupResult = await yolov5.executeAsync(dummyInput);
      tf.dispose(warmupResult); // cleanup memory
      tf.dispose(dummyInput); // cleanup memory

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov5,
        inputShape: yolov5.inputs[0].shape,
      }); // set model & input shape
    });
  }, []);

  return (
    <div className="App">
      {loading.loading && <Loader> APP 실행 준비 중 {(loading.progress * 100).toFixed(2)}%</Loader>}
      <div className="header">
        <img src= "https://github.com/JISOO0213/Visual_impairment_assistant/raw/main/VisuAl.png"/>
        
        {/* <h1>위험 감지 음성 출력 App</h1> */}
        <br/>
        <p>
          실시간 장애물 탐지 앱 
        </p>
        <p>
          Serving : <code className="code">{modelName}+ 인도주행</code>
        </p>
        <br/>
        <p>
          <b>이 서비스는 크롬에서 사용할 수 없습니다. 이거 왜 됨??</b>
        </p>
        <br/>
      </div>

      <div className="content">
        <video
          autoPlay
          muted
          ref={cameraRef}
          onPlay={() => detectVideo(cameraRef.current, model, classThreshold, canvasRef.current)}
        />
        <video
          autoPlay
          muted
          ref={videoRef}
          onPlay={() => detectVideo(videoRef.current, model, classThreshold, canvasRef.current)}
        />
        <canvas width={1920} height={1080} ref={canvasRef} />
      </div>

      <ButtonHandler cameraRef={cameraRef} videoRef={videoRef} />
    </div>
  );
};

export default App;
