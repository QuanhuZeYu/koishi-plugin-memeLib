import path from "path";
import memelibData from "../../Data";
import { ComposeJoin } from "../../interface/InterfaceData";
import { FrameData } from "../../interface/InterfaceData";

export const frameData: FrameData = { x: 15, y: 100, width: 441, height: 441, blendOption: "dest-over" }


async function clown(input: Buffer) {
    const { baseData, tools } = memelibData
    const { memeGenDir, getSharp, getLogger } = baseData
    const isGif = tools.imageTools.isGif(input)
    if (isGif) {
        return await gifProcess(input)
    } else if (tools.imageTools.isPng(input) || tools.imageTools.isJpg(input)) {
        return await staticProcess(input)
    }
}

async function staticProcess(input: Buffer) {
    const { baseData, tools } = memelibData
    const { memeGenDir, getSharp, getLogger } = baseData
    const src = await loadImage()

    const join: ComposeJoin[] = [
        { img: src, frameData: {} },
        { img: input, frameData: frameData }
    ]
    const result = await tools.imageTools.compose(join)
    return result
}

async function gifProcess(input: Buffer) {
    const result: Buffer[] = []
    const { baseData, tools } = memelibData
    const { memeGenDir, getSharp, getLogger } = baseData
    const src = await loadImage()

    const pngs = await tools.gifTools.extraGIF(input)
    for (let i = 0; i < pngs.length; i++) {
        const frame = pngs[i];
        const join: ComposeJoin[] = [
            { img: src, frameData: {} },
            { img: frame, frameData: frameData }
        ]
        const resultFrame = await tools.imageTools.compose(join)
        result.push(resultFrame)
    }
    return result
}

async function loadImage() {
    const { baseData, tools } = memelibData
    const { memeGenDir, getSharp, getLogger } = baseData

    const imagePath = path.resolve(memeGenDir, 'clown', 'images', '0.png')
    const imageBuffer = await tools.imageTools.loadImageFPath(imagePath)
    return imageBuffer
}

export default clown