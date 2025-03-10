#!/usr/bin/env node
import { echo } from "zx";
import { myCustomArgv, readHelp } from "./helper.js";
import { deleteEmptyTargets, getAllIntegrationsInOrg, getAllOrgsGroup, getIssuesCount, updateSnykCode } from "./api.js";

const cliVersion = "5.0.2";


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
  } else if (myCustomArgv.update_snyk_code_orgs){
    updateSnykCode();
  } else if (myCustomArgv.get_all_org_issues){
    getIssuesCount();
  }
   else {
    echo(`invalid command!`);
  }
})();
