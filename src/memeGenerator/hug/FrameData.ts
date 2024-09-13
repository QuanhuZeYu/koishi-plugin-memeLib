import path from "path"
import { ComposeJoin, FrameData } from "../../interface/InterfaceData"
import fs from 'fs/promises'
import timeIt from "../../tools/decorator/timmer"
import tools from "../../tools/_index"
import { Base_GifQuality, MY_PLUGIN_DIR } from "../../interface/BASE_DATA"
import Data from '../../Data'

const logger = tools.logger

const userLocs: FrameData[] = [
    { x: 108, y: 15, width: 120, height: 120 },
    { x: 107, y: 14, width: 120, height: 120 },
    { x: 104, y: 16, width: 120, height: 120 },
    { x: 102, y: 14, width: 120, height: 120 },
    { x: 104, y: 15, width: 120, height: 120 },
    { x: 108, y: 15, width: 120, height: 120 },
    { x: 108, y: 15, width: 120, height: 120 },
    { x: 103, y: 16, width: 120, height: 120 },
    { x: 102, y: 15, width: 120, height: 120 },
    { x: 104, y: 14, width: 120, height: 120 },
];

const selfLocs: FrameData[] = [
    { x: 78, y: 120, rotate: -48, width: 120, height: 120 },
    { x: 115, y: 130, rotate: -18, width: 120, height: 120 },
    { x: 0, y: 0, rotate: 0, width: 120, height: 120 },
    { x: 110, y: 100, rotate: 38, width: 120, height: 120 },
    { x: 80, y: 100, rotate: 31, width: 120, height: 120 },
    { x: 75, y: 115, rotate: -43, width: 120, height: 120 },
    { x: 105, y: 127, rotate: -22, width: 120, height: 120 },
    { x: 0, y: 0, rotate: 0, width: 120, height: 120 },
    { x: 110, y: 98, rotate: 34, width: 120, height: 120 },
    { x: 80, y: 105, rotate: 35, width: 120, height: 120 },
];

export const hugFrameData = {
    user:userLocs,
    self:selfLocs
}


const craftHug =timeIt(async function craftHug(input1:Buffer,input2:Buffer) {
    const isGif = tools.imageTools.isGif
    // 2.判断是否有GIF
    const _b = isGif(input1) || isGif(input2)
    if (!_b) {
        // 3.1纯静态图流程
        const result_ = await processStatic(input1,input2)
        return result_
    } else {
        // 3.2含有GIF的处理流程
        const result_ = await processGif(input1,input2)
        return result_ as any as Buffer
    }
})

/**
 * 传进来的两个参数必须是单张图像的Buffer
 * */
async function processStatic(input1: Buffer, input2: Buffer):Promise<Buffer> {
    const result = []
    const srcs = await loadImg()
    const self = hugFrameData.self
    const user = hugFrameData.user
    // 循环底图帧数次
    for (const [index, src] of srcs.entries()) {
        // 拼接数据
        const join:ComposeJoin[] = [
            {img:src,frameData:{}},
            {img:input2, frameData:{...user[index],blendOption:"dest-over"}},
            {img:input1, frameData:{...self[index],blendOption:"dest-over"}},
        ]
        const composed = await tools.imageTools.compose(join)
        result.push(composed)
    }
    // 将png序列转换成GIF
    const gif = await tools.gifTools.pngsToGifBuffer_ffmpeg(result)
    return gif
}


async function processGif(input1:Buffer,input2:Buffer):Promise<Buffer|void> {
    // 资源加载
    const isGif = tools.imageTools.isGif
    const align2gif = tools.gifTools.align2Gif
    const png2gif = tools.gifTools.pngsToGifBuffer_ffmpeg
    const srcs = await loadImg()
    const srcsCount = srcs.length
    const self = hugFrameData.self
    const user = hugFrameData.user
    let gif1, gif2
    const result:Buffer[] = []
    // 判断输入的两个参数是否是GIF
    if(isGif(input1)) {gif1 = input1}
    if(isGif(input2)) {gif2 = input2}
    // 1.第一种情况 input1 是GIF => 该情况只需要对齐 srcs 和 gif1 即可
    if(gif1 !== undefined && gif2 === undefined) {
        const [target,input,forTime] = await align2gif(srcs,gif1)
        let index = 0
        // 开始遍历处理合成
        for(const src of target) {
            // 组装合成数据
            const join:ComposeJoin[] = [
                {img:input[index],frameData:user[index%srcsCount]},
                {img:input2,frameData:self[index%srcsCount]},
            ]
            index++;
            const composed = await tools.gifTools.compose(src,join)
            result.push(composed)
        }
        const result_ = await png2gif(result,undefined,Base_GifQuality.heigh)
        return result_
    }
    // 2.第二种情况 input 不是GIF => 该情况只需要对齐 srcs gif2
    else if(gif1 === undefined && gif2 !== undefined) {
        const [target,input,fortime] = await align2gif(srcs,gif2)
        let index = 0
        for(const src of target) {
            const curIndex = index%srcsCount
            const join:ComposeJoin[] = [
                {img:input[index],frameData:user[curIndex]},
                {img:input1,frameData:self[curIndex]},
            ]
            index++
            const composed = await tools.gifTools.compose(src,join)
            result.push(composed)
        }
        const result_ = await png2gif(result,undefined,Base_GifQuality.heigh)
        return result_
    }
    // 3.第三种情况 两者都是 gif
    else if(gif1 !== undefined && gif2 !== undefined) {
        const align3gif = tools.gifTools.align3Gif
        const [target,input1,input2,forTime] = await align3gif(srcs,gif1,gif2)
        let index = 0
        for(const src of target) {
            const curIndex = index%srcsCount
            const join:ComposeJoin[] = [
                {img:input2[index],frameData:user[curIndex]},
                {img:input1[index],frameData:self[curIndex]},
            ]
            index++
            const composed = await tools.gifTools.compose(src,join)
            result.push(composed)
        }
        const result_ = await png2gif(result)
        return result_
    }
}

export const loadImg = timeIt(async function loadImg() {
    const imagePath = path.resolve(Data.baseData.memeGenDir, 'hug', 'images');
    const images = await tools.imageTools.loadAllImageFPath(imagePath)
    return images
})

export default craftHug