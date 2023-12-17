export async function main(): Promise<void> {
  const pkg = require("../package.json");

  console.log(`${pkg.name}@${pkg.version}`);
}
