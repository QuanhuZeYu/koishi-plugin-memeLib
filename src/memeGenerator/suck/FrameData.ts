// locs = [(82, 100, 130, 119), (82, 94, 126, 125), (82, 120, 128, 99), (81, 164, 132, 55),
//     (79, 163, 132, 55), (82, 140, 127, 79), (83, 152, 125, 67), (75, 157, 140, 62),
//     (72, 165, 144, 54), (80, 132, 128, 87), (81, 127, 127, 92), (79, 111, 132, 108)]

import path from "path";
import { ComposeJoin, FrameData } from "../../interface/InterfaceData";
import tools from "../../tools/_index";
import fs from 'fs'
import Data from '../../Data'

export const baseFrameData:FrameData[] = [
    // {x:82,y:90,width:130,height:140},
    // {x:82,y:84,width:126,height:148},
    // {x:82,y:97,width:128,height:128},
    // {x:82,y:112,width:128,height:117},
    // {x:79,y:130,width:132,height:113},
    // {x:82,y:133,width:127,height:92},
    // {x:83,y:142,width:125,height:100},
    // {x:75,y:147,width:140,height:85},
    // {x:72,y:145,width:144,height:87},
    // {x:80,y:122,width:128,height:100},
    // {x:81,y:117,width:127,height:105},
    // {x:79,y:101,width:132,height:121},
    {x:78,y:94,width:136,height:143},
    {x:81,y:87,width:130,height:149},
    {x:81,y:119,width:130,height:117},
    {x:76,y:163,width:140,height:63},
    {x:76,y:146,width:140,height:83},
    {x:81,y:134,width:130,height:95},
    {x:83,y:145,width:124,height:84},
    {x:75,y:150,width:140,height:79},
    {x:72,y:163,width:143,height:62},
    {x:79,y:120,width:130,height:105},
    {x:82,y:114,width:126,height:119},
    {x:81,y:87,width:133,height:152},
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
            {img:img, frameData:{x:frame.x, y:frame.y, width:frame.width, height:frame.height,blendOption:"dest-over",resizeBackground:{r:255,g:255,b:255,alpha:0},resizeFit:"fill"}}
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
            {img:input2[i],frameData:{x:frame.x, y:frame.y, width:frame.width, height:frame.height,blendOption:"dest-over",resizeBackground:{r:255,g:255,b:255,alpha:0},resizeFit:"fill"}}
        ]
        const result_ = await tools.imageTools.compose(join)
        result.push(result_)
    }
    return await tools.gifTools.pngsToGifBuffer_ffmpeg(result)
}

async function loadAllImg() {
    const imagePath = path.resolve(Data.baseData.memeGenDir, 'suck', 'images')
    const images = await tools.imageTools.loadAllImageFPath(imagePath)
    return images
}

export default suck