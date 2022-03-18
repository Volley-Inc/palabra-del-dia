#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const child = require("child_process");

async function main() {
  console.log(
    `Setting up your skill on each platform! This may take a few moments.`
  );

  console.log(`Creating new skill via Jovo...`);
  child.execSync("jovo3 build --stage staging && jovo3 deploy --stage staging", {
    stdio: "inherit",
  });

  const skillId = getSkillId();

  replace("src/config/environment/environmentVariables.ts", /{{skillId}}/g, skillId);

  console.log(`Your new skill ID is "${skillId}"!`);
}

function getSkillId() {
  let path = "platforms/alexaSkill/.ask/ask-states.json";
  if (fs.existsSync(path)) {
    const file = fs.readFileSync(path, "utf-8");
    const json = JSON.parse(file);
    return json["profiles"]["default"]["skillId"];
  } else {
    path = "platforms/googleAction/settings/settings.yaml";
    if (fs.existsSync(path)) {
      const file = fs.readFileSync(path, "utf-8");
      return file.match(/"projectId": "(.+)"/)[1]
    } else {
      throw new Error("Can't find Alexa skill id or Google Actions project id.")
    }
  }
}

function replace(file, pattern, replace) {
  const txt = fs.readFileSync(file, "utf-8").replace(pattern, replace);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(file, txt);
}

main()
  .then(() => {
    console.log("Finished! ", "\n");
  })
  .catch((error) => console.error(error));
