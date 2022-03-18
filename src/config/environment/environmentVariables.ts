export const STAGE = process.env.STAGE ?? "staging";
export const STAGE_TYPE = STAGE === "prod" ? "prod" : "staging";
export const { IS_LOCAL_DEV, npm_package_version } = process.env;
export const GEV_ID = "{{project}}";
export const GEV_ALEXA_ID = "{{skillId}}";
export const GEV_GOOGLE_ID = ""; // Must be blank due to how CA handles requests (Ask Sam for the explanation).
export const DEV = STAGE !== "prod";
export const GEV_TABLE = `${GEV_ID}-users-${STAGE}`;
export const VERSION = npm_package_version ?? "dev";
