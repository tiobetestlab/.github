const { Octokit } = require("@octokit/action"); //GitHub API client for GitHub Actions
let { config } = require('../../configuration');

//Octokit client is authenticated
const octokit = new Octokit();

/* Helper functions to get all changed files in a pull request */
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

    let changedFiles = {};
    
    await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', getParams()).then((response) => {
        console.log("Getting the changed files list ", response.data)
        changedFiles = response.data;   
    })

    return changedFiles;
};

module.exports = {
    getPRChangedFiles: getPRChangedFiles
}