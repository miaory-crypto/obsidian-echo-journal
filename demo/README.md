# ECHO interactive demo

这是 **ECHO Journal Recall for Obsidian** 的静态、可点击产品演示。

- 所有笔记、日期和模型回答均为合成内容。
- 页面不读取 Vault、不保存输入，也不调用模型 API。
- 第 1–3 步对应插件当前能力；第 4–5 步明确标为未来概念。
- 页面不需要构建工具、Cloudflare 账户或 API key。

直接打开 `index.html` 即可。若浏览器限制本地文件，也可以在仓库根目录运行：

```bash
python3 -m http.server 8000 --directory demo
```

然后访问 <http://localhost:8000>。

仓库的 `.github/workflows/pages.yml` 会在推送到 `main` 后把本目录发布到 GitHub Pages。首次发布前，需要在 GitHub 仓库的 **Settings → Pages → Build and deployment** 中选择 **GitHub Actions**。

旧 Cloudflare Worker demo 没有被直接复制：旧案例含私人日记衍生文本和本机 Cloudflare 缓存。公开版只保留了五步交互思路，并从头改写为合成故事。

