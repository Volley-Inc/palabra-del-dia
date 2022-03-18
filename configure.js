#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const child = require("child_process");

const echo = console.log;

let author = "";

try {
  const user = child
    .execSync("git config --global user.name", {
      encoding: "utf8",
    })
    .trim();
  author += user;
} catch (e) {
  console.error(
    "Ran into error while trying to get name out of global git config",
    e
  );
}

try {
  const email = child
    .execSync("git config --global user.email", {
      encoding: "utf8",
    })
    .trim();
  author += ` <${email}>`;
} catch (e) {
  console.error(
    "Ran into error while trying to get email out of global git config",
    e
  );
}

const project = path.basename(__dirname);

if (project === "gev-starter-kit") {
  throw new Error(
    "Before you run you must name your folder to your desired project name..."
  );
}

const files = [
  "project.js",
  "projectTemplate.json",
  "models/en.json",
  "package.json",
  "terraform/production/alert.tf",
  "terraform/production/variables.tf",
  "terraform/production/main.tf",
  "terraform/staging/variables.tf",
  "terraform/staging/main.tf",
  "src/config/environment/environmentVariables.ts",
  "kubernetes/production/gev.yaml",
  "kubernetes/production/haproxy-ingress.yaml",
  "kubernetes/staging/gev.yaml",
];

function validateProject(name) {
  if (name.length > 35) {
    console.log("ERROR: Project name cannot be longer than 35 characters");
    console.log(
      "ERROR: Please create new repository and discard this one to avoid renaming"
    );
    process.exit(1);
  }
}

function getLatestGevopsSHA() {
  sha = child
    .execSync(
      "git ls-remote git@github.com:Volley-Inc/gevops.git | grep refs/heads/main | awk '{printf $1}'"
    )
    .toString();
  return sha;
}

function getIAMUsername() {
  callerIdentityArn = child.execSync(
    "aws sts get-caller-identity --query Arn --output text"
  ).toString().replace(/\n/g, '')
  return callerIdentityArn.split("/")[1]
}

/* When Project name contains IAM username its a dev/temporary project hence
 * k8s manifests would be deployed to personal namespace.
 */
function getNamespaces(name, iamUsername) {
  let namespaces = {
    production: `${name}-production`,
    staging: `${name}-staging`
  }
  if(name.includes(iamUsername)) {
    namespaces = {
      production: iamUsername,
      staging: iamUsername,
    }
  }
  return namespaces
}

/* When Project name contains IAM username its a dev/temporary project hence
 * staging and production can potentially be deployed to same namespace
 * hence change the name. Otherwise for permanent project keep name same, as
 * they would be deployed to different namespaces.
 */
function getHelmReleaseName(name, iamUsername) {
  let helmReleaseNames = {
    production: name,
    staging: name
  }
  if(name.includes(iamUsername)) {
    helmReleaseNames = {
      production: `${name}-production`,
      staging: `${name}-staging`
    }
  }
  return helmReleaseNames
}

/** Ask creator of the project whether their skill will contain
 * user data (email or phone numbers), this will configure
 * Vanta tag `VantaContainsUserData` on inventory to `true` or `false`.
 *
 * Need to run post `npm install` so that prompts is available.
 */
async function doesSkillContainUserData() {
  const response = await prompts({
    type: "select",
    name: "userData",
    message: "Will the skill store user phone number or emails?",
    choices: [
      { title: "No", value: "false" },
      { title: "Yes", value: "true" }
    ],
    initial: 0,
  });
  return response["userData"];
}

function substituteUserDataBoolean(containsUserData) {
  const files = [
    "terraform/production/variables.tf",
    "terraform/staging/variables.tf",
  ]

  for (const i of files) {
    echo(`Processing ${i}...`);
    if (!fs.existsSync(i)) continue;
    const file = fs
      .readFileSync(i, "utf-8")
      .replace(/{{contains-user-data}}/g, containsUserData);
    fs.writeFileSync(i, file);
  }
}


