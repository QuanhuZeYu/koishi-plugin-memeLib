import path from "node:path"

import {FrameData} from "../../tools/gifTools"
import sharp from "sharp"
import Ffmpeg from "fluent-ffmpeg"
import { PassThrough, Readable } from "stream"

// 逐帧合成 - 单步函数
async function createFrame(inputImg: Buffer, handImg: Buffer, frame: FrameData): Promise<Buffer> {
  const avatar = await sharp(inputImg).resize(frame.width, frame.height).toBuffer();
  return await sharp(handImg)
    .composite([{ input: avatar, left: frame.x, top: frame.y, blend: "dest-over" }])
    .toBuffer();
}

// 读取手部图像
async function loadHandImages(frames: FrameData[]): Promise<Buffer[]> {
  return Promise.all(
    frames.map((_, index) =>
      sharp(path.join(__dirname, `images/${index}.png`)).toBuffer().catch((err) => {
        console.error(`读取图像时发生错误: ${err}`);
        throw err;
      })
    )
  );
}

// 生成 GIF
function generateGif(frameBuffers: Buffer[]): Promise<Buffer> {
  const outStream = new PassThrough();
  const buffers: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    Ffmpeg()
      .input(
        new Readable({
          read() {
            for (const buffer of frameBuffers) {
              this.push(buffer);
            }
            this.push(null);
          },
        })
      )
      .inputFormat("image2pipe")
      .inputFPS(15)
      .outputOptions("-vf", "fps=15")
      .toFormat("gif")
      .pipe(outStream)
      .on("error", reject);

    outStream.on("data", (chunk) => buffers.push(chunk));
    outStream.on("end", () => resolve(Buffer.concat(buffers)));
  });
}

// 主函数：生成 Petpet GIF
async function genPetpetGif(inputImg: Buffer): Promise<Buffer | void> {
  const frames: FrameData[] = [
    { x: 14, y: 20, width: 98, height: 98 },
    { x: 12, y: 33, width: 101, height: 85 },
    { x: 8, y: 40, width: 110, height: 76 },
    { x: 10, y: 33, width: 102, height: 84 },
    { x: 12, y: 20, width: 98, height: 98 },
  ];

  try {
    const hands = await loadHandImages(frames);
    const frameBuffers = await Promise.all(frames.map((frameData, index) => createFrame(inputImg, hands[index], frameData)));
    return await generateGif(frameBuffers);
  } catch (err) {
    console.error("生成 GIF 时发生错误:", err);
    throw err;
  }
}

export {genPetpetGif}