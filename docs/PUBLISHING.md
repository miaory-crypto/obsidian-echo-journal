# GitHub publishing checklist

此公开快照应作为一个全新仓库发布，不要把原开发仓库的 `.git` 历史复制进来。旧历史可能包含私人路径、内部研究记录和个人邮箱元数据。

## 1. 发布前检查

```bash
npm test
npm run package
git status --short
git log --oneline --decorate -1
```

预期结果：测试通过；`dist/obsidian-echo-journal-0.8.5.zip` 已生成；工作区没有未提交改动；历史只有经过审计的公开快照提交。

再人工确认：

- 没有 `data.json`、`.env`、`.diary-review/`、索引、聊天记录或真实笔记。
- 没有本机绝对路径、私人邮箱、账号 token 或第三方私用端点。
- `obsidian-plugin/manifest.json` 和 `package.json` 版本一致。
- `LICENSE` 中的署名与许可确实符合维护者意愿。
- `demo/` 只含合成内容；没有旧 Cloudflare `.wrangler/` 缓存或私人日记衍生文案。

## 2. 创建公开仓库

先让 GitHub CLI 登录：

```bash
gh auth login -h github.com
```

在本目录运行：

```bash
gh repo create obsidian-echo-journal \
  --public \
  --source=. \
  --remote=origin \
  --push \
  --description "Privacy-first journal recall for Obsidian, with local semantic search and optional bring-your-own AI"
```

如果同名仓库已存在，请不要使用 `--push` 猜测覆盖；先在 GitHub 确认目标，再手动添加正确的空仓库 remote。

建议 topics：`obsidian-plugin`、`semantic-search`、`ollama`、`personal-knowledge-management`。

## 3. 创建第一个 Release

首次安装测试通过后，让 tag 与 manifest 版本完全一致：

```bash
git tag 0.8.5
git push origin 0.8.5
npm run package
gh release create 0.8.5 \
  obsidian-plugin/main.js \
  obsidian-plugin/manifest.json \
  obsidian-plugin/styles.css \
  dist/obsidian-echo-journal-0.8.5.zip \
  --title "ECHO Journal Recall 0.8.5 (candidate)" \
  --notes "Candidate release. Back up your Vault and review docs/PRIVACY.md before enabling external APIs."
```

Release 页面应同时包含 `main.js`、`manifest.json`、`styles.css` 和方便手动安装的 ZIP。

## 4. 启用交互 demo

仓库包含官方推荐格式的 `.github/workflows/pages.yml`，会把 `demo/` 作为静态 GitHub Pages 站点发布。首次推送后：

1. 打开仓库 **Settings → Pages**。
2. 在 **Build and deployment** 中选择 **GitHub Actions**。
3. 在 **Actions** 中手动运行 “Deploy demo to GitHub Pages”，或修改 `demo/` 后推送。
4. 部署地址应为 `https://<用户名>.github.io/obsidian-echo-journal/`；核对后放进仓库 About 的 Website 字段。

Pages workflow 只上传 `demo/`，不需要 API key 或 repository secret。

## 5. 暂不执行的事项

- 不把原开发仓库历史强推到公开仓库。
- 不在 GitHub issue 或 Release 中上传真实 Vault、设置、索引或聊天记录。
- 不把“已在 GitHub 发布”等同于“已进入 Obsidian Community Plugins”；后者有额外目录结构和审核要求。
