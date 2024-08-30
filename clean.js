const fs = require('fs');
const path = require('path');

// 获取当前脚本的路径
const scriptPath = path.resolve(__filename);
const scriptDir = path.dirname(scriptPath);

// 递归删除指定扩展名的文件
function deleteFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);

        if (fs.lstatSync(filePath).isDirectory()) {
            // 排除 node_modules 目录
            if (file !== 'node_modules') {
                deleteFiles(filePath); // 如果是目录，递归遍历
            }
        } else if ((file.endsWith('.js') || file.endsWith('.d.ts') || file.endsWith('.map')) && filePath !== scriptPath) {
            // 删除 .js 和 .d.ts 文件，排除自身
            fs.unlinkSync(filePath);
            console.log(`Deleted: ${filePath}`);
        }
    });
}

// 开始遍历并删除文件
deleteFiles(scriptDir);

console.log('清理完成');
