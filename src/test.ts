import path from "node:path";
import { promisify } from "node:util";
import { exec } from "node:child_process";

import  tools  from "./tools/_index";
const CTC = tools.imageTools
import { createFrame, frames, loadHandImages } from "./memeGenerator/petpet/FrameData";
import { MemeGenerator } from "../src";
import sharp from "sharp";
import logger, { readConfig } from "./tools/logger";
import { hugFrameData } from "./memeGenerator/hug/FrameData";
import { BASE_DATA } from "./interface/BASE_DATA";

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
//     const result = await MemeGenerator.Petpet(cirAva) as unknown as Buffer
//     if (result instanceof Buffer){
//       logger.info(`生成成功，GIF大小:${result.length}`)
//       tools.gifTools.saveGifToFile(result, path.join(__dirname, 'out/output.gif'))
//     }
//   }
// }


// 测试判断 buf 图片类型
// async function test() {
//   const gifPath = path.join(__dirname, 'out/output.gif')
//   const gifBuf = await tools.imageTools.loadImageFPath(gifPath)
//   let bo = tools.imageTools.isGif(gifBuf)
//   logger.info(bo)
//   bo = tools.imageTools.isPng(gifBuf)
//   logger.info(bo)

//   const jpgPath = path.join(__dirname, 'test.jpg')
//   const jpgBuf = await tools.imageTools.loadImageFPath(jpgPath)
//   let bo2 = tools.imageTools.isJpg(jpgBuf)
//   logger.info(bo2)
//   bo2 = tools.imageTools.isGif(jpgBuf)
//   logger.info(bo2)
// }


// 测试提取Gif帧
// async function test() {
//   const gifPath = path.join(__dirname, 'long.gif')  // gif文件路径
//   const gifBuf = await tools.imageTools.loadImageFPath(gifPath)  // 加载gif 获得gifBuffer
//   const time = await tools.gifTools.getGifDuration(gifPath)
//   logger.info(time)
// }


// 测试读取帧总数
// async function test() {
//   const gifPath = path.join(__dirname, 'long.gif')  // gif文件路径
//   const gifBuf = await tools.imageTools.loadImageFPath(gifPath)  // 加载gif 获得gifBuffer
//   const total = await tools.gifTools.getGifFrameCount(gifBuf)
//   logger.info(total)
// }

// 输入gif生成pet
// async function test() {
//   const gifPath = path.join(__dirname, '../tmp/long.gif')  // gif文件路径
//   const gifBuf = await tools.imageTools.loadImageFPath(gifPath)  // 加载gif 获得gifBuffer
//   // logger.info(`检测输入GIF: ${tools.imageTools.isGif(gifBuf)}`)
//   const pet = await MemeGenerator.petpet.craftPetpet(gifBuf, true)
//   if (pet instanceof Buffer) {
//     logger.info(`petpet gif size:${pet.length}`)
//     tools.gifTools.saveGifToFile(pet, path.join(MY_PLUGIN_DIR, '../out/testGif.gif'))
//   }
// }

// 测试手是否是透明
// async function test() {
//     const hands = await loadHandImages();
//     hands.map((hand,index)=>{
//         const handPath = path.resolve(MY_PLUGIN_DIR,`../out/hand${index}.png`)
//         tools.imageTools.saveImageFBuffer(hand,handPath)
//     })
// }

// 测试合成图像
// async function test() {
//     // sharp实例
//     const INST_SHARP = sharp
//     // 取第一个合成预处理数据
//     const frame = frames[0]
//     // 读一张手部图片
//     const hands = await loadHandImages()
//     const hand1 = hands[0]
//     // 读一张图片
//     const picPath = path.resolve(MY_PLUGIN_DIR, 'test.jpg')
//     let pic = await tools.imageTools.loadImageFPath(picPath)
//     // pic = await INST_SHARP(pic)
//     //     .resize(frame.width, frame.height)
//     //     .png()
//     //     .toBuffer()
//     // 合成图像
//     // const result = await sharp(hand1)
//     //     .composite([
//     //         {
//     //             input: pic,
//     //             left: frame.x,
//     //             top: frame.y,
//     //             blend: 'dest-over'
//     //         }
//     //     ])
//     //     .png().toBuffer()
//     // if (result instanceof Buffer) {
//     //     tools.imageTools.saveImageFBuffer(result, path.resolve(MY_PLUGIN_DIR, 'out/test.png'))
//     // }

