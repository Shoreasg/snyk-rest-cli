import { addIntegrationType, myCustomArgv } from "./helper.js";
import {
  paginationForDeleteEmptyTargetsInOrg,
  paginationForGetAllIntegrationsInOrg,
  paginationForGetAllOrgsGroup,
} from "./pagination.js";
import { echo, chalk } from "zx";
let orgIds = [];

export async function getAllIntegrationsInOrg() {
  try {
    // first get all orgs id in a group
    await getAllOrgsGroup();
    if (orgIds && orgIds.length > 0) {
      // then get all target and their integrations
      for (const orgId of orgIds) {
        const response = await fetch(
          `https://api.snyk.io/rest/orgs/${orgId}/targets?version=${
            myCustomArgv.api_version
          }&exclude_empty=false${
            myCustomArgv.source_types
              ? `&source_types=${myCustomArgv.source_types}`
              : ""
          }`,
          {
            method: "GET",
            headers: {
              accept: "application/vnd.api+json",
              authorization: `TOKEN ${myCustomArgv.snyk_token}`,
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.json();
          echo(
            chalk.red(
              `HTTP error! Status: ${
                response.status
              }, Response: ${JSON.stringify(errorText)}`
            )
          );
          return;
        }

        const data = await response.json();
        echo(
          chalk.underline(
            `${chalk.yellowBright(`Organization ID:`)}`,
            chalk.greenBright(orgId),
            `have the following integrations`
          )
        );
        if (data.data.length > 0) {
          for (const target of data.data) {
            const integration = target.relationships.integration.data;
            const { integration_type: type } = integration.attributes;
            const id = integration.id;
            if (addIntegrationType(type, id)) {
              echo(
                `${chalk.yellowBright(`Integration Type:`)} ${chalk.greenBright(
                  type
                )}, ${chalk.yellowBright(`ID:`)} ${chalk.greenBright(id)}`
              );
            }
          }
          if (data.links.next) {
            await paginationForGetAllIntegrationsInOrg(data.links.next);
          }
        } else {
          echo(`${chalk.redBright(`No integrations for this Organization!`)}`);
        }
      }
    }
  } catch (error) {
    echo(`Fetch error: ${error.message}`);
    console.error(error);
  }
}

export async function getAllOrgsGroup() {
  if (myCustomArgv.snyk_token) {
    if (myCustomArgv.group_id && myCustomArgv.api_version) {
      try {
        const response = await fetch(
          `https://api.snyk.io/rest/groups/${myCustomArgv.group_id}/orgs?version=${myCustomArgv.api_version}`,
          {
            method: "GET",
            headers: {
              accept: "application/vnd.api+json",
              authorization: `TOKEN ${myCustomArgv.snyk_token}`,
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.json();
          echo(
            chalk.red(
              `HTTP error! Status: ${
                response.status
              }, Response: ${JSON.stringify(errorText)}`
            )
          );
          return;
        }

        const data = await response.json();
        if (data.links.next) {
          for (const element of data.data) {
            orgIds.push(element.id);
          }
          await paginationForGetAllOrgsGroup(data.links.next, orgIds);
        } else {
          data.data.forEach((element) => {
            orgIds.push(element.id);
          });
        }
        echo(
          chalk.blueBright.underline(
            `Found the following org ids in group ${myCustomArgv.group_id}`
          )
        );
        orgIds.forEach((orgId) => {
          echo(
            chalk.yellowBright(`Organization ID: ${chalk.greenBright(orgId)}`)
          );
        });
        return orgIds;
      } catch (error) {
        echo(`Fetch error: ${error.message}`);
        console.error(error);
      }
    } else {
      echo(
        chalk.red(
          `Unable to call API due to missing --group_id or --api_version`
        )
      );
    }
  } else {
    echo(chalk.red(`Unable to call API due to missing API token`));
  }
}

export async function deleteEmptyTargets() {
  // first check if the target has any projects
  try {
    await getAllOrgsGroup();
    if (orgIds && orgIds.length > 0) {
      // then get all target
      for (const orgId of orgIds) {
        const response = await fetch(
          `https://api.snyk.io/rest/orgs/${orgId}/targets?version=${myCustomArgv.api_version}&exclude_empty=false`,
          {
            method: "GET",
            headers: {
              accept: "application/vnd.api+json",
              authorization: `TOKEN ${myCustomArgv.snyk_token}`,
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.json();
          echo(
            chalk.red(
              `HTTP error! Status: ${
                response.status
              }, Response: ${JSON.stringify(errorText)}`
            )
          );
          return;
        }

        const data = await response.json();
        echo(
          chalk.underline(
            `${chalk.yellowBright(`Organization ID:`)}`,
            chalk.greenBright(orgId),
            `have the following targets`
          )
        );
        if (data.data.length > 0) {
          for (const target of data.data) {
            echo(
              `${chalk.yellowBright(`Target ID:`)} ${chalk.greenBright(
                target.id
              )}`
            );
            try {
              const response = await fetch(
                `https://api.snyk.io/rest/orgs/${orgId}/projects?target_id=${target.id}&version=${myCustomArgv.api_version}`,
                {
                  method: "GET",
                  headers: {
                    accept: "application/vnd.api+json",
                    authorization: `TOKEN ${myCustomArgv.snyk_token}`,
                  },
                }
              );
              if (!response.ok) {
                const errorText = await response.json();
                echo(
                  chalk.red(
                    `HTTP error! Status: ${
                      response.status
                    }, Response: ${JSON.stringify(errorText)}`
                  )
                );
                return;
              }

              const data = await response.json();

              if (data.data.length === 0) {
                echo(
                 `${chalk.redBright(
                    target.id
                  )} is empty. Deleting it...`
                );

                //call delete api here
                try {
                  await fetch(
                    `https://api.snyk.io/rest/orgs/${orgId}/targets/${target.id}?version=${myCustomArgv.api_version}`,
                    {
                      method: "DELETE",
                      headers: {
                        accept: "application/vnd.api+json",
                        authorization: `TOKEN ${myCustomArgv.snyk_token}`,
                      },
                    }
                  )
                    .then(async (response) => {
                      if (response.status == 204) {
                        echo(
                         `${chalk.greenBright(
                            target.id
                          )} is sucessfully deleted`
                        );
                      } else {
                        echo(
                          chalk.redBright(
                            `We have trouble deleting ${target.id} from ${orgId}`
                          )
                        );
                      }
                    })
                    .catch((error) => {
                      echo(chalk.red(`Delete error: ${error.message}`));
                      console.error(error);
                    });
                } catch (error) {
                  echo(chalk.red(`Delete error: ${error.message}`));
                  console.error(error);
                }
              } else {
                echo(
                  chalk.yellowBright(
                    `Target: ${target.id} is not empty! Skipping target!`
                  )
                );
              }
            } catch (error) {
              echo(`Fetch error: ${error.message}`);
              console.error(error);
            }
          }

          if (data.links.next) {
            await paginationForDeleteEmptyTargetsInOrg(data.links.next, orgId);
          }

          echo(
            chalk.greenBright(
              `No more empty targets for this organization ID: ${orgId}`
            )
          );
        } else {
          echo(`${chalk.redBright(`No targets for this Organization!`)}`);
        }
      }
    }
  } catch (error) {
    echo(`Fetch error: ${error.message}`);
    console.error(error);
  }
}
