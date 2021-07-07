const { Octokit } = require("@octokit/action"); //GitHub API client for GitHub Actions
let { config } = require('../../configuration');
const core = require('@actions/core');

//Octokit client is authenticated
const octokit = new Octokit();

/* Helper functions to get all changed files params of a pull request */
const getParams = () => {

    let parameters = {
        accept: 'application/vnd.github.v3+json',
        owner: config.owner,
        repo: config.reponame,
        pull_number: config.eventpayload.pull_request.number,
        per_page: 100,
        page: 1,
    }

    return parameters;
}

const getPRChangedFiles =  async() => {

    let changedFiles = "";

    try {
       await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', getParams()).then((response) => {
            core.debug(`Getting the changed files list ${response.data}`)

            response.data && response.data.map((item, i) => {
                changedFiles += item.filename + " ,"
            })

            changedFiles = changedFiles.slice(0, -1); // remove the last comma

            return changedFiles; 
        })
    } catch(e) {
        core.error(`We cannot retrieve the files that changed in this PR: ${e}`)
    }

    return changedFiles;
};

module.exports = {
    getPRChangedFiles: getPRChangedFiles
}