# Scan your code with TiCS
Using this GitHub Action, you scan your code, decorate your pull requests and detect bugs and vulnerabilities.
It contains one action step to use within your workflow.

* [Publish TICS](#publish-tics) Posting results related to Quality Gate.

## Requirements

* Have TiCS installed in your system. 
* An action runner should have been installed on the repo you are wishing to run the action.

## Run TICS

The workflow, usually declared in `.github/workflows/build.yml`, looks like:

## Publish TICS

```yaml

name: CI

# Controls when the action will run. 
on:
  # Triggers the workflow on push or pull request events but only for the main branch
  push:
    branches: [ master ]
  pull_request:
    types: [ opened, edited, synchronize, reopened ]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "build"
  build:
    # The type of runner that the job will run on
    runs-on: self-hosted

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:

      - name: TICS Action Run
        uses: ./.github/actions/tics
        env: 
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
        with:
          projectName: 'BazelCpp'
          branchName: 'master'
          ticsViewerUrl: 'https://testlab.tiobe.com/tiobeweb/testlab/'
          ticsAuthToken: 'NGUyOTFkMzMtM2ExYS00MDhjLTgzMDktMTVlNjBlYjZmMzM5OnBTWiVNUl5FZmdSLTpwQg'
          clientToken: 'bazel'
          tmpDir: 'C:/temp/bazel'

```

### Secrets
- *`GITHUB_TOKEN` – Provided by Github (see [Authenticating with the GITHUB_TOKEN](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token)).*
