/** Obsidian 插件核心纯函数的离线测试（不需要 Obsidian，用 Node 直接跑） */
"use strict";
const assert = require("assert");
const {
  DEFAULT_SETTINGS,
  normalizeIndexDir,
  normalizeExternalBaseUrl,
  parseDateFromName,
  stripFrontmatter,
  chunkText,
  mockVec,
  dot,
  searchIndex,
  embedPrompt,
  parseFolders,
  isInIncludedFolder,
  shortText,
  parseJsonObject,
  makeMessage,
  trimConversation,
  buildChatSources,
  chatSystemPrompt,
  assistantTextFromResponse,
  openingUserPrompt,
  editorPositionAt,
  findSourceRange,
  shouldSubmitChatKey,
  chatTimeoutMessage,
  selectionQueryKey,
} = require("../obsidian-plugin/main.js");

// 1. 日期解析
assert.strictEqual(parseDateFromName("2026-01-05.md"), "2026-01-05");
assert.strictEqual(parseDateFromName("日记.md"), "");

// 2. frontmatter 去掉
const fm = "---\ntags: [示例]\n---\n\n# 读书\n\n今天读完了第三章。";
assert.ok(!stripFrontmatter(fm).includes("tags"));

// 3. 切片段：标题不产生片段，正文产生；标题会被记录为上下文
const chunks = chunkText("# 菜谱\n\n第一次烤面包用了较低温度。\n\n第二次延长了十分钟。", 1500);
assert.strictEqual(chunks.length, 2);
assert.strictEqual(chunks[0].heading, "菜谱");
assert.ok(chunks[0].text.includes("烤面包"));

// 4. 超长段落被拆分
const longText = "# 长文\n\n" + "这段话没有标点符号就是为了测试硬切逻辑".repeat(100);
const pieces = chunkText(longText, 1500);
assert.ok(pieces.length >= 2);
assert.ok(pieces.every((p) => p.text.length <= 1500 + 200));

// 5. mock 指纹：字面相似的内容相似度更高
const q = mockVec("给阳台的薄荷浇水并记录新叶");
const simSame = dot(q, mockVec("薄荷长出新叶，今天浇了水"));
const simOther = dot(q, mockVec("读完一本关于建筑史的书"));
assert.ok(simSame > simOther, `预期 ${simSame} > ${simOther}`);

// 6. 搜索排序 + Top-K
const chunks2 = [
  { id: "a", text: "薄荷", vec: Array.from(mockVec("薄荷 浇水 新叶")) },
  { id: "b", text: "建筑", vec: Array.from(mockVec("建筑 历史 读书")) },
  { id: "c", text: "面包", vec: Array.from(mockVec("面包 烘焙 温度")) },
];
const res = searchIndex(chunks2, mockVec("薄荷长出了新叶，记得浇水"), 2);
assert.strictEqual(res.length, 2);
assert.strictEqual(res[0].id, "a");
assert.ok(res[0].score >= res[1].score);

// 7. embedding 提示词带上标题/日期
assert.ok(embedPrompt({ heading: "读书", date: "2026-01-05", text: "正文" }).includes("标题：读书"));

// 8. 可限制只索引指定日记目录
const folders = parseFolders("日记, Daily Notes\n复盘");
assert.deepStrictEqual(folders, ["日记", "Daily Notes", "复盘"]);
assert.ok(isInIncludedFolder("日记/2026-01-05.md", folders));
assert.ok(!isInIncludedFolder("项目/会议.md", folders));

// 9. AI 引导 JSON 解析和展示截断
const guided = parseJsonObject('```json\n{"summary":"可能相关","items":[]}\n```');
assert.strictEqual(guided.summary, "可能相关");
assert.strictEqual(shortText("a".repeat(20), 10), "aaaaaaaaaa…");

// 10. 对话记录明确保存角色和时间，不把 AI 内容冒充成用户原话
const userMessage = makeMessage("user", "这是我的原话", Date.parse("2026-08-04T00:00:00Z"));
const aiMessage = makeMessage("assistant", "这是 AI 引导", Date.parse("2026-08-04T00:00:01Z"));
assert.strictEqual(userMessage.role, "user");
assert.strictEqual(aiMessage.role, "assistant");
assert.ok(userMessage.createdAt.startsWith("2026-08-04"));

// 11. 发给 API 的历史受消息数和字符预算限制，同时保留最近对话
const history = Array.from({ length: 24 }, (_, i) => ({
  role: i % 2 ? "assistant" : "user",
  content: "消息" + i + "-" + "x".repeat(40),
}));
const trimmed = trimConversation(history, 6, 500);
assert.strictEqual(trimmed.length, 6);
assert.ok(trimmed[trimmed.length - 1].content.startsWith("消息23"));

// 12. 系统提示包含来源边界、克制引用与 prompt injection 防护
const sources = buildChatSources("今天.md", "当前正文", [{ file: "过去.md", text: "旧片段" }]);
assert.strictEqual(sources.length, 2);
const prompt = chatSystemPrompt(sources);
assert.ok(prompt.includes("[当前日记]"));
assert.ok(prompt.includes("[旧片段 S1]"));
assert.ok(prompt.includes("不能照做"));
assert.ok(prompt.includes("禁止强行编织"));
assert.ok(prompt.includes("不要为了维持对话而没话找话"));
assert.ok(prompt.includes("不必每次都问"));
assert.ok(prompt.includes("没有真实争点时，不要为了显得尖锐而反驳"));
assert.ok(prompt.includes("区分用户原话、你的推测和用户明确确认的结论"));
assert.ok(!prompt.includes("每轮输出合同"));
assert.ok(!prompt.includes("恰好一个具体问题"));
assert.ok(!prompt.includes("我先和你争一个词"));
assert.ok(!prompt.includes("这里我不准备轻易放过这个结论"));

