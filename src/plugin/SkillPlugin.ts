import {
  EngineKindMap,
  GevIntent,
  GevPlugin,
  GevPluginOnFunction,
  UserRecord,
} from "@volley/gev";
import { constant } from "lodash";

import { Intent } from "../config/types/Intent";
import { Platforms } from "../config/types/Platforms";
import { User } from "../config/types/User";

declare module "@volley/gev" {
  export interface EngineInterface<
    SkillUserRecord extends UserRecord,
    SkillIntent extends GevIntent,
    EngineKinds extends EngineKindMap<SkillUserRecord, SkillIntent, EngineKinds>
  > {
    myFancyCustomFunction(name: string): void;
  }
}

export default class SkillPlugin implements GevPlugin<User, Intent, Platforms> {
  public getPluginName = constant("skill-plugin");

  public initialize(on: GevPluginOnFunction<User, Intent, Platforms>): void {
    on("createEngineInterface", async (next, params) => {
      const $ = await next(params);
      $.myFancyCustomFunction = (name: string) => {
        $.log.info(`Received ${name} as a name!`);
      };
      return $;
    });
  }
}
