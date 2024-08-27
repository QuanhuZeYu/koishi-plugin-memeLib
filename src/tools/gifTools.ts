import Ffmpeg from 'fluent-ffmpeg';
import fs from 'node:fs'
import path from "node:path";
import { PassThrough } from 'node:stream';

export interface FrameData {
    x:number
    y:number
    width:number
    height:number
}

/**
 * 检查并创建输出路径
 * @param dirPath 要检查或创建的目录路径
 */
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`目录已创建: ${dirPath}`);
  } else {
    // console.log(`目录已存在: ${dirPath}`);
  }
}

async function saveGifToFile(gifBuffer: Buffer, outputPath: string): Promise<void> {
  try {
    // 验证 GIF buffer
    if (!Buffer.isBuffer(gifBuffer) || gifBuffer.length === 0) {
      throw new Error('提供的 GIF buffer 无效');
    }

    // 验证输出路径
    const resolvedPath = path.resolve(outputPath);
    if (path.dirname(resolvedPath) === resolvedPath) {
      throw new Error('输出路径无效或没有目录');
    }

    // 确保目录存在
    const dir = path.dirname(resolvedPath);
    await fs.promises.mkdir(dir, { recursive: true });

    // 写入 GIF buffer 到文件
    await fs.promises.writeFile(resolvedPath, gifBuffer);
    console.log(`GIF 已保存到 ${resolvedPath}`);
  } catch (error:any) {
    console.error('保存 GIF 时发生错误:', error.message);
    // 重新抛出错误以便上层调用处理
    throw error;
  }
}

// 从 Buffer 提取 GIF 的所有帧
function extractGifFramesFromBuffer(gifBuffer: Buffer, outputDir: string): Promise<void> {
  ensureDirectoryExists(outputDir)
  
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(gifBuffer);

    Ffmpeg()
      .input(inputStream)
      .inputFormat('gif')
      .output(path.join(outputDir, 'frame_%03d.png'))
      .outputOptions('-vf', 'fps=15') // 提取每帧
      .on('end', () => {
        console.log('帧提取完成');
        resolve();
      })
      .on('error', (err) => {
        console.error('提取帧时发生错误:', err);
        reject(err);
      })
      .run();
  });
}


const gifTools = {saveGifToFile, extractGifFramesFromBuffer}

export default gifTools