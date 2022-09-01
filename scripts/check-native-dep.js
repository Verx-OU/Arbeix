import fs from "fs";
import { execSync } from "child_process";
import { dependencies } from "../package.json";

if (dependencies) {
  const dependenciesKeys = Object.keys(dependencies);
  const nativeDeps = fs
    .readdirSync("node_modules")
    .filter((folder) => fs.existsSync(`node_modules/${folder}/binding.gyp`));
  if (nativeDeps.length === 0) {
    process.exit(0);
  }
  try {
    // Find the reason for why the dependency is installed. If it is installed
    // because of a devDependency then that is okay. Warn when it is installed
    // because of a dependency
    const { dependencies: dependenciesObject } = JSON.parse(
      execSync(`npm ls ${nativeDeps.join(" ")} --json`).toString()
    );
    const rootDependencies = Object.keys(dependenciesObject);
    const filteredRootDependencies = rootDependencies.filter((rootDependency) =>
      dependenciesKeys.includes(rootDependency)
    );
    if (filteredRootDependencies.length > 0) {
      console.log(`Error: native dependencies: ${filteredRootDependencies.join(", ")}`);
      process.exit(1);
    }
  } catch (e) {
    console.log("Native dependencies could not be checked");
  }
}
