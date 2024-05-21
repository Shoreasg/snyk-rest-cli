import { echo, fetch, chalk } from "zx";
import { addIntegrationType, myCustomArgv } from "./helper.js";

export const paginationForGetAllOrgsGroup = async (nextPage) => {
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
        data.data.forEach((element) => {
          orgIds.push(element.id);
        });
        nextPage = data.links.next;
      })
      .catch((error) => {
        echo(chalk.red(`Fetch error: ${error.message}`));
        console.error(error);
      });
    return paginationForGetAllOrgsGroup(nextPage);
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
          data.data.forEach((target) => {
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
          });
          nextPage = data.links.next;
        } else {
          echo(`${chalk.redBright(`No integrations for this Organization!`)}`);
          if (data.links.next) {
            paginationForGetAllIntegrationsInOrg(data.links.next);
          }
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
