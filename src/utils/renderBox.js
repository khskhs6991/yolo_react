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
  first,
  f_flag,
  l_flag,
  r_flag,
  w_flag,
  wi_flag,
  leftcar,
  rightcar,
  frontcar,
  warningAudio,
  warnAudio,
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
      // draw border box.
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(Math.min(ctx.canvas.width, ctx.canvas.height) / 200, 2.5);
      ctx.strokeRect(x1, y1, width, height);
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

      const center_x = x1 + width / 2;
      const center_y = y1 + height / 2;


      if ((klass == 'pedestrian') && (score > 40)){
        // 사람 3명 이상
        if (((ctx.canvas.width * 0.1 <= center_x) && (center_x <= ctx.canvas.width * 0.9)) && ((height >= ctx.canvas.height * 0.4) && (height < ctx.canvas.height * 0.7))){
          count += 1;
          if (count >= 3){
            wi_flag = true;
            w_flag = false;
          }
        }
        // 바로 앞에 사람
        else if(height >= ctx.canvas.height * 0.7){
          w_flag = true;
          wi_flag = false;
        }
        else{
          w_flag = false;
          wi_flag = false;
        }

        if (w_flag == true){
          if(((warnAudio.ended == true) || (warningAudio.ended == true)) || (first == 1)){
            warnAudio.play();
            warningAudio.pause();
            warningAudio.currentTime = 0;
          }
          else if(((warnAudio.ended == true) || (warningAudio.ended == true)) || (first != 1)){
            warnAudio.play();
            warningAudio.pause();
            warningAudio.currentTime = 0;
          }
        }

        else if (wi_flag == true){
          if(((warnAudio.ended == true) || (warningAudio.ended == true)) || (first == 1)){
            warnAudio.pause();
            warningAudio.play();
            warnAudio.currentTime = 0;
          }
          else if(((warnAudio.ended == true) || (warningAudio.ended == true)) || (first != 1)){
            warnAudio.pause();
            warningAudio.play();
            warnAudio.currentTime = 0;
          }
        }
      }
      
      
      else if ((klass == 'car' || klass == 'bus' || klass == 'truck') && (score > 40)) {
        if (((ctx.canvas.width * 0.4 <= center_x) && (center_x <= ctx.canvas.width * 0.6)) && (height >= ctx.canvas.height * 0.15)){
          f_flag = true;
          l_flag = false;
          r_flag = false;
        }
        else if ((center_x < ctx.canvas.width * 0.4) && (height >= ctx.canvas.height * 0.2)){
          f_flag = false;
          l_flag = true;
          r_flag = false;        
        }

        else if ((center_x > ctx.canvas.width * 0.6) && (height >= ctx.canvas.height * 0.2)){
          f_flag = false;
          l_flag = false;
          r_flag = true;         
        }

        else{
          f_flag = false;
          l_flag = false;
          r_flag = false;             
        }

        if (f_flag == true){
          if (((leftcar.ended == true) || (rightcar.ended == true) || (frontcar.ended == true)) || (first == 1)){
            frontcar.play();
            leftcar.pause();
            rightcar.pause();
            leftcar.currentTime = 0;
            rightcar.currentTime = 0;}
          else if (((leftcar.ended == true) || (rightcar.ended == true) || (frontcar.ended == true)) || (first != 1)){
            frontcar.play();
            leftcar.pause();
            rightcar.pause();
            leftcar.currentTime = 0;
            rightcar.currentTime = 0;}
        }

        else if (l_flag == true){
          if (((leftcar.ended == true) || (rightcar.ended == true) || (frontcar.ended == true)) || (first == 1)){
            frontcar.pause();
            leftcar.play();
            rightcar.pause();
            frontcar.currentTime = 0;
            rightcar.currentTime = 0;}
          else if (((leftcar.ended == true) || (rightcar.ended == true) || (frontcar.ended == true)) || (first != 1)){
            frontcar.pause();
            leftcar.play();
            rightcar.pause();
            frontcar.currentTime = 0;
            rightcar.currentTime = 0;}
        }

        else if (r_flag == true){
          if (((leftcar.ended == true) || (rightcar.ended == true) || (frontcar.ended == true)) || (first == 1)){
            rightcar.play();
            leftcar.pause();
            frontcar.pause();
            frontcar.currentTime = 0;
            leftcar.currentTime = 0;}
          else if (((leftcar.ended == true) || (rightcar.ended == true) || (frontcar.ended == true)) || (first != 1)){
            rightcar.play();
            leftcar.pause();
            frontcar.pause();
            frontcar.currentTime = 0;
            leftcar.currentTime = 0;}
        }
  
      }
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