async function applyTemplates() {
  validateProject(project);
  const gevopsSHA = getLatestGevopsSHA();
  const iamUsername = getIAMUsername();
  const namespaces = getNamespaces(project, iamUsername);
  const helmReleaseNames = getHelmReleaseName(project, iamUsername);
  

  let spokenSuggestion = project.replace(/[-_]/g, " ")
  .replace(/([a-z])([A-Z])/, "$1 $2");

  let {projectSpoken} = await prompts({
    type: "text",
    name: "projectSpoken",
    message:"What invocation would you like to use for this skill?",
    validate: (value) => value.match(/[^a-z'. ]/i) ? "Invocation name may only contain alphabetic characters, apostrophes, period, and spaces" : true,
    initial: spokenSuggestion }
  );
  projectSpoken = projectSpoken.toLowerCase();

  echo(`Great! Setting up ${project}`);
  echo("Running string replacement...");
  for (const i of files) {
    echo(`Processing ${i}...`);
    if (!fs.existsSync(i)) continue;
    const file = fs
      .readFileSync(i, "utf-8")
      .replace(/({{project}}|~~project~~)/g, project)
      .replace(/{{author}}/g, author)
      .replace(/{{project-spoken}}/g, projectSpoken)
      .replace(/{{gevops-sha}}/g, gevopsSHA)
      .replace(/{{production-namespace}}/g, namespaces.production)
      .replace(/{{staging-namespace}}/g, namespaces.staging)
      .replace(/{{production-helmrelease-name}}/g, helmReleaseNames.production)
      .replace(/{{staging-helmrelease-name}}/g, helmReleaseNames.staging)
      .replace(/{{iam-username}}/g, iamUsername);
    fs.writeFileSync(i, file);
  }
  
  echo(`Installing Dependencies...`);
  child.execSync("npm install", { stdio: "inherit" });
  child.execSync("npm run codegen", { stdio: "inherit" });
}


const prompts = require("prompts");


/**
 * For particular platform initializations, we remove all other platforms so
 * that Jovo doesn't try to initialize them.
 */
function performPlatformSpecificDeletions(platform, projectTemplate, model) {
  if (platform === "alexa") {
    delete projectTemplate.googleAction;
    delete projectTemplate.stages.staging.googleAction;
    delete projectTemplate.stages.prod.googleAction;

    delete model.googleAssistant;
  } else if (platform === "google") {
    delete projectTemplate.alexaSkill;
    delete projectTemplate.stages.staging.alexaSkill;
    delete projectTemplate.stages.prod.alexaSkill;

    delete model.alexa;
  }
}

async function configureJovoProjectFiles() {
  const platformRes = await prompts({
    type: "select",
    name: "platform",
    message: "Which platforms would you like to support?",
    choices: [
      { title: "Alexa", value: "alexa" },
      { title: "Google Actions", value: "google" },
      { title: "Both", value: "both" },
    ],
    initial: 0,
  });

  const { platform } = platformRes;

  const model = require("./models/en.json");
  const projectTemplate = require("./projectTemplate.json");

  performPlatformSpecificDeletions(platform, projectTemplate, model);

  if (platform !== "alexa") {
    const projectIdRes = await prompts({
      type: "text",
      name: "projectId",
      message:
        'What is your Google Action\'s Project ID?\nYou must manually create your Google Action using the Actions Console.\nYour Project ID can be found in the "Project Settings"\n',
    });

    const { projectId } = projectIdRes;

    projectTemplate.googleAction.projectId = projectId;
  }

  fs.writeFileSync(
    "./projectTemplate.json",
    JSON.stringify(projectTemplate, null, 2)
  );

  const jovoRes = await prompts({
    type: "text",
    name: "initialize",
    message: `Are you ready to set up your skill using Jovo? (Recommend: yes)`,
    initial: "yes",
  });

  const shouldInitializeJovo = jovoRes["initialize"]
  .toLowerCase()
  .startsWith("y");

  if (shouldInitializeJovo) {
    child.execSync(
      `node setup_jovo.js`,
      { stdio: "inherit" }
    );
  } else {
    console.log(`No worries. Just run ./setup_jovo.js when you're ready.`);
  }

  const provisionRes = await prompts({
    type: "text",
    name: "initialize",
    message: `Do you want to set up your compute resources using Terraform? (Recommend: no)`,
    initial: "no",
  });

  const shouldInitialize = provisionRes["initialize"]
    .toLowerCase()
    .startsWith("y");

  if (shouldInitialize) {
    child.execSync(
      `node setup_terraform.js`,
      { stdio: "inherit" }
    );
  } else {
    console.log(`No worries. Just run ./setup_terraform.js when you're ready to deploy to staging or production.`);
  }
}

(async function main() {
  await applyTemplates();
  const containsUserData = await doesSkillContainUserData();
  substituteUserDataBoolean(containsUserData);
  await configureJovoProjectFiles();
})().catch(err => {
  console.log(err);
});  
