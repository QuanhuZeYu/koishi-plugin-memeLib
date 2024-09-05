function mergeBuffers(buffers: Buffer[]): Buffer {
    // 计算所有 Buffer 的总长度
    const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
    
    // 创建一个新的 Buffer，其大小为总长度
    const mergedBuffer = Buffer.alloc(totalLength);
    
    // 当前写入位置的指针
    let offset = 0;

    // 将每个 Buffer 的内容复制到新的 Buffer 中
    for (const buffer of buffers) {
        buffer.copy(mergedBuffer, offset);
        offset += buffer.length; // 更新写入位置的指针
    }

    return mergedBuffer;
}

const bufferTools = {
    mergeBuffers
}

export default bufferTools