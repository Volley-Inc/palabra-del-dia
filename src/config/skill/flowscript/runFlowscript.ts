import { Engine } from "../../types/Engine";

export function initializeFlowscriptVariableContext($: Engine) {
  return {
    variables: { user: $.user as Record<string, string> },
  };
}

export async function runFlowscript($: Engine) {
  await $.flowscript.execute($, initializeFlowscriptVariableContext($));
}
