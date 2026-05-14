# 南科手册 / SUSTech Online Manual

![GitHub repo size](https://img.shields.io/github/repo-size/SUSTech-CRA/sustech-online-ng)
[![License](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](http://creativecommons.org/licenses/by-sa/4.0/)
[![Stars](https://img.shields.io/github/stars/SUSTech-CRA/sustech-online-ng?style=social)](https://github.com/SUSTech-CRA/sustech-online-ng)

Online manual for SUSTechers.

`南科手册` 为南科大学生和校友提供常用信息入口、校园生活指南、服务说明和微信小程序入口。这个仓库主要维护网站内容与 VuePress 构建流程。

## 目录

- [项目内容](#项目内容)
- [相关仓库](#相关仓库)
- [在线版本](#在线版本)
- [微信小程序](#微信小程序)
- [本地开发](#本地开发)
- [内容结构](#内容结构)
- [如何贡献](#如何贡献)
- [许可证](#许可证)

## 项目内容

仓库当前覆盖的内容包括：

- 新生入学、学习、生活、校园设施等主题内容
- 常用入口与校内服务导航
- VuePress 站点配置、脚本与构建流程
- 微信小程序相关入口与配套信息

## 相关仓库

- 主项目：[`SUSTech-CRA/sustech-online-ng`](https://github.com/SUSTech-CRA/sustech-online-ng)
- 镜像：[`Git@SUSTech`](https://mirrors.sustech.edu.cn/git/sustech-online/sustech-online-ng)
- 微信小程序：[`SUSTech-CRA/sustech-online-wxapp`](https://github.com/SUSTech-CRA/sustech-online-wxapp)
- 快讯网：[`SUSTech-CRA/sustech-online-daily-blog`](https://github.com/SUSTech-CRA/sustech-online-daily-blog)

## 在线版本

- 正式版本（master 分支构建）：https://sustech.online/
- 预发测试版本：Netlify / Cloudflare Pages

## 微信小程序

**微信小程序二维码**

![qrcode](./docs/qr-code.jpg)

更多小程序说明可参考站内 `/miniapp` 页面。

## 本地开发

### 环境要求

- Node.js v24
- pnpm

### 安装依赖

```bash
git clone https://github.com/SUSTech-CRA/sustech-online-ng.git
cd sustech-online-ng
pnpm install
```

### 常用命令

```bash
# 本地预览
pnpm run docs:dev

# 完整构建（包含脚本预处理）
pnpm run docs:build

# 快速构建
pnpm run docs:fastbuild

# 清理缓存与构建产物
pnpm run docs:clean

# 升级依赖
pnpm up
```

## 内容结构

```text
.
├── docs/
│   ├── about/
│   ├── calendar/
│   ├── canteen/
│   ├── contact/
│   ├── emergency/
│   ├── facility/
│   ├── life/
│   ├── miniapp/
│   ├── service/
│   ├── study/
│   └── transport/
├── instruct/
├── scripts/
├── tools/
└── package.json
```

## 如何贡献

### 方式 1：直接提交 Pull Request

1. Fork 本仓库
2. 完成修改
3. 发起 Pull Request

### 方式 2：代理提交

1. 进入 [南科手册 QQ 群](https://jq.qq.com/?_wv=1027&k=5D8EgDF): `905618908`
2. 按规范整理 Word 或 Markdown 文件
3. 提交给管理员协助上传

如果你不确定内容放在哪个目录，先提 issue 或 PR 草稿也可以。

## 许可证

This work is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).
