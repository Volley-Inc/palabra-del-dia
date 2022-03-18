import { Engine } from "../../config/types/Engine";

/**
 * Skill authors usually prefer that launch requests forcibly restart the skill,
 * regardless of if the previous session was properly closed out. This shim
 * makes that the case.
 *
 * This can occur in cases of Audio Player - for example, saying 'Stop' when in
 * Audio Player mode can cause the skill to remain open, from a GEV internal
 * perspective.
 *
 * Notably, this registration needs to occur after the first listen statement.
 * Otherwise, an infinite loop would occur.
 */
export function registerLaunchRestart($: Engine) {
  $.routes.register("LaunchRequest" as never, () => {
    $.session.restart();
  });
}
