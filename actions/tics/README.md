# Scan your code with TiCS
Using this GitHub Action, you scan your code, decorate your pull requests and detect bugs and vulnerabilities.
It contains one action step to use within your workflow.

* [Publish TICS](#publish-tics) Posting results related to Quality Gate.

## Requirements

* Have TiCS installed in your system. 

## Run TICS

The workflow, usually declared in `.github/workflows/build.yml`, looks like:

## Publish TICS

```yaml

name: Build

on:
  pull_request: 
        types: [ opened, edited, synchronize, reopened ]


jobs:
  TiCSDemo-CI:
    name: TiCS
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v2
      - name: Publish TICS
        uses: ./
        env: 
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
        with:
          projectName: 'TiCS-Action'                                        # mandatory, default value is the project name that this action is running on
          branchName: 'andriopoulou-danai-patch-1'                          # mandatory, default value is the branch name that this action is running on
          branchDir: '/home/danai/Tics-Plugins/TICS-Action-1/TICS-Action'     # mandatory
          ticsViewerUrl: 'http://localhost:20212/tiobeweb/2021.2/'          # mandatory
          clientToken: 'githubToken'                                        # mandatory, the user token for the TiCS Viewer
```

### Secrets
- *`GITHUB_TOKEN` – Provided by Github (see [Authenticating with the GITHUB_TOKEN](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token)).*
