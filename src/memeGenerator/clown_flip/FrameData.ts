import path from "path"
import Data from "../../Data"
import { ComposeJoin, FrameData } from "../../interface/InterfaceData"

/**顺序：小丑，脸，手 */
export const frameData: FrameData = {
    x: 400, y: 190, width: 480, height: 480, rotate: 60, canvas: { p_rotate: { x: -43, y: 0, rotate: 0 } }
}
async function clownFlip(input: Buffer) {
    const { baseData, tools } = Data
    const { logger, sharp, memeGenDir } = baseData

    if (tools.imageTools.isGif(input)) {

    } else if (tools.imageTools.isPng(input) || tools.imageTools.isJpg(input)) {
        return await staticProccess(input)
    }
}

async function staticProccess(input: Buffer) {
    const { baseData, tools } = Data
    const { logger, sharp, memeGenDir } = baseData

    input = await tools.imageTools.cropToCircle(input)
    const { clown, hand } = await loadImage()
    const join: ComposeJoin[] = [
        { img: clown, frameData: {} },
        { img: input, frameData: { ...frameData } },
        { img: hand, frameData: {} }
    ]
    const result = await tools.imageTools.compose(join)
    return result
}

async function loadImage() {
    const { baseData, tools } = Data
    const { logger, sharp, memeGenDir } = baseData

    const imgPath = path.resolve(baseData.memeGenDir, 'clown_flip', 'images')
    const clown = await tools.imageTools.loadImageFPath(path.resolve(imgPath, '0.png'))
    const hand = await tools.imageTools.loadImageFPath(path.resolve(imgPath, '1.png'))
    return {
        clown: clown,
        hand: hand
    }
}

export default clownFlip