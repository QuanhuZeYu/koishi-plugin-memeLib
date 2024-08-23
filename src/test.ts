import path from "path";
import sharp from "sharp";
import fs from 'fs/promises'
import { promisify } from "util";
import { exec } from "child_process";

import { tools } from "@src/tools";
const CTC = tools.CropToCircle
const saveGifToFile = tools.saveGifToFile
import { Petpet } from "@src/memeGenerator/petpet";
import { buffer } from "stream/consumers";

const BASE_DIR = __dirname

const execAsync = promisify(exec);

async function createGifWithFFmpeg(inputPath: string, outputPath: string, options: {
    fps?: number,
    scale?: string,
    startTime?: string,
    duration?: string
  } = {}) {
    const {
      fps = 10,
      scale = '320:-1',
      startTime = '00:00:00',
      duration = '5'
    } = options;
  
    const command = `ffmpeg -i "${inputPath}" -ss ${startTime} -t ${duration} -vf "fps=${fps},scale=${scale}:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 "${outputPath}"`;
  
    try {
      const { stdout, stderr } = await execAsync(command);
      console.log('GIF created successfully');
      console.log('FFmpeg Output:', stdout);
    } catch (error) {
      console.error('Error creating GIF:', error);
      if (error instanceof Error) {
        console.error('FFmpeg Error Output:', error.message);
      }
    }
  }

async function test() {
  // const input = path.join(BASE_DIR, 'test.jpg')
  // const outpt = path.join(BASE_DIR, 'outpt.png')
  // const inBuf = CTC.loadImageFPath(input)
  // const outBuf = await CTC.cropToCircle(await inBuf)
  // if (outBuf instanceof Buffer) {
  //   await CTC.saveImageFBuffer(outBuf, path.join(BASE_DIR, 'out.png'))
  // }
  const ava = await CTC.loadImageFPath(path.join(__dirname, `test.jpg`))
  const cirAva = await CTC.cropToCircle(ava)
  if (cirAva instanceof Buffer) {
    const result = await Petpet.genPetpetGif(cirAva) as unknown as Buffer
    if (result instanceof Buffer){
      console.log(`生成成功，GIF大小:${result.length}`)
      saveGifToFile(result, path.join(__dirname, 'out/output.gif'))
    }
  }
}

test()