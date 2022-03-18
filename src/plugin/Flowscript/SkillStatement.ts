import {
  Context,
  evaluate,
  ExString,
  StatementBuilder,
  StatementHandler,
  StringExpression,
} from "@volley/flowscript";

import { IS_LOCAL_DEV } from "../../config/environment/environmentVariables";
import { Engine } from "../../config/types/Engine";

// The information needed to define a single instance of a statement
type DebugLogAST = {
  readonly toSay: StringExpression;
};

/**
 * Like 'say' but only runs on local dev. Also logs to the console.
 */
export class DebugLogStatement
  implements StatementHandler<DebugLogAST, Engine> {
  /**
   * Used to match a StatementHandler to a StatementInstance.
   * Disambiguates multiple statements with the same key,
   * Update this number if you change/update the AST type
   */
  runtimeKey = "GSK.Debug.0";

  /**
   * Transforms Flowscript code into a statement.
   * StatementBuilder has a handful of helper functions to declare the format of a statement, so you don't have to build your own parser
   * @returns a parser for this statement
   */
  parse = StatementBuilder.withArgs(ExString).map(([toSay]) => ({ toSay }));

  /**
   * Runs when flowscript execution reaches this statement.
   * Common execution pattern:
   * - Evaluate expressions (resolve variables, run string interpolation)
   * - Run any `$` commands
   * - change any `ctx` state like variables or next scene
   * @param self the current statement
   * @param ctx the current state of the flowscript program
   * @param $ A reference to gev
   */
  async execute(self: DebugLogAST, ctx: Context, $: Engine) {
    if (!IS_LOCAL_DEV) {
      return;
    }

    // Evaluate saved expressions, turning them into a real string/number/object
    const sayValue = evaluate(ctx, self.toSay);

    // Run any `$` commands
    const toSay = `[${$.getPlatform()}]: ${sayValue}`;
    $.voice.say(toSay);
    $.log.info(toSay);
  }
}
