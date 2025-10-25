#!/usr/bin/env node
import { execa } from "execa";
import { join } from "path";
import { fileURLToPath } from "url";
import degit from "degit";
import ora from "ora";
import fs from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const projectName = process.argv[2] || "my-app";
const projectPath = join(process.cwd(), projectName);
const spinner = ora();

async function main() {
  console.log(`🚀 Creating project: ${projectName}`);

  // 1. Clone template
  spinner.start("Downloading template...");
  const emitter = degit("GeKaixing/next-saas-template#main", {
    cache: false,
    force: true,
  });
  await emitter.clone(projectPath);
  spinner.succeed("Template downloaded!");

  if (!fs.existsSync(projectPath)) {
    spinner.fail("Failed to create project directory.");
    process.exit(1);
  }

  // 2. Install dependencies
  spinner.start("Installing dependencies...");
  const pkgManager = process.env.npm_config_user_agent?.split("/")[0] || "npm";
  const installArgs =
    pkgManager === "yarn"
      ? ["install", "--ignore-engines"]
      : ["install", "--legacy-peer-deps"];

  await execa(pkgManager, installArgs, {
    cwd: projectPath,
    stdio: "inherit",
  });
  spinner.succeed("Dependencies installed!");

  // 3. Initialize Git
  spinner.start("Initializing Git...");
  await execa("git", ["init"], { cwd: projectPath });
  spinner.succeed("Git initialized!");

  // 4. Finish message
  console.log(`
✅ Project setup completed!

👉 Move into the project:
   cd ${projectName}

👉 Start development server:
   ${pkgManager} run dev
`);
}

main().catch((err) => {
  spinner.fail("Project creation failed.");
  console.error(err);
  process.exit(1);
});
