# 🔌 openai-compat-mcp

**English** | [中文](#中文)

Bridge **any OpenAI-compatible API** into a [Model Context Protocol](https://modelcontextprotocol.io) server — so Claude Desktop, Cursor, and every MCP client can call your LLM gateway directly.

Works with: DeepSeek · Zhipu (GLM) · Qwen · Moonshot · OpenRouter · one-api / new-api / vLLM self-hosted gateways · OpenAI itself.

> ⭐ If this saves you time, a star helps others find it.

---

## 中文

把**任意 OpenAI 兼容 API** 桥接成 [MCP server](https://modelcontextprotocol.io)——让 Claude Desktop、Cursor 和所有 MCP 客户端直接调用你的 LLM 网关。

支持：DeepSeek · 智谱 GLM · 通义 Qwen · Moonshot · OpenRouter · one-api / new-api / vLLM 自建网关 · OpenAI 官方。

## 🚀 快速开始

```bash
git clone https://github.com/zjukop3/openai-compat-mcp.git
cd openai-compat-mcp
npm install
cp .env.example .env   # 填入你的网关地址和密钥
node index.js
```

## ⚙️ 客户端配置

### Claude Desktop

`claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "openai-compat": {
      "command": "node",
      "args": ["/path/to/openai-compat-mcp/index.js"],
      "env": {
        "OPENAI_BASE_URL": "https://api.deepseek.com/v1",
        "OPENAI_API_KEY": "sk-xxx",
        "MODEL": "deepseek-chat"
      }
    }
  }
}
```

### Cursor

`.cursor/mcp.json` 同样格式，`env` 里填网关配置。

## 🛠️ 提供的工具

| 工具 | 说明 |
|------|------|
| `chat` | 与网关对话。参数：`prompt`（必填）、`system` / `model` / `temperature`（可选） |
| `list_models` | 列出网关当前可用的模型 |

## 💡 典型用法

- **Claude Desktop 里用国产模型**：把 `OPENAI_BASE_URL` 指向 DeepSeek / 智谱，客户端里直接调 `chat`
- **一个网关多个模型**：`list_models` 看可用模型，`chat` 的 `model` 参数随时切换
- **自建 vLLM / one-api**：局域网网关直接接入 MCP 生态

## 📄 License

MIT © zjukop3
