import { fetchAllScripts } from "@volley/flutils";
import { EngineKindMap, GevIntent, UserRecord } from "@volley/gev";
import { FlowscriptIntegrationPlugin } from "@volley/gev-plugin-flowscript";
import { promises } from "fs";
import { mapKeys } from "lodash";

import { commonLogger } from "../../config/logging/commonLogger";

export async function initializeFlowscriptPlugin<
  U extends UserRecord,
  I extends GevIntent,
  P extends EngineKindMap<U, I, P>
>(): Promise<FlowscriptIntegrationPlugin<U, I, P>> {
  const sourceFiles = mapKeys(
    (await promises.readdir("./src/scripts")).filter((s) =>
      s.endsWith(".flow")
    ),
    (x) => x.replace(/\.flow$/, "")
  );

  return new FlowscriptIntegrationPlugin<U, I, P>(
    // Download all of the source files in parallel
    fetchAllScripts(`./src/scripts`, sourceFiles),
    [],
    { loggingInterface: commonLogger }
  );
}
