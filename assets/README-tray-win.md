# Tray icon (Windows 深色任务栏)

Windows 打包后系统托盘图标若使用 `tray-icon@2x.png`（深色），在深色任务栏下会不显眼。

**处理方式**：在 `assets` 下增加**浅色**托盘图 `tray-icon-win@2x.png`，程序在 Windows 上会优先使用该图标。

- **尺寸**：与 `tray-icon@2x.png` 一致（建议 32×32 或 44×44 像素，@2x 即双倍分辨率）。
- **内容**：白色或浅灰 logo 轮廓、透明底，在深色背景上清晰可见即可。
- 若未提供此文件，Windows 仍使用 `tray-icon@2x.png`（可能不够显眼）。

制作方式示例：用设计工具打开 `tray-icon@2x.png`，反色或改为白/浅灰后另存为 `tray-icon-win@2x.png`。
