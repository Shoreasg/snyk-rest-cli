import { echo, fs, minimist } from "zx";
import path from "path";
import { fileURLToPath } from "url";
import renderMarkdown from "./markdown-render.js";
const integrationTypes = new Set();

export const addIntegrationType = (type, integrationId) => {
  
  const key = `${type}-${integrationId}`;
  if (!integrationTypes.has(key)) {
    integrationTypes.add(key);
    return true;
  }
  return false;
};

export function readHelp() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const helpFilePath = path.join(__dirname, "README.md");
  const helpMD = fs.readFileSync(helpFilePath, "utf8");
  echo(renderMarkdown(helpMD));
}

export const myCustomArgv = minimist(process.argv.slice(2), {
  string: [
    "group_id",
    "api_version",
    "snyk_token",
    "starting_after",
    "source_types",
    "sast_enabled"
  ],
  boolean: [
    "help",
    "get_all_orgs_group",
    "version",
    "v",
    "get_all_integrations_org",
    "delete_empty_targets",
    "update_snyk_code_orgs"
  ],
});
