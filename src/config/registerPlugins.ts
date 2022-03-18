import { CorePlugin } from "@volley/flowscript";
import { EngineHandler } from "@volley/gev-engine-handler";
import { AudioResourcePlugin } from "@volley/gev-plugin-audio-resource";
import { DeviceInfoPlugin } from "@volley/gev-plugin-device-info";
import { EasyErrorsPlugin } from "@volley/gev-plugin-easy-errors";
import { EventsPlugin } from "@volley/gev-plugin-events";
import { LoggingPlugin } from "@volley/gev-plugin-logging";
import { QuestionPlugin } from "@volley/gev-plugin-question";
import { RequestLoggerPlugin } from "@volley/gev-plugin-request-logger";
import { RoutingPlugin } from "@volley/gev-plugin-routing";
import { StatsPlugin } from "@volley/gev-plugin-stats";
import { TrackingPlugin } from "@volley/gev-plugin-tracking";
import { TrackingStandardPlugin } from "@volley/gev-plugin-tracking-standard";

import { initializeFlowscriptPlugin } from "../plugin/Flowscript/initializeFlowscriptPlugin";
import { SkillFlowscriptPlugin } from "../plugin/Flowscript/SkillFlowscriptPlugin";
import SkillPlugin from "../plugin/SkillPlugin";
import { GEV_ID } from "./environment/environmentVariables";
import { logConfig } from "./logging/logConfig";
import { Intent } from "./types/Intent";
import { Platforms } from "./types/Platforms";
import { User } from "./types/User";

/**
 * Register all plugins onto the engine interface. This is the function you
 * modify to install a new plugin.
 *
 * The plugin system allows third party code to hook into the engine and provide
 * new features. This allows us to have a scalable engine that anyone can
 * contribute to.
 *
 * Registration order often matters - if there are any constraints, they should
 * be listed in your plugin's documentation.
 *
 * @param engineHandler Composite handler representing all platform engines.
 */
export default async function registerPlugins(
  engineHandler: EngineHandler<User, Intent, Platforms>
) {
  const flowscriptPlugin = await initializeFlowscriptPlugin<
    User,
    Intent,
    Platforms
  >();

  engineHandler.registerPlugin(
    new LoggingPlugin<User, Intent, Platforms>(logConfig)
  );

  engineHandler.registerPlugin(flowscriptPlugin);

  engineHandler.registerPlugin(
    new RequestLoggerPlugin<User, Intent, Platforms>()
  );

  /**
   * To enable tracking, provide valid segment keys to the Tracking plugin
   * constructor. If you prefer to keep your keys in AWS Parameter store,
   * provide the SSM name or path
   */
  engineHandler.registerPlugin(
    new TrackingPlugin<User, Intent, Platforms>({
      appName: GEV_ID,
      /*
      ssm: {
        name: `${GEV_ID}/${STAGE}/segment`,
      },
      */
    })
  );

  engineHandler.registerPlugin(new StatsPlugin<User, Intent, Platforms>());

  engineHandler.registerPlugin(
    new TrackingStandardPlugin<User, Intent, Platforms>()
  );

  engineHandler.registerPlugin(new DeviceInfoPlugin<User, Intent, Platforms>());

  engineHandler.registerPlugin(new EventsPlugin<User, Intent, Platforms>());

  engineHandler.registerPlugin(new RoutingPlugin<User, Intent, Platforms>());

  engineHandler.registerPlugin(
    new AudioResourcePlugin<User, Intent, Platforms>({ rootUrl: "" })
  );
  engineHandler.registerPlugin(new EasyErrorsPlugin<User, Intent, Platforms>());
  engineHandler.registerPlugin(new QuestionPlugin<User, Intent, Platforms>());

  engineHandler.registerPlugin(new SkillPlugin());

  flowscriptPlugin.registerPlugins([
    new CorePlugin(),
    new SkillFlowscriptPlugin(),
  ]);

  flowscriptPlugin.finishedLoadingPlugins();
}
