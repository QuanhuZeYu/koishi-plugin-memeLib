import fs from 'fs'
import path from "path";

export interface FrameData {
    x:number
    y:number
    width:number
    height:number
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


export {saveGifToFile}