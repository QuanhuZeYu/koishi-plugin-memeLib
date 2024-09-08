import path from "path"
import tools from "../../tools/_index"
import { getSharp } from "../../context"
import { ComposeJoin } from "../../interface/InterfaceData"

async function distracted(imgBuf:Buffer) {
    return await processStatic(imgBuf)
}

async function processStatic(imgBuf:Buffer) {
    const sharp = getSharp()
    const layer = await tools.imageTools.loadImageFPath(path.resolve(__dirname, './images/1.png'))
    const label = await tools.imageTools.loadImageFPath(path.resolve(__dirname, './images/0.png'))
    imgBuf = await sharp(imgBuf).resize(500,500).toBuffer()
    const join:ComposeJoin[] = [
        {img:imgBuf,frameData:{x:0,y:0,blendOption:"over",opacity:0.5}},
        {img:layer,frameData:{x:0,y:0,blendOption:"over",opacity:0.5}},
        {img:label,frameData:{x:140,y:320,blendOption:"over",opacity:0.5}}
    ]
    const result = await tools.imageTools.compose(join)
    return result
}

export default distracted