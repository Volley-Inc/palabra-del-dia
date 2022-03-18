import { Alexa, GoogleActions } from "@volley/gev";

import { Intent } from "./Intent";
import { User } from "./User";

/**
 * This is the set of supported platforms for this application. This controls
 * certain type interactions involving $.isPlatform() semantics.
 *
 * You should be able to add any sort of engine you want, even if it doesn't
 * exist yet.
 */
export type Platforms = {
  alexa: Alexa.Kind<User, Intent, Platforms>;
  googleActions: GoogleActions.Kind<User, Intent, Platforms>;
};
