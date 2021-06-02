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
        issue_number: config.eventpayload.pull_request.number,
        comment_id: inputparams.comment_id ?  inputparams.comment_id : '',
        body: inputparams.body ? inputparams.body : ''
    }
    
    return parameters;
}

const createIssueComment =  async(params) => {
    console.log("Create Issue ", params)
    await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', getParams(params))
};

const deleteIssueComment =  async(params) => {
    await octokit.request('DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}', getParams(params))
};

const deleteIssueComments =  async() => {
    let params = {}

    let issues_comments  = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
        accept: 'application/vnd.github.v3+json',
        owner: config.owner,
        repo: config.reponame,
        issue_number: config.eventpayload.pull_request.number
    })

    if(issues_comments.data.length > 0) {
         issues_comments.data.map((comment) => {

            params = {
                comment_id: comment.id
            }

            deleteIssueComment(params);
         })
      }
};

module.exports = {
   createIssueComment : createIssueComment,
   deleteIssueComments: deleteIssueComments,
   deleteIssueComment : deleteIssueComment
}