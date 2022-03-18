#!/usr/bin/env node

const fs = require("fs");
const child = require("child_process");

async function main() {
  console.log(
    `Setting up your Terraform resources! Go grab a coffee because this will take a few minutes.`
  );

  const skillId = getSkillId();

  console.log(`Configuring:\nSkill=${skillId} in Terraform`);
  replace("terraform/staging/variables.tf", /{{skillId}}/g, skillId);
  replace("terraform/production/variables.tf", /{{skillId}}/g, skillId);

  console.log("\nApplying Staging Terraform...\n");
  child.execSync("npm run apply:staging -- -auto-approve", { stdio: "inherit" });
  console.log("\nApplying Production Terraform...\n");
  child.execSync("npm run apply:production -- -auto-approve", { stdio: "inherit" });
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
      throw new Error("Can't find Alexa skill id or Google Actions project id. Try running ./setup_jovo.js first!")
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
