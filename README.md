# CLI help

snyk-rest-cli helps you to call the REST API and provide you functionalities that the REST API doesn't provide.

# Functions

## GET API  

1. GET all organizations in a group


## How to get started

1. Input --snyk_token=<`SnykToken/ServiceToken`>
2. Input --version=<`The requested version of the endpoint to process the request`>
3. Look at the available commands below and add the required flags for the command to work

## Available commands

To learn more about each snyk-rest-cli CLI command, use the `--help` option`.

**Note:** The help on the docs site is the same as the `--help` in the CLI.

### `snyk-rest-cli --get_all_orgs_group`

Get all orgs for the specify group.

# Required flags

1. `--group_id`: Your group id

# optional flags

1. `--starting_after`: Return the page of results immediately after this cursor