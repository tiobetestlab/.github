const { Octokit } = require("@octokit/action"); //GitHub API client for GitHub Actions
let { config } = require('../../configuration');

//Octokit client is authenticated
const octokit = new Octokit();

/* Helper functions to construct a checkrun */
const getParams = (inputparams) => {
    let parameters = {};

    parameters = {
        accept: 'application/vnd.github.v3+json',
        owner: config.owner,
        repo: config.reponame,
        head_sha: config.eventpayload.pull_request.head.sha,
        name: inputparams.name,
        check_run_id: inputparams.check_run_id ? inputparams.check_run_id : '',
        status: inputparams.status,
        conclusion: inputparams.conclusion ? inputparams.conclusion : '',
        completed_at: inputparams.completed_at ? inputparams.completed_at : '',
        output: {
            title: inputparams.output.title,
            summary: inputparams.output.summary,
            text: inputparams.output.text,
            annotations: inputparams.output.annotations ? inputparams.output.annotations : [],
            images: inputparams.output.images ? inputparams.output.images : []
        }

    }

    return parameters;
}

const addCheckRun =  async(params) => {

    let checkrunRes = {};

    //console.log("addCheckRun ", getParams(params))
    await octokit.request('POST /repos/{owner}/{repo}/check-runs', {
        owner: config.owner,
        repo: config.reponame,
        head_sha: config.eventpayload.pull_request.head.sha,
        name: params.name,
        status: params.status,
        started_at: params.started_at ? params.started_at : '',
        output: {
            title: params.output.title,
            summary: params.output.summary,
            text: params.output.text
        }
    }).then((response) => {
        //console.log("Check RUn Add Response ", response)
        checkrunRes = response;   
    })

    return checkrunRes;
};

const editCheckRun =  async(params) => {
    let checkeditRes = {};

    console.log("Edit check run ", getParams(params))
    await octokit.request('PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}', getParams(params)).then((response) => {
        checkeditRes = response;   
    })

    return checkeditRes;
};

module.exports = {
    addCheckRun: addCheckRun,
    editCheckRun: editCheckRun
}
