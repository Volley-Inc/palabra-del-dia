import { JsonLogger } from "@volley/gev-plugin-logging";

import { logConfig } from "./logConfig";

export const commonLogger = new JsonLogger({}, logConfig);
