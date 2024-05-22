import { echo, fetch, chalk } from "zx";
import { addIntegrationType, myCustomArgv } from "./helper.js";

export const paginationForGetAllOrgsGroup = async (nextPage, orgIds) => {
  if (nextPage) {
    await fetch(`https://api.snyk.io${nextPage}`, {
      method: "GET",
      headers: {
        accept: "application/vnd.api+json",
        authorization: `TOKEN ${myCustomArgv.snyk_token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
        for (const element of data.data) {
          orgIds.push(element.id);
        }
        nextPage = data.links.next;
      })
      .catch((error) => {
        echo(chalk.red(`Fetch error: ${error.message}`));
        console.error(error);
      });
    return paginationForGetAllOrgsGroup(nextPage, orgIds);
  } else {
    return null;
  }
};

export const paginationForGetAllIntegrationsInOrg = async (nextPage) => {
  if (nextPage) {
    await fetch(`https://api.snyk.io${nextPage}`, {
      method: "GET",
      headers: {
        accept: "application/vnd.api+json",
        authorization: `TOKEN ${myCustomArgv.snyk_token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
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
          nextPage = data.links.next;
        } else {
          echo(`${chalk.redBright(`No integrations for this Organization!`)}`);
        }
      })
      .catch((error) => {
        echo(chalk.red(`Fetch error: ${error.message}`));
        console.error(error);
      });
    return paginationForGetAllIntegrationsInOrg(nextPage);
  } else {
    return null;
  }
};

export const paginationForDeleteEmptyTargetsInOrg = async (nextPage, orgId) => {
  if (nextPage) {
    await fetch(`https://api.snyk.io${nextPage}`, {
      method: "GET",
      headers: {
        accept: "application/vnd.api+json",
        authorization: `TOKEN ${myCustomArgv.snyk_token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
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
                          )}sucessfully deleted`
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
          nextPage = data.links.next;
        } else {
          echo(`${chalk.redBright(`No targets for this Organization!`)}`);
        }
      })
      .catch((error) => {
        echo(chalk.red(`Fetch error: ${error.message}`));
        console.error(error);
      });
    return paginationForDeleteEmptyTargetsInOrg(nextPage, orgId);
  } else {
    return null;
  }
};
