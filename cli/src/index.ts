#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { spawn } from "child_process";

const API_BASE = "https://craig-o-secrets.vercel.app/api/v1";
const CONFIG_DIR = path.join(os.homedir(), ".craig-o-secrets");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

interface Config {
  apiKey?: string;
  defaultProject?: string;
  defaultEnvironment?: string;
}

function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    }
  } catch {
    // Ignore errors
  }
  return {};
}

function saveConfig(config: Config): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const config = loadConfig();
  if (!config.apiKey) {
    throw new Error("Not logged in. Run 'cos login' first.");
  }

  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

program
  .name("cos")
  .description("Craig-O-Secrets CLI - Secure secrets management")
  .version("1.0.0");

// Login command
program
  .command("login")
  .description("Authenticate with your API key")
  .option("-k, --key <key>", "API key")
  .action(async (options) => {
    let apiKey = options.key;

    if (!apiKey) {
      const readline = await import("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      apiKey = await new Promise<string>((resolve) => {
        rl.question(chalk.cyan("Enter your API key: "), (answer: string) => {
          rl.close();
          resolve(answer);
        });
      });
    }

    const spinner = ora("Verifying API key...").start();

    try {
      const res = await fetch(`${API_BASE}/api-keys`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (res.ok) {
        saveConfig({ ...loadConfig(), apiKey });
        spinner.succeed(chalk.green("Successfully logged in!"));
      } else {
        spinner.fail(chalk.red("Invalid API key"));
        process.exit(1);
      }
    } catch (error) {
      spinner.fail(chalk.red("Failed to verify API key"));
      process.exit(1);
    }
  });

// Logout command
program
  .command("logout")
  .description("Remove stored credentials")
  .action(() => {
    const config = loadConfig();
    delete config.apiKey;
    saveConfig(config);
    console.log(chalk.green("Logged out successfully"));
  });

// Pull secrets command
program
  .command("pull")
  .description("Pull secrets and output as environment variables")
  .requiredOption("-p, --project <id>", "Project ID or slug")
  .requiredOption("-e, --env <id>", "Environment ID or slug")
  .option("-f, --format <format>", "Output format (env|json|yaml)", "env")
  .action(async (options) => {
    const spinner = ora("Fetching secrets...").start();

    try {
      const res = await apiRequest(
        `/secrets?environmentId=${options.env}&projectId=${options.project}`
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch secrets");
      }

      const data = await res.json();
      spinner.stop();

      if (options.format === "json") {
        const secretsObj: Record<string, string> = {};
        for (const secret of data.secrets) {
          secretsObj[secret.key] = secret.value;
        }
        console.log(JSON.stringify(secretsObj, null, 2));
      } else if (options.format === "yaml") {
        for (const secret of data.secrets) {
          console.log(`${secret.key}: "${secret.value}"`);
        }
      } else {
        // Default env format
        for (const secret of data.secrets) {
          console.log(`${secret.key}="${secret.value}"`);
        }
      }
    } catch (error) {
      spinner.fail(chalk.red(error instanceof Error ? error.message : "Failed to fetch secrets"));
      process.exit(1);
    }
  });

// Push secrets command
program
  .command("push")
  .description("Push secrets from a .env file")
  .requiredOption("-p, --project <id>", "Project ID or slug")
  .requiredOption("-e, --env <id>", "Environment ID")
  .argument("<file>", "Path to .env file")
  .action(async (file, options) => {
    const spinner = ora("Pushing secrets...").start();

    try {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      let pushed = 0;
      let failed = 0;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        if (!match) continue;

        const [, key, rawValue] = match;
        // Remove quotes if present
        const value = rawValue.replace(/^["']|["']$/g, "");

        const res = await apiRequest("/secrets", {
          method: "POST",
          body: JSON.stringify({
            key,
            value,
            environmentId: options.env,
          }),
        });

        if (res.ok) {
          pushed++;
        } else {
          failed++;
        }
      }

      spinner.succeed(
        chalk.green(`Pushed ${pushed} secrets`) +
          (failed > 0 ? chalk.yellow(`, ${failed} failed`) : "")
      );
    } catch (error) {
      spinner.fail(chalk.red(error instanceof Error ? error.message : "Failed to push secrets"));
      process.exit(1);
    }
  });

// Run command with injected secrets
program
  .command("run")
  .description("Run a command with injected secrets")
  .requiredOption("-p, --project <id>", "Project ID or slug")
  .requiredOption("-e, --env <id>", "Environment ID")
  .argument("<command...>", "Command to run")
  .action(async (command, options) => {
    const spinner = ora("Fetching secrets...").start();

    try {
      const res = await apiRequest(
        `/secrets?environmentId=${options.env}&projectId=${options.project}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch secrets");
      }

      const data = await res.json();
      spinner.succeed(`Loaded ${data.secrets.length} secrets`);

      // Build environment
      const env: Record<string, string> = { ...process.env } as Record<string, string>;
      for (const secret of data.secrets) {
        env[secret.key] = secret.value;
      }

      // Run command
      const [cmd, ...args] = command;
      const child = spawn(cmd, args, {
        env,
        stdio: "inherit",
        shell: true,
      });

      child.on("exit", (code) => {
        process.exit(code || 0);
      });
    } catch (error) {
      spinner.fail(chalk.red(error instanceof Error ? error.message : "Failed to run command"));
      process.exit(1);
    }
  });

// List projects
program
  .command("projects")
  .description("List all projects")
  .action(async () => {
    const spinner = ora("Fetching projects...").start();

    try {
      const res = await apiRequest("/projects");

      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await res.json();
      spinner.stop();

      if (data.projects.length === 0) {
        console.log(chalk.yellow("No projects found"));
        return;
      }

      console.log(chalk.bold("\nProjects:\n"));
      for (const project of data.projects) {
        console.log(chalk.cyan(`  ${project.name}`));
        console.log(chalk.gray(`    ID: ${project.id}`));
        console.log(chalk.gray(`    Slug: ${project.slug}`));
        console.log(chalk.gray(`    Team: ${project.team.name}`));
        console.log(
          chalk.gray(
            `    Environments: ${project.environments.map((e: { name: string }) => e.name).join(", ")}`
          )
        );
        console.log();
      }
    } catch (error) {
      spinner.fail(chalk.red(error instanceof Error ? error.message : "Failed to fetch projects"));
      process.exit(1);
    }
  });

// List secrets
program
  .command("secrets")
  .description("List secrets in an environment")
  .requiredOption("-e, --env <id>", "Environment ID")
  .option("--show-values", "Show secret values")
  .action(async (options) => {
    const spinner = ora("Fetching secrets...").start();

    try {
      const res = await apiRequest(`/secrets?environmentId=${options.env}`);

      if (!res.ok) {
        throw new Error("Failed to fetch secrets");
      }

      const data = await res.json();
      spinner.stop();

      if (data.secrets.length === 0) {
        console.log(chalk.yellow("No secrets found"));
        return;
      }

      console.log(chalk.bold("\nSecrets:\n"));
      for (const secret of data.secrets) {
        console.log(chalk.cyan(`  ${secret.key}`));
        if (options.showValues) {
          console.log(chalk.green(`    Value: ${secret.value}`));
        } else {
          console.log(chalk.gray(`    Value: ********`));
        }
        if (secret.description) {
          console.log(chalk.gray(`    Description: ${secret.description}`));
        }
        console.log(chalk.gray(`    Version: ${secret.version}`));
        console.log();
      }
    } catch (error) {
      spinner.fail(chalk.red(error instanceof Error ? error.message : "Failed to fetch secrets"));
      process.exit(1);
    }
  });

program.parse();
