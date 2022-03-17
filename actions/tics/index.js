const util = require('util');
const { exec } = require("child_process");
const core = require('@actions/core');
const execute = util.promisify(require('child_process').exec);

const { config, ticsConfig, execCommands } = require('./src/github/configuration');
const { createIssueComment } = require('./src/github/api/issues/index');
const { getPRChangedFiles } = require('./src/github/api/pulls/index');
const { getQualityGates } = require('./src/tics/api/qualitygates/index');
const { getInstallTicsLink, getCommand, osEnum } = require('./src/tics/api/installTics/index');
const { getErrorSummary, getQualityGateSummary, getLinkSummary, getFilesSummary } = require('./src/tics/helpers/summary/index');

if (config.eventname === 'pull_request' && config.eventpayload.action !== 'closed') {
    bootstrapTICS();
} else {
    core.setFailed("This action is running only on pull requests events.");
}

async function bootstrapTICS() {
    try {
        console.log("installTics value: ", ticsConfig.installTics);
        if (ticsConfig.installTics === 'true') {
            if (process.env.RUNNER_OS === osEnum.MACOS) {
                postSummary("MacOS is not yet supported. Please use windows or ubuntu instead.", true);
            }
            console.log("About to get the tics install url. ");
            getInstallTicsLink().then((installTicsUrl) => {
                console.log("Got the tics install url: ", installTicsUrl);
                return installTicsUrl;
            }).then((installTicsUrl) => {
                console.log("About to execute the bootstrap & TICS Invocation. ");
                let command = installTicsUrl ? getCommand(installTicsUrl) : postSummary("There is an issue with retrieving your configuration.", true);
                runTICSClient(command);
            })

        } else {
            runTICSClient(execCommands.ticsClientViewer);
        }
    
    } catch (error) {
       core.setFailed(error.message);
    }
}

async function runTICSClient(command) {
    try {
        core.info(`\u001b[35m > Analysing new pull request for project ${ticsConfig.projectName}.`)
        core.info(`Invoking: ${command}`);

        exec(command, (error, stdout, stderr) => {
            if (error && error.code != 0) {
                core.info(stderr);
                core.info(stdout);

                let errorList = stdout.match(/\[ERROR.*/g);
                if (errorList) {
                    postSummary(errorList, true);
                } else {
                    postSummary(stderr, true);
                }

                core.setFailed("There is a problem while running TICS Client Viewer. Please check that TICS is configured and all required parameters have been set in your workflow.");

                return;
            } else {
                core.info(stdout);

                let locateExplorerUrl = stdout.match(/http.*Explorer.*/g);
                let explorerUrl = "";
                
                if (!!locateExplorerUrl) {
                    explorerUrl = locateExplorerUrl.slice(-1).pop();
                    core.info(`\u001b[35m > Explorer url retrieved ${explorerUrl}`); 
                } else {
                    postSummary("There is a problem while running TICS Client Viewer", true);
                    core.setFailed("There is a problem while running TICS Client Viewer.");
                    return;
                }
                
                getPRChangedFiles().then((changeSet) => {
                    core.info(`\u001b[35m > Retrieving changed files to analyse`);
                    core.info(`Changed files list retrieved: ${changeSet}`);
                    return changeSet;

                }).then((changeSet) => {
                    getQualityGates(explorerUrl).then((qualitygates) => {
                        core.info(`\u001b[35m > Retrieved quality gates results`);

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
