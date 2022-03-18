import {
  Context,
  FlowscriptPlugin,
  FlowscriptPluginSystem,
  setContextVariable,
} from "@volley/flowscript";
import { toUpper } from "lodash";

import { IS_LOCAL_DEV } from "../../config/environment/environmentVariables";
import { Engine } from "../../config/types/Engine";
import { DebugLogStatement } from "./SkillStatement";

export class SkillFlowscriptPlugin implements FlowscriptPlugin {
  initialize(system: FlowscriptPluginSystem): void {
    // Register skill-specific statements
    system.define("log", new DebugLogStatement());

    // Register any pure, non-async functions
    system.functionRegistry.registerFunction(
      "toUpper",
      (_ctx: Context, str: string) => toUpper(str)
    );

    // Register for engine events
    system.hookMap.addHook<"setupInstance", Engine>(
      "setupInstance",
      async (next, ctx, $) => {
        // Set any global variables your plugin might need.
        setContextVariable(ctx, "IS_LOCAL_DEV", IS_LOCAL_DEV ?? false);
        // Call any $ functions
        $.log.info("Flowscript instance is set up.");
        return next(ctx, $);
      }
    );
  }

  name = "SkillFlowscript";
}
