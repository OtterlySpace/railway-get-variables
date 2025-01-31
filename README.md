# Railway Get Variables

Get variables from a Railway service

## Inputs

### `TEAM_NAME`

**Required** The name of the team to get variables from

### `PROJECT_NAME`

**Required** The name of the project to get variables from

### `ENV_NAME`

**Required** The name of the environment to get variables from

### `SERVICE_NAME`

**Required** The name of the service to get variables from

### `VARIABLES_NAMES`

**Required** The name of the variables to get. Formatted as an array of strings.

## Example usage

```yaml
name: Get variables from Railway

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    container: ghcr.io/railwayapp/cli:latest
    env:
      RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
    steps:
      - name: Get variables
        uses: OtterlySpace/railway-get-variables@v1
        with:
          TEAM_NAME: my-team
          PROJECT_NAME: my-project
          ENV_NAME: my-env
          SERVICE_NAME: my-service
          VARIABLES_NAMES: MY_VARIABLE_1,MY_VARIABLE_2

```