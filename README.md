# Note

This is an open-source community project. This code is developed in the open with input from the community through issues and PRs.

1. As a community project, all requests, feedback, and issues are managed through Github issues.
2. Snyk techincal support will not handle cases related to this tool and will redirect you back to this process
3. Pull Requests are encouraged to submit changes, which the author will review.
4. This repository is not affiliated with Snyk and its a community side project. Any issues, please look for the author of this repository.


# CLI help

snyk-rest-cli helps you to call the REST API and provide you functionalities that the REST API doesn't provide.

# How to install

`npm i snyk-rest-cli -g`

Check if you have install correctly by running:

`snyk-rest-cli -v`

# Functions

## GET API  

1. GET all organizations in a group
2. GET all integrations for all organizations in a group.

## DELETE API

1. Delete empty targets


## How to get started

1. Every command requires these 2 flag --snyk_token=<`SnykToken/ServiceToken`> and  --api_version=<`The requested version of the endpoint to process the request`>
2. Look at the available commands below and add the required flags for the command to work

## Available commands

### `snyk-rest-cli --help`

Give you the list of commands available for this CLI

**Note:** The help on the docs site is the same as the `--help` in the CLI.

### `snyk-rest-cli -v or --version`

Give you the version of the CLI

# `snyk-rest-cli --get_all_orgs_group`

Get all orgs for the specify group.

## Required flags

1. `--group_id`: Your group id

# `snyk-rest-cli --get_all_integrations_org`

Get all integrations for all orgs in the specified group.
## Required flags

1. `--group_id`: Your group id

## optional flags

1. `--source_types`: if you want to check if all of the orgs in a group have integrated a certain integration, use this flag. (can only specify 1 type of integration!)

# `snyk-rest-cli --delete_empty_targets`

Get all targets in a group, check if the target is empty, if true, delete it.

## Required flags

1. `--group_id`: Your group id

# `snyk-rest-cli --update_snyk_code_orgs`

Get all organizations in a group and check their snyk code settings, set all to enable / disable

## Required flags

1. `--group_id`: Your group id
2. `--sast_enabled`: Enable / Disable Snyk Code