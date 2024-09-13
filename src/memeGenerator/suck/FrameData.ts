// locs = [(82, 100, 130, 119), (82, 94, 126, 125), (82, 120, 128, 99), (81, 164, 132, 55),
//     (79, 163, 132, 55), (82, 140, 127, 79), (83, 152, 125, 67), (75, 157, 140, 62),
//     (72, 165, 144, 54), (80, 132, 128, 87), (81, 127, 127, 92), (79, 111, 132, 108)]

import path from "path";
import { ComposeJoin, FrameData } from "../../interface/InterfaceData";
import tools from "../../tools/_index";
import fs from 'fs'

export const baseFrameData:FrameData[] = [
    {x:82,y:100,width:130,height:119},
    {x:82,y:94,width:126,height:125},
    {x:82,y:120,width:128,height:99},
    {x:81,y:164,width:132,height:55},
    {x:79,y:163,width:132,height:55},
    {x:82,y:140,width:127,height:79},
    {x:83,y:152,width:125,height:67},
    {x:75,y:157,width:140,height:62},
    {x:72,y:162,width:144,height:54},
    {x:80,y:132,width:128,height:87},
    {x:81,y:127,width:127,height:92},
    {x:79,y:111,width:132,height:108},
]

async function suck(imgBuf:Buffer):Promise<Buffer> {
    const b_ = await tools.imageTools.isGif(imgBuf)
    if(!b_) {
        return await processStatic(imgBuf)
    } else if(b_) {
        return await processGif(imgBuf)
    }
}

async function processStatic(img:Buffer) {
    const srcs = await loadAllImg()
    const result:Buffer[] = []
    for(let i=0;i<baseFrameData.length;i++) {
        const frame = baseFrameData[i]
        const join:ComposeJoin[] = [
            {img:srcs[i], frameData:{}},
            {img:img, frameData:{x:frame.x, y:frame.y, width:frame.width, height:frame.height,blendOption:"dest-over",resizeBackground:{r:255,g:255,b:255,alpha:0}}}
        ]
        const result_ = await tools.imageTools.compose(join)
        result.push(result_)
    }
    return await tools.gifTools.pngsToGifBuffer_ffmpeg(result)
}

async function processGif(gif:Buffer) {
    const srcs = await loadAllImg()
    const result:Buffer[] = []
    const [input1, input2] = await tools.gifTools.align2Gif(srcs, gif)
    for(let i=0;i<input1.length;i++) {
        const src = input1[i]
        const index = i%baseFrameData.length
        const frame = baseFrameData[index]
        const join:ComposeJoin[] = [
            {img:src, frameData:{}},
            {img:input2[i],frameData:{x:frame.x, y:frame.y, width:frame.width, height:frame.height,blendOption:"dest-over",resizeBackground:{r:255,g:255,b:255,alpha:0}}}
        ]
        const result_ = await tools.imageTools.compose(join)
        result.push(result_)
    }
    return await tools.gifTools.pngsToGifBuffer_ffmpeg(result)
}

async function loadAllImg() {
    const imagePath = path.resolve(__dirname, './images')
    const images = await tools.imageTools.loadAllImageFPath(imagePath)
    return images
}

export default suck