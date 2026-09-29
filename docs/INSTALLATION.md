# Installation and configuration

## 要求

- Obsidian Desktop 1.0.0 或更高版本；当前插件仅支持桌面端。
- 默认本地模式需要 [Ollama](https://ollama.com/) 和 `bge-m3` 模型。
- 可选：支持 `/embeddings` 或 `/chat/completions` 的 OpenAI-compatible API。

## 从 GitHub Release 安装

1. 从 Releases 下载 `obsidian-echo-journal-<version>.zip`。
2. 解压后得到 `diary-review` 文件夹，其中应只有 `main.js`、`manifest.json` 和 `styles.css`。
3. 把该文件夹放到你的 Vault：`.obsidian/plugins/diary-review/`。
4. 在 Obsidian 的“设置 → 第三方插件”中启用 **ECHO · 日记复盘**。

## 从源码安装

需要 Node.js 18 或更高版本：

```bash
npm test
npm run package
```

然后把 `dist/diary-review` 复制到 Vault 的 `.obsidian/plugins/` 下，重载 Obsidian 并启用插件。项目没有 npm 运行时依赖，因此无需执行 `npm install`。

## 第一次配置

1. 在“日记文件夹”中填写一个或多个 Vault 内目录，例如 `Journal, Daily Notes`。多个目录用逗号分隔。
2. 选择 embedding：
   - `ollama`：默认、本地、免费。先运行 `ollama pull bge-m3`。
   - `mock`：完全离线，仅用于试用交互，检索质量有限。
   - `openai`：把指定范围的文本发送到你配置的外部 API；需要单独填写 Base URL、key 和模型。
3. 运行命令“重建日记索引”。
4. 打开一篇笔记，点击左侧放大镜；也可以选中文字后右键检索。

AI 解释与连续对话默认关闭。若要启用，请单独填写对话 API 地址、模型与 key。为了避免跨服务泄露，插件不会自动复用 embedding key。项目不附带开发者 key 或中转服务；外部服务的条款、隐私政策与费用由用户自行确认。

所有网络行为与本地文件说明见 [`PRIVACY.md`](PRIVACY.md)。示例设置见 [`examples/settings.example.json`](../examples/settings.example.json)，但正常使用请通过 Obsidian 设置界面配置，不要手工维护 `data.json`。

## 常见问题

- **无法连接 Ollama**：确认 Ollama 正在运行，并已安装设置中填写的模型。
- **外部 embedding 被拒绝**：确认已填写“日记文件夹”、HTTPS Base URL、专用 key 和服务商实际支持的模型。
- **没有结果**：先查看索引状态；必要时降低最低相似度或重新建立索引。
- **更换 embedding 后结果异常**：不同模型的向量不可混用，请重新建立索引。
- **插件不出现**：确认目录名是 `diary-review`，且三个运行文件直接位于该目录内，而不是多套一层文件夹。
