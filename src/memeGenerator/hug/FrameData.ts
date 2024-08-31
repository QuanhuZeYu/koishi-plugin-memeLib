import path from "path"
import { FrameData } from "src/interface/FrameData"
import fs from 'fs/promises'

const userLocs:FrameData[] = [
    {x:108,y:15},{x:107,y:14},{x:104,y:16},{x:102,y:14},{x:104,y:15},
    {x:108,y:15},{x:108,y:15},{x:103,y:16},{x:102,y:15},{x:104,y:14},
]
const selfLocs:FrameData[] =[
    {x:78,y:120},{x:115,y:130},{x:0,y:0},{x:110,y:100},{x:80,y:100},
    {x:75,y:115},{x:105,y:127},{x:0,y:0},{x:110,y:98},{x:80,y:105},
]
const rotateNum:number[] = [-48,-18,0,38,31,-43,-22,0,34,35]

const loadImg = async function() {
    const imagePath = path.resolve(__dirname,'images')
    const images = await fs.readdir(imagePath)  // 读取文件夹内所有文件名
    const pngBuffers = []
    images.map(async (fileName,i)=>{
        if(fileName.endsWith('.png')){
            const img = path.resolve(imagePath,fileName)
            const imgBuffer = await fs.readFile(img)
            pngBuffers.push(imgBuffer)
        }
    })
}