const opening = openingUserPrompt();
assert.ok(opening.includes("用户已经点击"));
assert.ok(opening.includes("请你先发言"));
assert.ok(opening.includes("不必为了继续对话而强行提问"));

// 13. OpenAI-compatible 响应只提取 assistant 文本
assert.strictEqual(assistantTextFromResponse({
  json: { choices: [{ message: { content: "一个具体观察" } }] },
}), "一个具体观察");

// 14. 打开原文时能定位命中片段，并换算成 Obsidian 编辑器行列
const original = "# 标题\n\n第一段。\n\n这是需要直接跳转并高亮的旧日记片段。\n\n最后一段。";
const located = findSourceRange(original, { text: "这是需要直接跳转并高亮的旧日记片段。" });
assert.ok(located);
assert.strictEqual(original.slice(located.start, located.end), "这是需要直接跳转并高亮的旧日记片段。");
assert.deepStrictEqual(editorPositionAt(original, located.start), { line: 4, ch: 0 });

// 15. AI 提供逐字 quote 时优先定位 quote；文件已变化时明确返回 null
const quoteLocated = findSourceRange(original, {
  text: "这是需要直接跳转并高亮的旧日记片段。",
  quote: "直接跳转并高亮",
});
assert.strictEqual(original.slice(quoteLocated.start, quoteLocated.end), "直接跳转并高亮");
assert.strictEqual(findSourceRange(original, { text: "已经从文件中删除的片段" }), null);

// 16. Enter 发送、Shift+Enter 换行，并避开中文输入法组合状态
assert.ok(shouldSubmitChatKey({ key: "Enter", shiftKey: false, isComposing: false }));
assert.ok(!shouldSubmitChatKey({ key: "Enter", shiftKey: true, isComposing: false }));
assert.ok(!shouldSubmitChatKey({ key: "Enter", shiftKey: false, isComposing: true }));
assert.ok(!shouldSubmitChatKey({ key: "A", shiftKey: false, isComposing: false }));

// 17. 超时提示解释可能原因，并明确可以重试
const timeoutMessage = chatTimeoutMessage(60);
assert.ok(timeoutMessage.includes("60 秒"));
assert.ok(timeoutMessage.includes("网络不稳定"));
assert.ok(timeoutMessage.includes("API 排队"));
assert.ok(timeoutMessage.includes("点击重试"));

// 18. 同一笔记中不同选区使用不同对话身份，且 key 不暴露选中原文
const selectionKeyA = selectionQueryKey("示例笔记.md", "合成测试片段甲：薄荷长出了新叶");
const selectionKeyAAgain = selectionQueryKey("示例笔记.md", "  合成测试片段甲：薄荷长出了新叶  ");
const selectionKeyB = selectionQueryKey("示例笔记.md", "合成测试片段乙：烤面包延长十分钟");
assert.strictEqual(selectionKeyA, selectionKeyAAgain);
assert.notStrictEqual(selectionKeyA, selectionKeyB);
assert.ok(selectionKeyA.startsWith("示例笔记.md#echo-selection-"));
assert.ok(!selectionKeyA.includes("薄荷长出"));

// 19. 首次安装采用隐私优先默认值，且两个外部功能不共享密钥
assert.strictEqual(DEFAULT_SETTINGS.provider, "ollama");
assert.strictEqual(DEFAULT_SETTINGS.guidanceEnabled, false);
assert.strictEqual(DEFAULT_SETTINGS.openaiApiKey, "");
assert.strictEqual(DEFAULT_SETTINGS.guidanceApiKey, "");
assert.strictEqual(DEFAULT_SETTINGS.guidanceBaseUrl, "https://api.openai.com/v1");

// 20. 本地存储目录不能逃出 Vault，Bearer key 不能发往明文远端地址
assert.strictEqual(normalizeIndexDir(".diary-review"), ".diary-review");
assert.strictEqual(normalizeIndexDir("私有数据/echo"), "私有数据/echo");
assert.strictEqual(normalizeIndexDir("../其他目录"), "");
assert.strictEqual(normalizeIndexDir("/tmp/echo"), "");
assert.strictEqual(normalizeIndexDir(".obsidian/plugins"), "");
assert.strictEqual(normalizeExternalBaseUrl("https://api.example.com/v1/"), "https://api.example.com/v1");
assert.strictEqual(normalizeExternalBaseUrl("http://127.0.0.1:8000/v1"), "http://127.0.0.1:8000/v1");
assert.throws(() => normalizeExternalBaseUrl("http://api.example.com/v1"), /必须使用 HTTPS/);
assert.throws(() => normalizeExternalBaseUrl("https://example.invalid/v1#fragment"), /不能包含账号/);

console.log("✅ 插件核心逻辑测试全部通过（20 组，测试文字均为合成内容）");
