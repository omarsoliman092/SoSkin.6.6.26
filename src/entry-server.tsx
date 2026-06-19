import { createRequestHandler } from "@tanstack/react-start/server";
import { startInstance } from "./start";

export default createRequestHandler({
  createStart: () => startInstance,
});
