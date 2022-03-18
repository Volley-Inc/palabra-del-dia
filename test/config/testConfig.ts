import { Alexa, ConsoleLogger, MemoryPersistence } from "@volley/gev";
import { TestConfig } from "@volley/gev-testing";

import registerPlugins from "../../src/config/registerPlugins";
import Skill from "../../src/config/skill/Skill";
import { Intent } from "../../src/config/types/Intent";
import { Platforms } from "../../src/config/types/Platforms";
import { User } from "../../src/config/types/User";

const db = new MemoryPersistence<User>();
const skill = new Skill();
export const testConfig: TestConfig<User, Intent, Platforms> = {
  db,
  skill,
  engines: [
    new Alexa.Engine(skill, db, new ConsoleLogger()),
    // add all supported engines here
  ],
  initializeEngineHandler: async (engineHandler) => {
    await registerPlugins(engineHandler);
  },
};
