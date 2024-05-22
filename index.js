#!/usr/bin/env node
import { echo } from "zx";
import { myCustomArgv, readHelp } from "./helper.js";
import { deleteEmptyTargets, getAllIntegrationsInOrg, getAllOrgsGroup } from "./api.js";

const cliVersion = "3.0.0";


(async () => {
  if (myCustomArgv.help || myCustomArgv.h) {
    readHelp();
  } else if (myCustomArgv.get_all_orgs_group) {
    getAllOrgsGroup();
  } else if (myCustomArgv.get_all_integrations_org) {
    getAllIntegrationsInOrg();
  } else if (myCustomArgv.version || myCustomArgv.v) {
    echo(`${cliVersion}`);
  } else if (myCustomArgv.delete_empty_targets){
    deleteEmptyTargets();
  }
   else {
    echo(`invalid command!`);
  }
})();
