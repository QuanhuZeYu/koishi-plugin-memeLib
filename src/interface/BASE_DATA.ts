import { GifQualityList } from "./InterfaceData"

import path from "path";

export const Base_GifQuality:GifQualityList = {
    heigh:{color:256,bayer_scale:5},
    medium:{color:128,bayer_scale:3},
    low:{color:64,bayer_scale:1},
    veryLow:{color:32,bayer_scale:0}
}

export const BASE_DATA = {
    baseFps:15,
    frameData:{
        blendOption:{
            blend:"dest-over"
        }
    },
    gifQuality:Base_GifQuality
}

export const MY_PLUGIN_DIR = path.resolve(__dirname, "../");