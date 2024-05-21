#!/usr/bin/env node
import { echo } from "zx";
import { myCustomArgv, readHelp } from "./helper.js";
import { getAllIntegrationsInOrg, getAllOrgsGroup } from "./api.js";

const cliVersion = "2.0.0";


(async () => {
  if (myCustomArgv.help || myCustomArgv.h) {
    readHelp();
  } else if (myCustomArgv.get_all_orgs_group) {
    getAllOrgsGroup();
  } else if (myCustomArgv.get_all_integrations_org) {
    getAllIntegrationsInOrg();
  } else if (myCustomArgv.version || myCustomArgv.v) {
    echo(`${cliVersion}`);
  } else {
    echo(`invalid command!`);
  }
})();
