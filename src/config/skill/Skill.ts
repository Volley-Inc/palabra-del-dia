import { GevSkill } from "@volley/gev";
import { defaults } from "lodash";

import IntroScene from "../../scenes/IntroScene";
import { Engine } from "../types/Engine";
import { Intent } from "../types/Intent";
import { Platforms } from "../types/Platforms";
import { DEFAULT_USER_DATA, User } from "../types/User";
import config from "./environment/skillConfig";
import registerEvents from "./events/registerEvents";
import { runFlowscript } from "./flowscript/runFlowscript";
import { guaranteeUserData } from "./user/guaranteeUserData";



class Skill implements GevSkill<User, Intent, Platforms> {
  config = config;

  static useFlowscript = true;

  getNewUserData(userId: string): User {
    return defaults({
      userId
    }, DEFAULT_USER_DATA);
  }

  async execute($: Engine): Promise<void> {
    guaranteeUserData($);

    registerEvents($);

    const implementation = Skill.useFlowscript
      ? runFlowscript($)
      : IntroScene($);

    await implementation;
  }
}

export default Skill;
