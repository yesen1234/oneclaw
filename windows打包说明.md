如果需要删除原来配置可以执行以下命令删除openclaw原始配置
Remove-Item -Recurse -Force "$env:USERPROFILE\.openclaw"



打包具体步骤如下:

配置git从https访问，防止没有权限下载依赖
git config --global url."https://github.com/".insteadOf "git@github.com:"
git config --global url."https://github.com/".insteadOf "ssh://git@github.com/"

在项目根目录依次执行打包
# 0. 设定目标平台架构（本终端会话有效）
$env:ONECLAW_TARGET = "win32-x64"

# 1. 构建主程序 + Chat UI
npm run build

# 2. 为 win32-x64 生成运行时 + openclaw 资源
npm run package:resources -- --platform win32 --arch x64

# 3. 用 electron-builder 打 Windows x64 安装包，使用国内源
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
$env:ELECTRON_BUILDER_BINARIES_MIRROR = "https://npmmirror.com/mirrors/electron-builder-binaries/"
electron-builder --win --x64 --config.directories.output=out/win32-x64 --publish never


# 如果安装的时候没有将openclaw加入环境变量，可以这样执行，C:\Users\36274换成用户目录
"C:\Users\36274\AppData\Local\Programs\OneClaw\resources\resources\runtime\node.exe" "C:\Users\36274\AppData\Local\Programs\OneClaw\resources\resources\gateway\node_modules\openclaw\openclaw.mjs" gateway status


