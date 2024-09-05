const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 获取当前工作目录
const currentDir = process.cwd();
// 计算上上层目录路径
const upperUpperDir = path.resolve(currentDir, '../../');

// 1. 前往上上层目录并运行 npm 命令
try {
    console.log(`Navigating to directory: ${upperUpperDir}`);
    process.chdir(upperUpperDir);
    console.log(`Running "npm run build memelib" in ${upperUpperDir}...`);
    execSync('npm run build memelib', { stdio: 'inherit' });
} catch (error) {
    console.error(`Error running npm build: ${error}`);
    process.exit(1);
}

// 2. 返回初始目录
process.chdir(currentDir);

// 递归遍历目录并复制 PNG 文件
function copyPngFiles(srcRoot, destRoot) {
    const entries = fs.readdirSync(srcRoot, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(srcRoot, entry.name);
        const destPath = path.join(destRoot, entry.name);

        if (entry.isDirectory()) {
            // 如果是目录，递归处理
            copyPngFiles(srcPath, destPath);
        } else if (entry.isFile() && path.extname(entry.name) === '.png') {
            // 如果是 PNG 文件，确保目标目录存在并复制文件
            if (!fs.existsSync(destRoot)) {
                fs.mkdirSync(destRoot, { recursive: true });
            }
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${srcPath} to ${destPath}`);
        }
    }
}

// 源目录和目标目录的根路径
const sourceRoot = path.join(currentDir, './src/memeGenerator');
const targetRoot = path.join(currentDir, './lib/memeGenerator');

try {
    copyPngFiles(sourceRoot, targetRoot);
    console.log('All PNG files copied successfully.');
} catch (error) {
    console.error(`Error copying files: ${error}`);
}
