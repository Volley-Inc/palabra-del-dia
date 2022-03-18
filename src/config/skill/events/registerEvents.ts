import { Engine } from "../../types/Engine";

/**
 * Registers all events associated with the application onto the events plugin.
 *
 * The events plugin is built to handle out-of-session events that occur for a
 * given user. For example, if your skill is configured to receive them, this
 * service will be sent a request when the user enables the skill via the Alexa
 * website.
 *
 * Note that we use the instance of $ that was passed into the event ($$). This
 * is because there are certain circumstances where the outer engine interface
 * will expire and be made invalid. It is always best to use whatever scope is
 * most fresh.
 *
 * @param $ The engine interface.
 */
export default function registerEvents($: Engine): void {
  $.events.register("AlexaSkillEvent.SkillEnabled", async ($$) => {
    $$.log.info(`Skill was enabled!`);
  });
}
