function getCurTime() {
    const now = new Date(); // 获取当前时间的 Date 对象

    const HH = String(now.getHours()).padStart(2, '0');  // 小时
    const MM = String(now.getMinutes()).padStart(2, '0'); // 分钟
    const SS = String(now.getSeconds()).padStart(2, '0'); // 秒
    const ms = String(now.getMilliseconds()).padStart(3, '0'); // 毫秒，3 位数

    return `${HH}:${MM}:${SS}.${ms}`; // 格式化输出时间
}

export {
    getCurTime
}