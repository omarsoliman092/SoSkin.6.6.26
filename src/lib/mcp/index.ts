import { defineMcp } from "@lovable.dev/mcp-js";
import askSoskin from "./tools/ask-soskin";
import listFeatures from "./tools/list-features";

export default defineMcp({
  name: "soskin-mcp",
  title: "SoSkin MCP",
  version: "0.1.0",
  instructions:
    "SoSkin — Egyptian skincare advisor. Use `list_soskin_features` to discover in-app tools and their deep-link paths. Use `ask_soskin` to get short, expert skincare advice in Arabic or English (routines, ingredients, product guidance for Egyptian pharmacy brands).",
  tools: [listFeatures, askSoskin],
});
