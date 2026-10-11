#!/usr/bin/env node
/**
 * openai-compat-mcp — 把任意 OpenAI 兼容 API 桥接为 MCP server
 * 让 Claude Desktop / Cursor / 任何 MCP 客户端直接调用你的 LLM 网关
 *
 * 环境变量（见 .env.example）：
 *   OPENAI_BASE_URL  网关地址（默认 https://api.openai.com/v1）
 *   OPENAI_API_KEY   网关密钥
 *   MODEL            默认模型名
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const API_KEY = process.env.OPENAI_API_KEY || "";
const DEFAULT_MODEL = process.env.MODEL || "gpt-4o-mini";

/** 调用 OpenAI 兼容 chat/completions */
async function chatComplete(messages, { model, temperature, maxTokens } = {}) {
  if (!API_KEY) throw new Error("未配置 OPENAI_API_KEY（参考 .env.example）");
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages,
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 4000,
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`LLM ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

const server = new McpServer({ name: "openai-compat-mcp", version: "1.0.0" });

server.tool(
  "chat",
  "与 OpenAI 兼容网关对话。支持任意 OpenAI 兼容 API：DeepSeek / 智谱 / 通义 / Moonshot / 自建 vLLM 网关",
  {
    prompt: z.string().describe("用户消息"),
    system: z.string().optional().describe("系统提示词（可选）"),
    model: z.string().optional().describe("模型名（默认取环境变量 MODEL）"),
    temperature: z.number().optional().describe("温度 0-2（可选）"),
  },
  async ({ prompt, system, model, temperature }) => {
    const messages = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });
    const text = await chatComplete(messages, { model, temperature });
    return { content: [{ type: "text", text }] };
  }
);

server.tool("list_models", "列出网关当前可用的模型", {}, async () => {
  if (!API_KEY) throw new Error("未配置 OPENAI_API_KEY");
  const res = await fetch(`${BASE_URL}/models`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    signal: AbortSignal.timeout(30000),
  });
  const data = await res.json();
  const ids = (data.data || []).map((m) => m.id);
  return { content: [{ type: "text", text: ids.length ? ids.join("\n") : JSON.stringify(data) }] };
});

await server.connect(new StdioServerTransport());
