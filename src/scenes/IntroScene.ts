import { Engine } from "../config/types/Engine";
import NotifyDevEnvironmentScene from "./debug/NotifyDevEnvironmentScene";
import { registerLaunchRestart } from "./utility/registerLaunchRestart";

/**
 * Greet the user, and either ask them what their name is, or if they've already
 * used the skill, greet them via name.
 *
 * This scene is used as an introduction to how scenes usually work, and a
 * demonstration of the engine's persistence capabilities on $.user.
 *
 * Scenes are usually of signature ($: Engine) => Promise<void> and make up the
 * building blocks of traditional GEV skills. Scenes are composed of other
 * scenes via simply invoking them under await.
 *
 * By tradition, all scenes are named in PascalCase, with a suffix "Scene"
 * appended to them. But this is by all means optional.
 *
 * @param $ The engine interface.
 */
export default async function IntroScene($: Engine): Promise<void> {
  /**
   * Captures the first intent - usually LaunchRequest. You may need to get
   * the return value and act on it if you want to handle one-shots.
   */
  await $.listen();
  registerLaunchRestart($);

  /**
   * An optional marker that helpfully speaks out the environment you're running
   * on. Feel free to disable.
   */
  await NotifyDevEnvironmentScene($);

  $.voice.say("Hello world!");

  if ($.user.name) {
    $.voice.say(`It's great to see you again ${$.user.name}!`);
  } else {
    do {
      $.voice.say("What is your name?");

      const choice = await $.listen();

      if (choice.is("Name")) {
        $.user.name = choice.slots.name.value;

        $.myFancyCustomFunction($.user.name);

        $.voice.say(`Nice to meet you ${$.user.name}!`);
      } else {
        $.voice.say("Sorry, I didn't catch that.");
      }
    } while (!$.user.name);
  }
}
