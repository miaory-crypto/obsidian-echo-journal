# ECHO Journal Recall for Obsidian

> 在 Obsidian 里，从今天的笔记找回过去相关的日记片段；默认本地检索，可选接入自己的 AI API 继续对话。

ECHO 是一个隐私优先的 Obsidian 桌面插件。仓库名为 **`obsidian-echo-journal`**；插件内显示名仍是 **ECHO · 日记复盘**，技术插件 ID 仍是 `diary-review`，以免破坏已有安装。

> 当前版本：`0.8.5` 候选版。请先使用合成笔记或备份 Vault 试用；尚未进入 Obsidian Community Plugins。

## 先看演示

- [在线交互 demo（GitHub Pages 发布后可用）](https://miaory-crypto.github.io/obsidian-echo-journal/)
- [demo 源码与本地运行说明](demo/)

演示只使用合成的烤面包与植物观察笔记，不读取 Vault、不保存输入、也不调用模型 API。第 1–3 步对应当前插件能力；第 4–5 步明确标为产品概念。公开演示从头改写，未复制旧 demo 的个人材料或本机缓存。

## 能做什么

- 默认通过本机 Ollama `bge-m3` 建立语义索引；也支持离线 mock 和外部 OpenAI-compatible embedding。
- 排除当前文件，返回最相关的历史片段。
- 选中文字后直接检索，并为同一笔记中的不同选区隔离对话上下文。
- 收藏片段、添加个人标注、打开并定位原文。
- 可选 AI 解释和连续对话；不开启、不点击就不会调用对话 API。
- 原始 Markdown 只读；索引、收藏和对话存放在独立数据文件中。

## 隐私默认值

- 新安装默认使用本机 Ollama，AI 对话默认关闭。
- embedding key 与对话 key 相互独立，插件不会自动复用。
- 外部 embedding 仅允许在明确设置日记文件夹后运行。
- 项目不包含遥测或开发者服务器。

索引和聊天记录包含原文片段，并以明文保存在 Vault 中；配置和收藏也会保存在插件 `data.json`。启用外部 API 前，请先阅读完整的[隐私与数据流说明](docs/PRIVACY.md)。

## API key 怎么处理

ECHO 不内置、代发或共享任何开发者 API key。默认的本地 Ollama 模式不需要 key；如果启用外部 embedding 或 AI 解释/聊天，需要填写自己向相应服务商申请的 key（BYOK，Bring Your Own Key）。服务商条款、隐私政策与可能产生的费用由用户自行确认。

- **Embedding key** 只用于外部向量请求。
- **Guidance/chat key** 只用于 AI 解释和连续对话。
- 插件不会把其中一个 key 自动复制、回退或复用于另一项功能。
- 项目不提供中转服务器；相关笔记文本会直接发送到你为该功能填写的 Base URL。

Key 会以明文保存在 Vault 的 `.obsidian/plugins/diary-review/data.json` 中，可能被 Vault 同步或系统备份复制。不要把真实 `data.json`、key、索引、日志或含私人信息的截图提交到 GitHub。仓库中的 [`examples/settings.example.json`](examples/settings.example.json) 只有空 key 字段。

## 安装

### GitHub Release

1. 下载 `obsidian-echo-journal-<version>.zip`。
2. 解压得到 `diary-review` 文件夹。
3. 放入 Vault 的 `.obsidian/plugins/`，最终应存在 `.obsidian/plugins/diary-review/manifest.json`。
4. 在 Obsidian“设置 → 第三方插件”中启用 **ECHO · 日记复盘**。

### 从源码

需要 Node.js 18 或更高版本：

```bash
npm test
npm run package
```

把生成的 `dist/diary-review` 复制到 Vault 的 `.obsidian/plugins/`。项目没有 npm 运行时依赖，因此无需执行 `npm install`。

完整的首次配置、embedding 模式和排错说明见[安装与配置](docs/INSTALLATION.md)。

## 快速开始

1. 在设置中填写要索引的 Vault 内目录，例如 `Journal, Daily Notes`。
2. 默认模式下先安装 Ollama，并执行 `ollama pull bge-m3`。
3. 在命令面板运行“重建日记索引”。
4. 打开一篇笔记，点击左侧放大镜；或选中文字后右键运行 ECHO 检索。

换句话说：**选择日记目录 → 建立本地索引 → 打开笔记或选中文字 → 找回相关旧片段 →（可选）配置自己的 API 继续对话。**

仓库内的 [`examples/sample-vault`](examples/sample-vault) 只包含明确的合成笔记，可用于安全试用。

## 仓库结构

```text
obsidian-plugin/       插件运行文件
tests/                 不联网的核心测试
scripts/               发布打包脚本
examples/sample-vault/ 合成示例笔记
demo/                  不联网的合成交互演示
docs/                  安装、隐私、架构、变更记录与路线图
```

插件通过 Obsidian 设置界面配置，不读取 `.env`，所以仓库不提供 `.env.example`。空密钥的合成配置示例位于 [`examples/settings.example.json`](examples/settings.example.json)。

## 开发

```bash
npm test        # 语法检查 + 核心纯函数测试
npm run package # 生成 dist/diary-review 和版本 ZIP
```

运行时依赖由用户选择：Obsidian Desktop；默认本地模式还需要 Ollama 与 `bge-m3`。外部 embedding 和对话是可选能力。

贡献前请阅读 [`CONTRIBUTING.md`](CONTRIBUTING.md)。安全问题请按 [`SECURITY.md`](SECURITY.md) 报告，且不要上传真实笔记或密钥。

进一步文档：

- [架构与不变量](docs/ARCHITECTURE.md)
- [变更记录](docs/CHANGELOG.md)
- [路线图](docs/ROADMAP.md)
- [GitHub 发布清单](docs/PUBLISHING.md)

## 当前限制

- 当前重建索引会重新计算指定范围内的全部片段，尚未实现增量索引。
- 聊天记录与收藏没有内置加密，也尚无自动保留期限。
- 远端请求超时后底层请求未必已被服务商取消；立即重试可能产生重复计费。
- 仅支持桌面端，尚未完成 Obsidian Community Plugins 提交流程。

## 许可证

本项目采用 [MIT License](LICENSE)，© 2026 EVA。

MIT 允许其他人使用、修改、再发布、收费销售，或制作闭源衍生版本，但必须保留原版权和许可证声明；软件按“原样”提供，不附带担保。
