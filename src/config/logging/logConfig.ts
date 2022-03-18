import { IS_LOCAL_DEV } from "../environment/environmentVariables";

export const logConfig = {
  prettyPrint: Boolean(IS_LOCAL_DEV),
  stackDepth: 1,
};
