import { GifQualityList } from "./FrameData"

import path from "path";

export const BASE_DATA = {
    baseFps:15,
    frameData:{
        blendOption:{
            blend:"dest-over"
        }
    }
}

export const Base_GifQuality:GifQualityList = {
    heigh:{color:256,bayer_scale:5},
    medium:{color:128,bayer_scale:3},
    low:{color:64,bayer_scale:1}
}

export const MY_PLUGIN_DIR = path.join(__dirname);