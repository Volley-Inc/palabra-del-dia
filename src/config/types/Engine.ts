import { EngineInterface } from "@volley/gev";

import { Intent } from "./Intent";
import { Platforms } from "./Platforms";
import { User } from "./User";

/**
 * The type of the engine interface associated with this particular application.
 *
 * Embedded within this type are application-specific details, like the user
 * persistent state object, the set of applicable intents, and the supported
 * platforms.
 *
 * This is the type of '$', and conceptually represents the possible set of
 * interactions between the skill and the underlying GEV engine.
 */
export type Engine = EngineInterface<User, Intent, Platforms>;
