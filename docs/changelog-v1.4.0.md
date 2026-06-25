# PixelForge V1.4.0 变更日志

> **版本**: v1.3.0 → v1.4.0 | **日期**: 2026-06-24 | **作者**: 产品经理

---

## 一、版本概述

V1.4.0 新增**智能扩图**（Outpaint）和**调色面板**，引入**作品广场**社区功能。

### 已知问题及修复

| 日期 | 问题 | 修复 |
|------|------|------|
| 06-24 | 广场查询 `like_count`/`reuse_count` 列不存在导致空白 | 移除缺失列引用的 select 字段 |
| 06-24 | 公开按钮调用 Vercel API 超时 | 改为浏览器直连 Supabase PATCH |
| 06-24 | 扩图不支持 CORS 的旧图片加载失败 | 三层降级：CORS → 代理 → blob |
| 06-24 | 扩图边缘割裂 | 模型限制（待升级更强 Outpaint 模型） |

---

## 二、新增功能

### 2.1 智能扩图

- 入口：Dashboard 悬停卡片 / 编辑页「扩图」按钮
- 支持 5%-50% 四向扩展，虚线框实时预览扩展范围
- 镜像边缘填充 + Qwen-Image-Edit-2509 模型生成
- 支持连续多轮扩图（扩后图自动成为新原图）
- Vercel 图片代理：绕过 S3 CORS 限制，服务端转发
- ⚠️ 已知限制：Qwen-Image-Edit 非原生 Outpaint 模型，极端比例下边缘融合可能不够自然

### 2.2 调色面板

- 编辑页新增「🖌️ 局部重绘 / 🎨 调色」模式切换
- 亮度 / 对比度 / 饱和度 / 色温 / 模糊 五维调整
- CSS 滤镜实时预览 + Canvas 导出

### 2.3 作品广场（轻社区）

- 顶部导航新增「发现」Tab
- 瀑布流展示已公开作品
- 「复用」一键填入 Prompt
- 公开机制：生成图后点「🌐 公开到社区广场」→ 生成分享链接 → 出现在广场

### 2.4 UI 优化

- 生成页精简：下载/公开按钮移至 Dashboard
- Dashboard 卡片悬停：编辑/裁剪/扩图/下载/公开/复用/删除 完整操作面板
- 扩图页：紫色虚线实时预览 + 尺寸对比提示

---

## 三、文件变更

### 新增
- `src/app/(app)/expand/[imageId]/page.tsx`
- `src/app/(app)/explore/page.tsx`
- `src/app/api/explore/route.ts`
- `src/app/api/proxy-image/route.ts`
- `src/app/api/siliconflow/route.ts`
- `src/components/editor/color-panel.tsx`

### 修改
- `src/app/(app)/generate/page.tsx` — 精简侧边栏 + 公开按钮迁移
- `src/app/(app)/dashboard/page.tsx` — 扩图/公开操作入口 + 收藏 z-index 修复
- `src/app/(app)/edit/[imageId]/page.tsx` — 调色模式 + 扩图入口
- `src/app/(app)/layout.tsx` — 导航加「发现」
- `src/lib/siliconflow.ts` — 升级 Qwen-Image-Edit-2509
- `src/proxy.ts` — 扩图/发现路由保护
- `prisma/schema.prisma` — is_public/like_count/reuse_count 字段

---

## 四、版本链

| 版本 | 主题 | 日期 |
|------|------|------|
| v1.0.0 | MVP 核心功能 | 2026-06-14 |
| v1.1.0 | 全功能（模板/翻译/去背景/裁剪/分享） | 2026-06-15 |
| v1.1.1 | 线上部署适配 | 2026-06-15 |
| v1.2.0 | 新手引导 + 操作进度 + UI 优化 | 2026-06-22 |
| v1.2.1 | Prompt 历史 + 格式导出 + Crop 修复 | 2026-06-22 |
| v1.3.0 | 反向生图（图推 Prompt + 风格变体） | 2026-06-24 |
| v1.4.0 | 智能扩图 + 调色面板 + 作品广场 | 2026-06-24 |
