import {
  Alexa,
  DynamoPersistence,
  GoogleActions,
  MemoryPersistence,
} from "@volley/gev";
import {
  composeWaitingHandler,
  EngineHandler,
  EngineHandlerOptions,
} from "@volley/gev-engine-handler";

import { GEV_TABLE, IS_LOCAL_DEV } from "../environment/environmentVariables";
import { commonLogger } from "../logging/commonLogger";
import registerPlugins from "../registerPlugins";
import Skill from "../skill/Skill";
import { Intent } from "../types/Intent";
import { Platforms } from "../types/Platforms";
import { User } from "../types/User";

/**
 * This function constructs the engine handler, which contains each platform
 * engine that you want your application to support.
 *
 * This is also the function where plugin registration happens. To add a plugin,
 * call engineHandler.registerPlugin() on an instance of your plugin.
 *
 * We wrap the handler to wait on a set of initialization promises. You can add
 * additional promises to wait for by adding an element onto the composition
 * call at the end.
 *
 * @returns An engine handler, encapsulating all platform engines.
 */
export default function constructEngineHandler(): ReturnType<
  EngineHandler<User, Intent, Platforms>["handler"]
> {
  const db = IS_LOCAL_DEV
    ? new MemoryPersistence<User>()
    : new DynamoPersistence<User>(GEV_TABLE);

  const skill = new Skill();

  // You may wish to comment out or remove an unused engine if not planning on using in the future
  const engines = [
    new Alexa.Engine(skill, db, commonLogger),
    new GoogleActions.Engine(skill, db, commonLogger),
  ];

  const handlerOptions: EngineHandlerOptions = {
    logger: commonLogger,
  };

  if (IS_LOCAL_DEV) {
    handlerOptions.port = 8080;
  }

  const engineHandler = new EngineHandler<User, Intent, Platforms>(
    engines,
    handlerOptions
  );

  return composeWaitingHandler(engineHandler.handler(), [
    registerPlugins(engineHandler),
  ]);
}
