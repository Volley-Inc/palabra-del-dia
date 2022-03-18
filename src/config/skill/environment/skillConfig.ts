import { SkillConfig } from "@volley/gev";

import {
  GEV_ALEXA_ID,
  GEV_GOOGLE_ID,
  GEV_ID,
} from "../../environment/environmentVariables";

const config: SkillConfig = {
  skillId: GEV_ID,
  platformIds: {
    alexa: GEV_ALEXA_ID,
    googleActions: GEV_GOOGLE_ID,
  },
};

export default config;
