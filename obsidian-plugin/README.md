# ECHO Journal Recall for Obsidian · 插件文件

插件内显示名：**ECHO · 日记复盘**。技术插件 ID 与安装目录保持为 `diary-review`。

此目录保存插件运行文件：

- `main.js`
- `manifest.json`
- `styles.css`

不要直接把 `obsidian-plugin` 作为安装目录。请在仓库根目录运行：

```bash
npm test
npm run package
```

然后把生成的 `dist/diary-review` 复制到 Vault 的 `.obsidian/plugins/`。

默认 embedding 为本机 Ollama，AI 解释与聊天默认关闭。安装、配置、外部 API 数据流和删除本地数据的完整说明分别见：

- [`../docs/INSTALLATION.md`](../docs/INSTALLATION.md)
- [`../docs/PRIVACY.md`](../docs/PRIVACY.md)

请勿把 Obsidian 自动生成的 `data.json`、索引、对话记录或真实笔记加入本目录或 GitHub Release。
