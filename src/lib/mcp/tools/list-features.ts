import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const TOOLS = [
  { key: "trust", path: "/trust", label: "Trust Score — verify product authenticity" },
  { key: "builder", path: "/builder", label: "Routine Builder — design a skincare routine" },
  { key: "progress", path: "/progress", label: "Before/After — track skin progress with photos" },
  { key: "conflicts", path: "/conflicts", label: "Conflicts — detect ingredient conflicts between products" },
  { key: "dupes", path: "/dupes", label: "Alternatives — find cheaper equivalents (Egyptian pharmacies)" },
  { key: "university", path: "/university", label: "Active Ingredients dictionary" },
  { key: "expiry", path: "/expiry", label: "Expiry Alarm — track product expiration" },
  { key: "trends", path: "/trends", label: "Social Trends — trending skincare topics" },
  { key: "scan", path: "/scan", label: "Scan a product or face" },
  { key: "compare", path: "/compare", label: "Compare two skincare products" },
  { key: "chat", path: "/chat", label: "Ask SoSkin — AI skincare advisor chat" },
];

export default defineTool({
  name: "list_soskin_features",
  title: "List SoSkin features",
  description: "List the skincare tools and features available in the SoSkin app with deep-link paths.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: TOOLS.map((t) => `• ${t.key} (${t.path}) — ${t.label}`).join("\n") }],
    structuredContent: { features: TOOLS },
  }),
});
