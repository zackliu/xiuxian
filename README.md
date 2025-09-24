# 修仙互动小说框架

这是一个前后端分离的修仙互动叙事系统：
- **后端** 使用 Node.js + TypeScript，负责调度 OpenAI 生成剧情、角色数据并管理存档。
- **前端** 使用 React + Vite，呈现故事进展、角色面板、战斗推演与日志。
- **shared/** 存放前后端共享的 TypeScript 类型定义。
- **save/** 目录存储存档 JSON。

## 环境配置

在运行前请设置以下环境变量（可基于 `.env.example` 创建 `.env` 文件）：

| 变量名 | 说明 |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API Key（必填） |
| `OPENAI_ENDPOINT` | 可选，自定义 Base URL（Azure OpenAI 需填写） |
| `OPENAI_DEPLOYMENT` | 可选，Azure 部署名称；若为空使用 `OPENAI_MODEL` |
| `OPENAI_MODEL` | 默认 `gpt-4o-mini`，自定义模型名称 |
| `SAVE_DIR` | 存档目录，默认 `../../save` |
| `PORT` | 后端监听端口，默认 `4000` |

> 提醒：系统会强制 OpenAI 仅返回 JSON。故事、人物、地点、功法等均为中文输出。

## 项目结构

- `backend/src/`
  - `ai/`：OpenAI 客户端封装。
  - `prompts/`：提示词模板（初始化故事、推进剧情）。
  - `services/`：业务逻辑（含 `aiStoryService`、`gameService`、`historyService`）。
  - `battle/`：速度优先的战斗模拟。
  - `api/`：REST 路由。
  - `storage/`：存档读写。
- `frontend/src/`
  - `pages/`：页面组件（`Dashboard`）。
  - `components/`：角色面板、故事互动、战斗推演、交互日志等。
  - `state/`：Zustand 全局状态。
  - `api/`：与后端通信的 axios 封装。

## 启动步骤

### 后端（Node.js + OpenAI）
```bash
cd backend
npm install
npm run dev
```
如需运行一次性测试：
```bash
npm run test
```

### 前端（React + Vite）
```bash
cd frontend
npm install
npm run dev
```

调试前后端连通性：确保后端已启动后执行
```bash
cd frontend
npm run test:integration
```
该命令通过 `/api/game/*` 接口验证剧情初始化、推进与战斗推演。

## 关键特性

1. **AI 驱动的世界构建**：后端以 Prompt 驱动 OpenAI，一次生成中文角色、功法、法宝、时间线与章节引子，并保持枚举字段与业务类型一致。
2. **自由指令推进剧情**：前端提供灵感提示与自定义输入框，玩家可输入任意中文指令，后端调用 OpenAI 续写故事并返回下一章节选项。
3. **完整存档体系**：角色、功法、法宝、战斗记录与时间线均保存在 `save/` 目录的 JSON 中，可随时恢复。
4. **组件化前端体验**：角色属性面板、战斗推演表单、交互日志与故事互动区域信息清晰、中文展示统一。

## 后续扩展建议

- 增加更多 Prompt 模板（战斗详叙、人物成长、门派经营等），细分 AI 职责。
- 引入权限/冷却机制，限制高频调用或根据灵石消耗调用不同模型。
- 扩展战斗系统：加入技法连携、特殊状态、可视化战报。
- 编写更细粒度的单元测试（可通过 Vitest 对 `aiStoryService` 做接口层 Mock）。
