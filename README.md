# 修仙互动小说框架

这是一个前后端分离的修仙互动叙事与战斗系统原型。后端使用 Node.js + TypeScript，前端使用 React + Vite，核心领域模型集中在 `shared/` 目录以保持数据结构一致。

## 目录结构

- `backend/` - Express + TypeScript 服务，负责世界观数据、AI 故事流程接口、战斗模拟与内容生成。
- `frontend/` - React UI，展示故事进度、角色状态、战斗入口和历史脉络。
- `shared/` - 公共 TypeScript 类型定义，供前后端共享。
- `save/` - 后端持久化存档目录（默认保存为 JSON 文件）。

## 后端

- 入口：`backend/src/server.ts`
- API 路由：`backend/src/api/`
- 核心服务：`backend/src/services/`
- 生成器：`backend/src/generators/`
- 战斗模拟：`backend/src/battle/simulator.ts`
- 存储：`backend/src/storage/fileStore.ts`

开发启动：

```bash
cd backend
npm install
npm run dev
```

测试（一次性运行）：

```bash
cd backend
npm run test
```

## 前端

- 入口：`frontend/src/main.tsx`
- 页面：`frontend/src/pages/`
- 组件：`frontend/src/components/`
- 状态管理：`frontend/src/state/useGameStore.ts`
- API 封装：`frontend/src/api/gameApi.ts`

开发启动：

```bash
cd frontend
npm install
npm run dev
```

联调检查：先启动后端（`cd backend && npm run dev`），再运行：

```bash
cd frontend
npm run test:integration
```

该命令通过 Vitest 调用后端 `/health`、`/api/game/*`、`/api/history` 等接口，确保前后端连通；若尚未初始化，将自动创建首个存档。

Vite 开发服务器已将 `/api` 代理到 `http://localhost:4000`。

## 下一步建议

1. 将故事生成服务接入真实的 AI 平台（如 OpenAI）并替换当前 `mock` 提示逻辑。
2. 扩展存档结构（多存档槽、快照、版本控制等持久化策略）。
3. 丰富战斗系统的技能判定、速度优先级与战报可视化，并补充前端展示。
4. 增加更多自动化测试与 lint 配置，例如 Vitest 组件测试、端到端流程测试、Supertest API 断言等。