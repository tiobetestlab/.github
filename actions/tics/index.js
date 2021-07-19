const util = require('util');
const { exec } = require("child_process");
const core = require('@actions/core');
const execute = util.promisify(require('child_process').exec);

const { config, ticsConfig, execCommands } = require('./src/github/configuration');
const { createIssueComment } = require('./src/github/api/issues/index');
const { getPRChangedFiles } = require('./src/github/api/pulls/index');
const { getQualityGates } = require('./src/tics/api/qualitygates/index');
const { getErrorSummary, getQualityGateSummary, getLinkSummary, getFilesSummary } = require('./src/tics/helpers/summary/index');

if(config.eventpayload.action !== 'closed') {
    runTICSClient();
}

async function runTICSClient() {
    try {
        core.info(`\u001b[35m > Analysing new pull request for project ${ticsConfig.projectName}.`)
        core.info(`Invoking: ${execCommands.ticsClientViewer  }`);

        exec(execCommands.ticsClientViewer, (error, stdout, stderr) => {
            if (error || stderr) {
                core.debug(error);
                core.debug(stderr);
                core.info(stderr)
                core.info(stdout);

                let errorList = stdout.match(/\[ERROR.*/g);

                postSummary(errorList, true);

                core.setFailed("There is a problem while running TICS Client Viewer ");

                return;
            } else {
                core.info(stdout);

                let explorerUrl = stdout.match(/http.*Explorer.*/g).slice(-1).pop();
                
                getPRChangedFiles().then((changeSet) => {
                    core.info(`\u001b[35m > Retrieving changed files to analyse`);
                    core.info(`Changed files list retrieved: ${changeSet}`);

                    return changeSet;

                }).then((changeSet) => {
                    getQualityGates(explorerUrl).then((qualitygates) => {
                        core.info(`\u001b[35m > Retrieving quality gates results`);
                        core.info(`Quality gate results retrieved: ${qualitygates}`);

                        return qualitygates;
                    }).then((qualitygates) => {
                        let results = {
                            explorerUrl: explorerUrl,
                            changeSet: changeSet,
                            qualitygates: qualitygates
                        };

                        postSummary(results, false);
                    })
                });
            }
        });

    }  catch (error) {
       core.setFailed(error.message);
    }
}

async function postSummary(summary, isError) {
    let commentBody = {};

    if(isError) {
        commentBody.body = getErrorSummary(summary);
        createIssueComment(commentBody)
    } else {
        commentBody.body = getQualityGateSummary(summary.qualitygates) + getLinkSummary(summary.explorerUrl) + getFilesSummary(summary.changeSet);
        createIssueComment(commentBody)
    }
}