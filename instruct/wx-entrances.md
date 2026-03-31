# WX 独立入口说明

本项目包含多个专为微信环境（微信小程序/微信浏览器）设计的独立入口页面。这些页面以 `-wx.md` 后缀命名，配置了 `sidebar: false` 和 `navbar: false`，以提供精简的、适合移动端和微信环境的访问体验。

## 入口列表

| 文件路径 | 页面标题 | 用途 |
|---------|---------|------|
| `docs/index-wx.md` | 📚 你科手册 | 微信版主页面，提供常用快捷入口、校园地图、新生指南等内容 |
| `docs/transport/bustimer-wx.md` | 🚌 校园巴士时刻表 | 微信版巴士时刻表与车辆位置查看页面 |
| `docs/canteen/canteen-wx.md` | 🍜 饭堂服务 | 微信版食堂服务页面 |

## 技术特点

- **无侧边栏和导航栏**：所有 wx 入口页面均设置 `sidebar: false` 和 `navbar: false`，以适应微信内嵌浏览器的显示环境
- **移动端优化**：针对移动端屏幕尺寸进行了样式调整
- **组件复用**：使用 `<ClientOnly>` 包装客户端组件，确保 SSR 兼容性
- **微信 JS-SDK 支持**：项目通过 `wx_helper.js` 和 `jweixin-1.6.0.js` 提供微信 JS-SDK 支持

## 微信相关资源

- `docs/.vuepress/public/wx_helper.js` - 微信辅助脚本
- 配置文件 `docs/.vuepress/config.ts` 中引入了微信 JS-SDK 相关脚本

## 新增 wx 入口

如需新增微信独立入口页面，请遵循以下规范：

1. 文件命名：使用 `原文件名-wx.md` 格式
2. 在 frontmatter 中添加：
   ```yaml
   ---
   sidebar: false
   navbar: false
   ---
   ```
3. 使用 `<ClientOnly>` 包装客户端组件
4. 确保页面内容适合移动端显示
