# PixelForge V1.1.1 变更日志

> **版本**: v1.1.0 → v1.1.1 | **日期**: 2026-06-15 | **作者**: 产品经理

---

## 一、版本概述

V1.1.1 为**线上部署适配版本**，核心目标是解决本地 MVP 部署到 Vercel 后遇到的数据库连接、认证稳定性等线上环境问题。无新增功能。

---

## 二、架构变更

### 2.1 数据库：SQLite → Supabase PostgreSQL

| 维度 | V1.1.0 (本地) | V1.1.1 (线上) |
|------|---------------|---------------|
| 数据库 | SQLite 本地文件 | Supabase PostgreSQL (新加坡) |
| 连接方式 | Prisma 直连 | Supabase REST API (HTTPS) |
| 原因 | — | Supabase 仅支持 IPv6，Vercel 无法直连 |

### 2.2 数据访问层重构

**问题**：Prisma 通过 PostgreSQL wire protocol 直连 Supabase，但 Supabase 数据库节点仅解析 IPv6 地址，Vercel Serverless 不支持 IPv6 出站。

**方案**：
- 放弃 Prisma 直连，改用原生的 `fetch()` 调 Supabase REST API
- 部分高频页面（Dashboard / 作品编辑）改为浏览器直连 Supabase，绕开 Vercel 网络瓶颈

**影响范围**：12 个 API 路由 + 2 个前端页面

```diff
- import { db } from '@/lib/db'           // Prisma
- const user = await db.user.findUnique(...)
+ import { findUserByEmail } from '@/lib/supabase'  // REST API
+ const user = await findUserByEmail(email)
```

### 2.3 部署架构

```
V1.1.0                     V1.1.1
本地 localhost:3000         Vercel + sin1 (新加坡区域)
SQLite 单文件              Supabase PostgreSQL (ap-southeast-1)
无 CDN                     Vercel CDN
```

新增文件：
- `vercel.json` — 指定 Vercel 部署区域为 `sin1`（新加坡）
- `package.json` — 新增 `postinstall: prisma generate` 脚本

---

## 三、问题修复

### 3.1 登录态异常（P0）

**现象**：退出登录后重新登录，显示「账号密码错误」。

**原因**：NextAuth 在 Serverless 环境下，Cookie 清理不彻底，残留的 CSRF Token 与新 Session 不匹配。

**修复**：
- 退出登录改用 `signOut({ redirect: false })` + `window.location.href = '/login'` 强制整页刷新
- 移除 `(app)/layout.tsx` 中的 Server Action 退出方式，改为客户端 `SignOutButton` 组件

**影响文件**：
- `src/components/layout/signout-button.tsx`（新增）
- `src/app/(app)/layout.tsx`
- `src/app/(auth)/login/page.tsx`

### 3.2 注册失败（P0）

**现象**：线上注册显示「注册失败，请重试」。

**原因**：Supabase 表 `users` 的 `id`、`createdAt`、`updatedAt` 字段无默认值，Prisma 的 `@default(cuid())` 和 `@default(now())` 在直接 SQL 插入时不生效。

**修复**：注册接口手动生成 `crypto.randomUUID()` 作为 ID，手动填入 `new Date().toISOString()` 作为时间戳。

### 3.3 作品页 / 编辑页加载失败（P0）

**现象**：Dashboard 和 Edit 页面无法加载或图片不显示。

**原因**：页面通过 Vercel Serverless 函数中转请求 Supabase REST API，但 Vercel → Supabase 的网络连接不稳定导致超时。

**修复**：Dashboard 和 Edit 页面改为浏览器直接调用 Supabase REST API，不经过 Vercel。

---

## 四、数据库 Schema 兼容性

Supabase 实际列名与 Prisma `@map` 指令不完全一致，本次适配直接使用数据库真实列名：

| Prisma 模型字段 | Prisma @map | 数据库真实列名 |
|----------------|-------------|---------------|
| `passwordHash` | `password_hash` | `password_hash` ✅ |
| `createdAt` | `created_at` | `createdAt` ⚠️ |
| `updatedAt` | `updated_at` | `updatedAt` ⚠️ |
| `userId` | `user_id` | `user_id` ✅ |
| `resultUrls` | `result_urls` | `result_urls` ✅ |

---

## 五、文件变更清单

### 新增文件
- `vercel.json`
- `src/lib/supabase.ts`（REST API 数据访问层）
- `src/components/layout/signout-button.tsx`

### 修改文件
- `package.json`（postinstall 脚本）
- `src/lib/auth.ts`（NextAuth 配置：改用 Supabase REST API）
- `src/app/api/auth/register/route.ts`（注册：改用 Supabase REST API + 手动生成 ID）
- `src/app/api/generate/text-to-image/route.ts`（改用 Supabase REST API）
- `src/app/api/generate/image-to-image/route.ts`
- `src/app/api/generate/inpaint/route.ts`
- `src/app/api/images/route.ts`
- `src/app/api/images/[id]/route.ts`
- `src/app/api/images/favorite/route.ts`
- `src/app/api/images/share/route.ts`
- `src/app/api/image/remove-bg/route.ts`（改用 Supabase REST API）
- `src/app/api/image/upscale/route.ts`
- `src/app/(app)/layout.tsx`（退出登录改为客户端组件）
- `src/app/(auth)/login/page.tsx`（简化登录逻辑 + Suspense）
- `src/app/(app)/dashboard/page.tsx`（浏览器直连 Supabase）
- `src/app/(app)/edit/[imageId]/page.tsx`（浏览器直连 Supabase）
- `src/app/share/[slug]/page.tsx`（改用 Supabase REST API）
- `src/app/layout.tsx`（HTML lang 改为 zh-CN）
- `prisma/schema.prisma`（切换 PostgreSQL provider）
- `.gitignore`（排除 dev.db）

### 删除依赖
- `sharp`（曾尝试用于服务端图片压缩，最终未采用）

---

## 六、线上地址

| 环境 | URL |
|------|-----|
| 生产环境 | https://pixelforge-orpin-theta.vercel.app |
| GitHub | https://github.com/miluzhong1224/pixelforge |
| Supabase | pnowmoquisuqomhfsvza (ap-southeast-1) |
