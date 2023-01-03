import labels from "./labels.json";

/**
 * Render prediction boxes
 * @param {HTMLCanvasElement} canvasRef canvas tag reference
 * @param {number} classThreshold class threshold
 * @param {Array} boxes_data boxes array
 * @param {Array} scores_data scores array
 * @param {Array} classes_data class array
 * @param {Array[Number]} ratios boxes ratio [xRatio, yRatio]
 */

export const renderBoxes = (
  warningAudio,
  warnAudio,
  soundcheck,
  canvasRef,
  classThreshold,
  boxes_data,
  scores_data,
  classes_data,
  ratios
) => {
  const ctx = canvasRef.getContext("2d");
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas

  const colors = new Colors();

  // font configs
  const font = `${Math.max(
    Math.round(Math.max(ctx.canvas.width, ctx.canvas.height) / 40),
    14
  )}px Arial`;
  ctx.font = font;
  ctx.textBaseline = "top";
  let count = 0;
  

  for (let i = 0; i < scores_data.length; ++i) {
    // filter based on class threshold
    if (scores_data[i] > classThreshold) {
      const klass = labels[classes_data[i]];
      const color = colors.get(classes_data[i]);
      const score = (scores_data[i] * 100).toFixed(1);

      let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
      x1 *= canvasRef.width * ratios[0];
      x2 *= canvasRef.width * ratios[0];
      y1 *= canvasRef.height * ratios[1];
      y2 *= canvasRef.height * ratios[1];
      const width = x2 - x1;
      const height = y2 - y1;

      // draw box.
      ctx.fillStyle = Colors.hexToRgba(color, 0.2);
      ctx.fillRect(x1, y1, width, height);
      ctx.strokeRect(ctx.canvas.width * 0.2, ctx.canvas.height * 0.5, ctx.canvas.width * 0.8 - ctx.canvas.width * 0.2, ctx.canvas.height * 0.5);
      // draw border box.
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(Math.min(ctx.canvas.width, ctx.canvas.height) / 200, 2.5);
      ctx.strokeRect(x1, y1, width, height);

      const center_x = x1 + width / 2;
      const center_y = y1 + height / 2;

      // ctx.beginPath();
      // ctx.arc(center_x, center_y, 10, 0, 2 * Math.PI);
      // ctx.stroke();

      if (klass == 'pedestrian'){
        if ((center_y >= ctx.canvas.height * 0.45) && (ctx.canvas.width * 0.2 <= center_x <= ctx.canvas.width * 0.8)){
          count += 1;
          if ((count >= 3) && (soundcheck % 6 == 0)){
            try {
              warnAudio.pause();
              warningAudio.play();
              console.log("warningAudio");
            } catch (error) {
              console.log('재생되는 소리가 없습니다.');
            }
          }
          else if((center_y >= ctx.canvas.height * 0.45) && (height >= ctx.canvas.height * 0.75)){
            if (soundcheck % 4 == 0){
              try {
                warningAudio.pause();
                warnAudio.play();
                console.log("warnAudio");
              } catch (error) {
                console.log('재생되는 소리가 없습니다.');
              }
            }
          }
        }
      }
      else if (klass == 'car' || klass == 'bus' || klass == 'truck') {
        if ((ctx.canvas.width * 0.45 <= center_x <= ctx.canvas.width * 0.55) && (height >= ctx.canvas.height * 0.15)){
          console.log('차량이 전방에 있습니다.');
        }
        else if (y2 >= ctx.canvas.height * 0.7){
          console.log('디폴트 값으로 차량이 있을 시 무조건 울립니다.');
        }
        else if ((center_x < 0.5) && (x2 <= ctx.canvas.width * 0.3) && (y2 <= ctx.canvas.height * 0.7) && (height >= ctx.canvas.height * 0.3)){
          console.log('차량이 왼쪽 사이드에 있습니다.');
        }
        else if ((center_x >= 0.5) && (x1 >= ctx.canvas.width * 0.7) && (y2 <= ctx.canvas.height * 0.7) && (height >= ctx.canvas.height * 0.3)){
          console.log('차량이 오른쪽 사이드에 있습니다.');
        }
      }

      // Draw the label background.
      ctx.fillStyle = color;
      const textWidth = ctx.measureText(klass + " - " + score + "%").width;
      const textHeight = parseInt(font, 10); // base 10
      const yText = y1 - (textHeight + ctx.lineWidth);
      ctx.fillRect(
        x1 - 1,
        yText < 0 ? 0 : yText, // handle overflow label box
        textWidth + ctx.lineWidth,
        textHeight + ctx.lineWidth
      );

      // Draw labels
      ctx.fillStyle = "#ffffff";
      ctx.fillText(klass + " - " + score + "%", x1 - 1, yText < 0 ? 0 : yText);
    }
  }
};

class Colors {
  // ultralytics color palette https://ultralytics.com/
  constructor() {
    this.palette = [
      "#FF3838",
      "#FF9D97",
      "#FF701F",
      "#FFB21D",
      "#CFD231",
      "#48F90A",
      "#92CC17",
      "#3DDB86",
      "#1A9334",
      "#00D4BB",
      "#2C99A8",
      "#00C2FF",
      "#344593",
      "#6473FF",
      "#0018EC",
      "#8438FF",
      "#520085",
      "#CB38FF",
      "#FF95C8",
      "#FF37C7",
    ];
    this.n = this.palette.length;
  }

  get = (i) => this.palette[Math.floor(i) % this.n];

  static hexToRgba = (hex, alpha) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgba(${[parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)].join(
          ", "
        )}, ${alpha})`
      : null;
  };
}
