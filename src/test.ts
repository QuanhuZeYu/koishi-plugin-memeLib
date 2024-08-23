import path from "path";
import { promisify } from "util";
import { exec } from "child_process";

import { tools } from "@src/tools";
const CTC = tools.CropToCircle
const saveGifToFile = tools.saveGifToFile
import { Petpet } from "@src/memeGenerator/petpet";


const BASE_DIR = __dirname

const execAsync = promisify(exec);

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