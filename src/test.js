import path from "node:path";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import tools from "./tools/index";
const CTC = tools.imageTools;
import { Petpet } from "./memeGenerator/petpet/index";
export const MY_PLUGIN_DIR = path.join(__dirname);
const execAsync = promisify(exec);
// 测试生成meme
// async function test() {
//   // const input = path.join(BASE_DIR, 'test.jpg')
//   // const outpt = path.join(BASE_DIR, 'outpt.png')
//   // const inBuf = CTC.loadImageFPath(input)
//   // const outBuf = await CTC.cropToCircle(await inBuf)
//   // if (outBuf instanceof Buffer) {
//   //   await CTC.saveImageFBuffer(outBuf, path.join(BASE_DIR, 'out.png'))
//   // }
//   const ava = await CTC.loadImageFPath(path.join(__dirname, `test.jpg`))
//   const cirAva = await CTC.cropToCircle(ava)
//   if (cirAva instanceof Buffer) {
//     const result = await Petpet.genPetpetGif(cirAva) as unknown as Buffer
//     if (result instanceof Buffer){
//       console.log(`生成成功，GIF大小:${result.length}`)
//       tools.gifTools.saveGifToFile(result, path.join(__dirname, 'out/output.gif'))
//     }
//   }
// }
// 测试判断 buf 图片类型
// async function test() {
//   const gifPath = path.join(__dirname, 'out/output.gif')
//   const gifBuf = await tools.imageTools.loadImageFPath(gifPath)
//   let bo = tools.imageTools.isGif(gifBuf)
//   console.log(bo)
//   bo = tools.imageTools.isPng(gifBuf)
//   console.log(bo)
//   const jpgPath = path.join(__dirname, 'test.jpg')
//   const jpgBuf = await tools.imageTools.loadImageFPath(jpgPath)
//   let bo2 = tools.imageTools.isJpg(jpgBuf)
//   console.log(bo2)
//   bo2 = tools.imageTools.isGif(jpgBuf)
//   console.log(bo2)
// }
// 测试提取Gif帧
// async function test() {
//   const gifPath = path.join(__dirname, 'long.gif')  // gif文件路径
//   const gifBuf = await tools.imageTools.loadImageFPath(gifPath)  // 加载gif 获得gifBuffer
//   const time = await tools.gifTools.getGifDuration(gifPath)
//   console.log(time)
// }
// 测试读取帧总数
// async function test() {
//   const gifPath = path.join(__dirname, 'long.gif')  // gif文件路径
//   const gifBuf = await tools.imageTools.loadImageFPath(gifPath)  // 加载gif 获得gifBuffer
//   const total = await tools.gifTools.getGifFrameCount(gifBuf)
//   console.log(total)
// }
async function test() {
    const gifPath = path.join(__dirname, 'long.gif'); // gif文件路径
    const gifBuf = await tools.imageTools.loadImageFPath(gifPath); // 加载gif 获得gifBuffer
    const pet = await Petpet.genPetpetGif(gifBuf, true);
    if (pet instanceof Buffer) {
        tools.gifTools.saveGifToFile(pet, path.join(MY_PLUGIN_DIR, 'out/testGif.gif'));
    }
}
test();
