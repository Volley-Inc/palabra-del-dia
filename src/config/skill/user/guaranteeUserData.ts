import { Engine } from "../../types/Engine";
import { defaults } from "lodash";
import { DEFAULT_USER_DATA } from "../../types/User";

/**
 * Ensure that user data has all properties. This allows us to
 * confidently declare non-optional properties in the User type.
 */
export function guaranteeUserData($: Engine) {
  defaults($.user, DEFAULT_USER_DATA);
}
