# snyk-rest-cli

`snyk-rest-cli` is a community-driven open-source CLI tool that helps you interact with Snyk's REST API, offering additional functionalities beyond the API's built-in capabilities.

## ⚠️ Note

This repository is an **open-source community project** in **partnership with Snyk**. Contributions and discussions happen openly through issues and pull requests.

- All **feedback, issues, and requests** should be managed through **GitHub Issues**.
- **Snyk technical support will not handle issues** related to this tool and will redirect you here.
- **Pull requests are encouraged**—the repository author will review submissions.
- For any questions or issues, please contact the **repository author**.

For more information about Snyk, visit [Snyk's official site](https://snyk.io/?utm_source=open-source&utm_medium=pg-ptr&utm_campaign=ref-2501-osp&utm_content=pg-cta).

---

## 🚀 Installation

Install the CLI globally using npm:

```sh
npm i snyk-rest-cli -g
```

Verify the installation:

```sh
snyk-rest-cli -v
```

---

## 📌 Features

### ✅ GET API  

- Retrieve all organizations in a group.
- Retrieve all integrations for all organizations in a group.
- Retrieve issue counts for all organizations in a group.

### 🗑️ DELETE API

- Delete empty targets.

---

## 🔧 Getting Started

All commands require two mandatory flags:

- `--snyk_token=<SnykToken/ServiceToken>`  
- `--api_version=<The requested API version>`

Refer to the available commands below and include the necessary flags for execution.

---

## 📜 Available Commands

### 🔹 General Commands

#### `snyk-rest-cli --help`
Displays a list of available commands.

**Note:** The documentation site help is identical to the `--help` command.

#### `snyk-rest-cli -v` or `snyk-rest-cli --version`
Displays the CLI version.

---

### 🔍 Retrieve Data

#### `snyk-rest-cli --get_all_orgs_group`
Fetch all organizations in the specified group.

**Required Flags:**
- `--group_id`: Your group ID.

#### `snyk-rest-cli --get_all_integrations_org`
Fetch all integrations for all organizations in a specified group.

**Required Flags:**
- `--group_id`: Your group ID.

**Optional Flags:**
- `--source_types`: Check if all organizations in the group have integrated a specific integration (only supports one integration type at a time).

#### `snyk-rest-cli --get_all_org_issues`
Retrieve issue counts for all organizations in a group, categorized by severity.

**Required Flags:**
- `--group_id`: Your group ID.

---

### ⚙️ Modify or Delete Data

#### `snyk-rest-cli --delete_empty_targets`
Retrieve all targets in a group, check if they are empty, and delete them if true.

**Required Flags:**
- `--group_id`: Your group ID.

#### `snyk-rest-cli --update_snyk_code_orgs`
Fetch all organizations in a group, check their Snyk Code settings, and enable/disable as required.

**Required Flags:**
- `--group_id`: Your group ID.
- `--sast_enabled`: Enable or disable Snyk Code.

---

## 📢 Contributing

We welcome contributions! If you'd like to submit changes:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request.

For discussions, open an issue in the repository.
