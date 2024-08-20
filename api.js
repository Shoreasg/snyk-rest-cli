import { addIntegrationType, myCustomArgv } from "./helper.js";
import {
  paginationForDeleteEmptyTargetsInOrg,
  paginationForGetAllIntegrationsInOrg,
  paginationForGetAllOrgsGroup,
  paginationForGetIssuesCount,
} from "./pagination.js";
import { echo, chalk, spinner } from "zx";
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
                echo(`${chalk.redBright(target.id)} is empty. Deleting it...`);

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

export async function updateSnykCode() {
  try {
    if (
      myCustomArgv.sast_enabled === "true" ||
      myCustomArgv.sast_enabled === "false"
    ) {
      await getAllOrgsGroup();

      if (orgIds && orgIds.length > 0) {
        for (const orgId of orgIds) {
          const response = await fetch(
            `https://api.snyk.io/rest/orgs/${orgId}/settings/sast?version=${myCustomArgv.api_version}`,
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
            `${chalk.yellowBright(`Organization ID:`)}`,
            chalk.greenBright(orgId),
            `has Snyk Code ${
              data.data.attributes.sast_enabled === true
                ? chalk.yellowBright("Enabled")
                : chalk.redBright("Disabled")
            }`
          );
          if (myCustomArgv.sast_enabled === "true") {
            if (data.data.attributes.sast_enabled === false) {
              echo(
                chalk.greenBright(
                  `${orgId} has snyk code disabled. Enabling it...`
                )
              );
              try {
                await fetch(
                  `https://api.snyk.io/rest/orgs/${orgId}/settings/sast?version=${myCustomArgv.api_version}`,
                  {
                    method: "PATCH",
                    headers: {
                      accept: "application/vnd.api+json",
                      authorization: `TOKEN ${myCustomArgv.snyk_token}`,
                      "Content-Type": "application/vnd.api+json",
                    },
                    body: JSON.stringify({
                      data: {
                        attributes: {
                          sast_enabled: true,
                        },
                        id: `${orgId}`,
                        type: "string",
                      },
                    }),
                  }
                )
                  .then(async (response) => {
                    if (response.status == 201) {
                      echo(
                        `${chalk.greenBright(
                          orgId
                        )} is sucessfully updated. Snyk Code is Enabled!`
                      );
                    } else {
                      chalk.redBright(
                        `We have trouble updating ${orgId} snyk code to Enabled`
                      );
                    }
                  })
                  .catch((error) => {
                    echo(chalk.red(`Update error: ${error.message}`));
                    console.error(error);
                  });
              } catch (error) {
                echo(chalk.red(`Update error: ${error.message}`));
                console.error(error);
              }
            } else {
              echo(
                chalk.yellowBright(
                  `Organization ID: ${orgId} has Snyk Code Enabled! Skipping Org!`
                )
              );
            }
          } else {
            if (data.data.attributes.sast_enabled === true) {
              echo(
                chalk.greenBright(
                  `${orgId} has Snyk Code Enabled. Disabling it...`
                )
              );
              try {
                await fetch(
                  `https://api.snyk.io/rest/orgs/${orgId}/settings/sast?version=${myCustomArgv.api_version}`,
                  {
                    method: "PATCH",
                    headers: {
                      accept: "application/vnd.api+json",
                      authorization: `TOKEN ${myCustomArgv.snyk_token}`,
                      "Content-Type": "application/vnd.api+json",
                    },
                    body: JSON.stringify({
                      data: {
                        attributes: {
                          sast_enabled: false,
                        },
                        id: `${orgId}`,
                        type: "string",
                      },
                    }),
                  }
                )
                  .then(async (response) => {
                    if (response.status == 201) {
                      echo(
                        `${chalk.greenBright(
                          orgId
                        )} is sucessfully updated. Snyk Code is Disabled!`
                      );
                    } else {
                      chalk.redBright(
                        `We have trouble updating ${orgId} Snyk Code to Disabled`
                      );
                    }
                  })
                  .catch((error) => {
                    echo(chalk.red(`Update error: ${error.message}`));
                    console.error(error);
                  });
              } catch (error) {
                echo(chalk.red(`Update error: ${error.message}`));
                console.error(error);
              }
            }
            echo(
              chalk.yellowBright(
                `Organization ID: ${orgId} has Snyk Code Disabled! Skipping Org!`
              )
            );
          }
        }
      }
    } else {
      echo(chalk.red(`Unable to call API due to missing --sast_enabled`));
    }
  } catch (error) {
    echo(`Fetch error: ${error.message}`);
    console.error(error);
  }
}

export async function getIssuesCount() {
  try {
    await getAllOrgsGroup();

    if (orgIds && orgIds.length > 0) {
      await Promise.all(
        orgIds.map(async (orgId) => {
          const response = await fetch(
            `https://api.snyk.io/rest/orgs/${orgId}/issues?version=${myCustomArgv.api_version}&limit=100`,
            {
              method: "GET",
              headers: {
                accept: "application/vnd.api",
                authorization: `Token ${myCustomArgv.snyk_token}`,
              },
            }
          );

          if (!response.ok) {
            const errorText = await response.json();
            echo(
              chalk.red(
                `HTTP error! Status: ${response.status}, Response: ${JSON.stringify(errorText)}`
              )
            );
            return;
          }

          const data = await response.json();
          const issues = data.data;

          let lowIssueCount = 0;
          let mediumIssueCount = 0;
          let highIssueCount = 0;
          let criticalIssueCount = 0;

          await (spinner(chalk.red(`Calculating number of issues for org ${orgId}`),async()=>{
            for (const issue of issues) {
              switch (issue.attributes.effective_severity_level) {
                case "low":
                  lowIssueCount++;
                  break;
                case "medium":
                  mediumIssueCount++;
                  break;
                case "high":
                  highIssueCount++;
                  break;
                case "critical":
                  criticalIssueCount++;
                  break;
              }
            }
  
            if (data.links.next) {
              await paginationForGetIssuesCount(
                data.links.next,
                orgId,
                lowIssueCount,
                mediumIssueCount,
                highIssueCount,
                criticalIssueCount
              );
            } else {
              echo(
                chalk.green(`Organization ID: ${orgId} has the following issues counts`)
              );
              echo(chalk.yellow(`Low Issues Counts: ${lowIssueCount}`));
              echo(chalk.yellow(`Medium Issues Counts: ${mediumIssueCount}`));
              echo(chalk.yellow(`High Issues Counts: ${highIssueCount}`));
              echo(chalk.yellow(`Critical Issues Counts: ${criticalIssueCount}`));
            }
          }))

         
        })
      );
    }
  } catch (error) {
    echo(`Fetch error: ${error.message}`);
    console.error(error);
  }
}
