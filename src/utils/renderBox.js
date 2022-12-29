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
  const warningAudio = new Audio();
  const warnAudio = new Audio();
  warningAudio.src = "ppip3.mp3";
  warnAudio.src = "ppip.mp3";

  // font configs
  const font = `${Math.max(
    Math.round(Math.max(ctx.canvas.width, ctx.canvas.height) / 40),
    14
  )}px Arial`;
  ctx.font = font;
  ctx.textBaseline = "top";
  let count = 0;
  let nowtime = 0;
  let comparetime = new Date();
  

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
      // draw border box.
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(Math.min(ctx.canvas.width, ctx.canvas.height) / 200, 2.5);
      ctx.strokeRect(x1, y1, width, height);

      const center_x = x1 + width / 2;
      const center_y = y1 + height / 2;

      if (klass == 'pedestrian'){
        nowtime = new Date();
        console.log(nowtime);
        console.log(comparetime);
        if ((center_y >= ctx.canvas.height * 0.5) && (ctx.canvas.width * 0.2 <= center_x <= ctx.canvas.width * 0.8) && (height >= ctx.canvas.height * 0.5)){
          count += 1;
          const difftime = (nowtime.getTime() - comparetime.getTime());
          console.log(difftime);
          if ((count >= 3) && difftime >= 2){
              warningAudio.play();
              console.log("warningAudio");
              comparetime = new Date();
          }
          else if((height >= ctx.canvas.height * 0.9) && (difftime >= 2) && (warningAudio.currentTime == 0)){
              warnAudio.play();
              console.log("warnAudio");
              comparetime = new Date();
          }
        }

        if (warningAudio.currentTime > 3){
          warningAudio.pause();
          warningAudio.currentTime = 0;
        }

        if(warnAudio.currentTime > 0){
          warnAudio.pause();
          warnAudio.currentTime = 0;
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
