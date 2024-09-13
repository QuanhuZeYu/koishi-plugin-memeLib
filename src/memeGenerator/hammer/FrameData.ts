import path from "path";
import { MY_PLUGIN_DIR } from "../../interface/BASE_DATA";
import { ComposeJoin, FrameData } from "../../interface/InterfaceData";
import tools from "../../tools/_index";
import logger from '../../tools/logger'
import Data from '../../Data'

export const hammer_frameData:FrameData[] = [
    {x:62,y:143,width:158,height:113},
    {x:52,y:177,width:173,height:105},
    {x:42,y:192,width:192,height:92},
    {x:46,y:182,width:184,height:100},
    {x:54,y:169,width:174,height:110},
    {x:69,y:128,width:144,height:135},
    {x:65,y:130,width:152,height:124}
]


async function hammer(input:Buffer) {
    // 判断传入参数是GIF还是静态图像
    const isGif = tools.imageTools.isGif(input)
    if(isGif) {
        return await processGif(input)
    } else {
        return await processStatic(input)
    }
}

async function processStatic(input:Buffer):Promise<Buffer> {
    const frameDatas = hammer_frameData
    const result:Buffer[] = []
    const srcs = await loadHammerImgs()
    let index = 0
    for(const src of srcs) {
        const join:ComposeJoin[] = [
            {img:input,frameData:frameDatas[index]}
        ]
        index++
        const _result = await tools.gifTools.compose(src,join)
        result.push(_result)
    }
    const gif = await tools.gifTools.pngsToGifBuffer_ffmpeg(result)
    return gif
}


async function processGif(input:Buffer) {
    const frameDatas = hammer_frameData
    const srcs = await loadHammerImgs()
    const [target,input1,forTime] = await tools.gifTools.align2Gif(srcs,input)
    const result:Buffer[] = []
    let index = 0
    for(const src of target) {
        const curIndex = index%srcs.length
        const join:ComposeJoin[] = [
            {img:input1[index],frameData:frameDatas[curIndex]}
        ]
        index++
        const composed = await tools.gifTools.compose(src,join)
        result.push(composed)
    }
    const gif = await tools.gifTools.pngsToGifBuffer_ffmpeg(result)
    return gif
}


async function loadHammerImgs() {
    const imagesPath = path.resolve(Data.baseData.memeGenDir, 'hammer', 'images')
    const images = await tools.imageTools.loadImagesFromDir(imagesPath)
    return images
}


export default hammer