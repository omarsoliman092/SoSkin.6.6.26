import { createRequestHandler } from "@tanstack/react-start/server";
import { startInstance } from "./start";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const handler = createRequestHandler({
      createStart: () => startInstance,
    });
    return handler(request, env, ctx);
  },
};
