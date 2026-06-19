import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start";
import { startInstance } from "./start";

hydrateRoot(document, <StartClient instance={startInstance} />);
