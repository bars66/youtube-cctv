export async function main(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require("../package.json");

  console.log(`${pkg.name}@${pkg.version}`);
}
