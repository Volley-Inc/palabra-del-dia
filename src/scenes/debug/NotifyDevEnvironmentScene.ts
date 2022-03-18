import {
  DEV,
  IS_LOCAL_DEV,
  VERSION,
} from "../../config/environment/environmentVariables";
import { Engine } from "../../config/types/Engine";

/**
 * On development environments, provide a small verbal statement on the skill
 * that notifies the user that they are on a given environment.
 *
 * This is sometimes useful for testing, but can be annoying as it doesn't
 * accurately simulate the experience the user receives in the skill. Feel free
 * to disable or delete this.
 *
 * @param $ The engine interface.
 */
export default async function NotifyDevEnvironmentScene($: Engine) {
  if (IS_LOCAL_DEV) {
    const verbalStage =
      process.env.USERNAME ?? process.env.USER ?? process.env.NAME ?? "UNKNOWN";

    $.voice.say(`${verbalStage} LOCAL DEV Testing version ${VERSION}.`);
  } else if (DEV) {
    $.voice.say(`Testing version ${VERSION}.`);
  }
}
