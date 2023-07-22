#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs";
import https from "node:https";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";

const baseUrl =
  "https://raw.githubusercontent.com/vasucp1207/flowbite-template/main/";
const spinner = ora("Setting up project...");
const QUESTIONS = [
  {
    name: 'project-name',
    type: 'input',
    message: 'Project name'
  }
];

inquirer
  .prompt(QUESTIONS)
  .then(answer => {
    const projectName = answer['project-name'];
    const isPrettier = answer['prettier'];
    createProject(projectName, isPrettier);
  });

function createProject(dirName, isPrettier) {
  spinner.start();
  if (fs.existsSync(dirName)) {
    console.error(chalk.white.bgRed(`Directory "${dirName}" already exists!`));
    process.exit(1);
  }

  const files = `
    package.json
    vite.config.js
    tailwind.config.cjs
    svelte.config.js
    postcss.config.cjs
    jsconfig.json
    README.md
    .prettierrc
    .prettierignore
    static/favicon.png
    static/robots.txt
    src/app.d.ts
    src/app.html
    src/app.postcss
    src/routes/+layout.svelte
    src/routes/+page.svelte
    src/routes/buttons/+page.svelte
    `
    .split(/\s/)
    .filter((file) => file);

  const getFiles = (index = 0) => {
    const file = files[index];
    if (!file) {
      spinner.stop();
      return;
    };
    const destFile = path.join(dirName, file.replace("/", path.sep));
    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    https.get(baseUrl + file, (res) => {
      res.pipe(fs.createWriteStream(destFile));
      res.on("end", () => getFiles(index + 1));
    });
  };

  getFiles();

  process.on("exit", (code) => {
    if (!code) {
      console.info(chalk.green.underline(`Successfully created "${dirName}" 🎉`));
      console.info(chalk.cyan(`cd ${dirName}`));
      console.info(chalk.cyan('npm install'));
    }
  });
}
