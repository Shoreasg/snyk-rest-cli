#!/usr/bin/env node
import { echo, fs, fetch, minimist } from "zx";
import renderMarkdown from "./markdown-render.js";

const myCustomArgv = minimist(process.argv.slice(2), {
  string: ["group_id", "version", "snyk_token","starting_after"],
  boolean: ["help", "get_all_orgs_group"],
});

function readHelp() {
  const helpMD = fs.readFileSync("README.md", "utf8");
  echo(renderMarkdown(helpMD));
}

async function getAllOrgsGroup() {
  if (myCustomArgv.snyk_token) {
    if (myCustomArgv.group_id && myCustomArgv.version) {
      try {
        const response = await fetch(
          `https://api.snyk.io/rest/groups/${myCustomArgv.group_id}/orgs?version=${myCustomArgv.version}${myCustomArgv.starting_after?`&starting_after=${myCustomArgv.starting_after}`:""}`,
          {
            method: "GET",
            headers: {
              accept: "application/vnd.api+json",
              authorization: `TOKEN ${myCustomArgv.snyk_token}`,
            },
          },
        );
        if (!response.ok) {
          const errorText = await response.json();
          echo(`HTTP error! Status: ${response.status}, Response: ${JSON.stringify(errorText)}`);
          return;
        }

        const data = await response.json();
        echo(JSON.stringify(data, null, 2)); // Handle the response data
      } catch (error) {
        echo(`Fetch error: ${error.message}`);
        console.error(error)
      }
    } else {
      echo(`Unable to call API due to missing --group_id or --version`);
    }
  } else {
    echo(`Unable to call API due to missing API token`);
  }
}

(async () => {
  if (myCustomArgv.help || myCustomArgv.h) {
    readHelp();
  } else if (myCustomArgv.get_all_orgs_group) {
    getAllOrgsGroup();
  } else {
    echo(`invalid command!`);
  }
})();
