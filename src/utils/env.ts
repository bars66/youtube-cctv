require("dotenv").config();

export function getEnv(name: string): string {
  const env = process.env[name];
  if (!env) {
    throw new Error(`Env ${name} not found in .env`);
  }

  return env;
}
