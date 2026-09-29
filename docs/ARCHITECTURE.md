# Architecture

## Scope

ECHO 当前是一个 Obsidian Desktop 插件。技术插件 ID 为 `diary-review`，显示名称为 **ECHO · 日记复盘**。

目标是让用户在不修改原笔记的前提下，从历史 Markdown 中找回语义相关的片段，并可选地与外部模型讨论这些材料。系统不应把模型生成内容冒充成用户观点，也不自动把对话写回原文。

## Main flow

1. 用户选择 Vault 内的笔记目录。
2. 插件读取 Markdown，去除 frontmatter，按段落和长度切片。
3. embedding provider 为片段生成归一化向量。
4. 索引以 JSON 保存在 Vault 内的专用 sidecar 目录。
5. 查询时生成当前文件或选区的向量，按点积排序，并排除当前文件。
6. 用户可收藏、标注或打开来源；这些操作不修改原始 Markdown。
7. 只有用户主动开启并点击解释或聊天时，才调用单独配置的对话 API。

## Providers

- `ollama`：默认。请求发送到用户配置的 Ollama 地址，默认是本机 loopback。
- `mock`：测试与演示用的确定性本地向量，不代表真实语义质量。
- `openai`：OpenAI-compatible `/embeddings` API。外部模式需要显式目录范围、HTTPS Base URL 和专用 key。
- Guidance/chat：独立的 OpenAI-compatible `/chat/completions` 配置，不复用 embedding key。

网络边界和持久化详情见 [`PRIVACY.md`](PRIVACY.md)。

## Storage

- 原始 Markdown：只读。
- `index.json`：全文片段、向量与来源元数据。
- `conversations.json`：当前和归档对话。
- Obsidian `data.json`：设置、key、收藏片段和标注。

所有 sidecar 都是明文。索引目录经过相对路径校验，拒绝绝对路径和 `..`，以降低写出 Vault 的风险；用户仍应使用默认专用目录，避免与已有同名文件冲突。

## Source layout

插件目前是单文件实现：`obsidian-plugin/main.js`。文件内部依次包含纯函数、检索/提示逻辑、视图与 Obsidian 插件类。Node 测试只导入纯函数，因此不需要安装 Obsidian 包。

发布脚本只复制 `main.js`、`manifest.json` 和 `styles.css`，避免把测试、设置或本地数据装入 Release。

## Invariants

- 原始笔记不被插件修改或删除。
- 外部请求必须由明确的用户配置和操作触发。
- embedding key 与对话 key 分离。
- 测试和示例只使用明确的合成内容。
- 文件来源、用户文字和模型文字保持可区分。
- 技术 ID `diary-review` 在兼容性评估前不更改。

## Verification

```bash
npm test
npm run package
```

发布前还应在一个只含合成笔记的临时 Vault 中完成 Obsidian 冒烟测试。