//     const result = await createFrame(pic, hand1, frame)
//     if (result instanceof Buffer) {
//         tools.imageTools.saveImageFBuffer(result, path.resolve(MY_PLUGIN_DIR, '../out/test.png'))
//     }
// }

// 测试hug
import { loadImg as hugLoad } from "./memeGenerator/hug/FrameData";
import { ComposeJoin } from "./interface/InterfaceData";
import { Base_GifQuality, MY_PLUGIN_DIR } from "./interface/BASE_DATA";
async function test() { 
    const result = []
    const savePath = path.resolve(MY_PLUGIN_DIR,'../out')
    const loadImg = tools.imageTools.loadImageFPath
    const srcs = await hugLoad()
    const input1 = await loadImg(path.resolve(MY_PLUGIN_DIR,'../tmp/test.jpg'))
    const frameData1 = hugFrameData.user
    const input2 = await loadImg(path.resolve(MY_PLUGIN_DIR,'../tmp/test2.jpg'))
    const frameData2 = hugFrameData.self
    // 循环底图帧数次
    for (const [index, src] of srcs.entries()) {
        // 拼接数据
        const join:ComposeJoin[] = [
            {img:input1, frameData:frameData1[index]},
            {img:input2, frameData:frameData2[index]}
        ]
        const composed = await tools.gifTools.compose(src,join)
        result.push(composed)
    }
    // 将png序列转换成GIF
    const heighQ = BASE_DATA.gifQuality.heigh
    const lowQ = BASE_DATA.gifQuality.low
    const vlowQ = BASE_DATA.gifQuality.veryLow
    const gif1 = await tools.gifTools.pngsToGifBuffer_ffmpeg(result)
    const gif2 = await tools.gifTools.pngsToGifBuffer_ffmpeg(result,10)
    const gif3 = await tools.gifTools.pngsToGifBuffer_ffmpeg(result,undefined,heighQ)
    const gif4 = await tools.gifTools.pngsToGifBuffer_ffmpeg(result,undefined,lowQ)
    const gif5 = await tools.gifTools.pngsToGifBuffer_ffmpeg(result,undefined,vlowQ)
    logger.info(`gif1大小:${gif1.byteLength}`)
    logger.info(`gif2大小:${gif2.byteLength}`)
    logger.info(`gif3大小:${gif3.byteLength}`)
    logger.info(`gif4大小:${gif4.byteLength}`)
    logger.info(`gif5大小:${gif5.byteLength}`)
    // 保存该GIF
    await tools.gifTools.saveGifToFile(gif1,path.resolve(savePath,'huggif1.gif'))
    await tools.gifTools.saveGifToFile(gif2,path.resolve(savePath,'huggif2.gif'))
    await tools.gifTools.saveGifToFile(gif3,path.resolve(savePath,'huggif3.gif'))
    await tools.gifTools.saveGifToFile(gif4,path.resolve(savePath,'huggif4.gif'))
    await tools.gifTools.saveGifToFile(gif5,path.resolve(savePath,'huggif5.gif'))
    return
}

// 测试正则
// async function test() {
//     const message = '<div>Some content</div><p>Another content</p><span>More content</span>';

//     // 正则表达式匹配 `<` 和 `>` 之间的内容
//     const regex = /<([^>]+)>/g; // `[^>]` 表示匹配除 `>` 以外的任何字符

//     const result = [];
//     let match;

//     while ((match = regex.exec(message)) !== null) {
//         result.push(match[1]); // `match[1]` 是捕获组，即尖括号中的内容
//     }

//     logger.info(result); // 输出: ['div', 'p', 'span']
// }


test()