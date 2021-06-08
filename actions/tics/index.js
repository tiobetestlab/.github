
const https = require('https');
const { exec } = require("child_process");
const core = require('@actions/core');
const util = require('util');
const execute = util.promisify(require('child_process').exec);

const { config, ticsConfig } = require('./src/github/configuration');
const { addCheckRun, editCheckRun } = require('./src/github/api/checkruns/index');
const {createIssueComment, deleteIssueComments} = require('./src/github/api/issues/index');

if(config.eventpayload.action !== 'closed') {
    analyseTiCSBranch();
}


async function analyseTiCSBranch() {
    try {
        console.log(`Analysing new pull request for project ${ticsConfig.projectName}.`)
        
        var execString = 'TICS -qg -calc ALL -changed ';
        execString += ticsConfig.projectName ? `-project ${ticsConfig.projectName} ` : '';
        execString += ticsConfig.viewerToken ? `-cdtoken ${ticsConfig.viewerToken} ` : '';
        execString += ticsConfig.tmpdir ? `-tmpdir ${ticsConfig.tmpdir} ` : '';
        execString += ticsConfig.branchDir ? `${ticsConfig.branchDir} ` : ' .';
        
        console.log(`Invoking: ${execString}`);
        
        let gitDiff = ''
        exec('git diff --name-only', (error, stdout, stderr) => {
            gitDiff = stdout;
            console.log(gitDiff);
        });
                
        exec(execString, (error, stdout, stderr) => {
            if (error || stderr) {
                console.log(error)
                console.log(stderr)
                core.setFailed(error);
                //return;
            }

            console.log(stdout);            
            
            let explorerUrl = stdout.match(/http.*Explorer.*/g);
            createPrComment(explorerUrl[1], gitDiff);
        });

    }  catch (error) {
       core.setFailed(error.message);
    }
}


async function getUserName() {
    try {
        const {stdout, stderr} = await execute('echo %username%')
        return stdout;

    }  catch (error) {
       core.setFailed(error.message);
    }
}


async function getQualityGates(username) {
    try {
        console.log(`Getting Quality Gates from ${ticsConfig.ticsViewerUrl}api/private/qualitygate/Status?axes=ClientData(${username}:${ticsConfig.viewerToken}),Project(${ticsConfig.projectName}),Branch(${ticsConfig.branchName})`)
        let qualityGates = await doHttpRequest(`${ticsConfig.ticsViewerUrl}api/private/qualitygate/Status?axes=ClientData(${username}:${ticsConfig.viewerToken}),Project(${ticsConfig.projectName}),Branch(${ticsConfig.branchName})`).then((data) => {
            let response = {
                statusCode: 200,
                body: JSON.stringify(data),
            };
            //console.log("Quality Gate response ", response);
            return response;
        });

        let qualityGateObj = JSON.parse(qualityGates.body)
        let gate_status = qualityGateObj.passed === true ? '### :heavy_check_mark: Passed ' : '### :x: Failed'
        let gates_conditions = '';

        qualityGateObj.gates && qualityGateObj.gates.map((gate) => {
            gate.conditions.map((condition) => {
                if(condition.skipped !== true) {
                    let condition_status = condition.passed === true ? '> :heavy_check_mark: ' : '> :x: ';
                    gates_conditions = gates_conditions + condition_status + " " + condition.descriptionText + '\r\n';  
                }
            })
        })

        let summary = `## TICS Quality Gate \r\n\r\n ${gate_status} \r\n\r\n ${gates_conditions}\n`
        return summary;

    } catch (error) {
        core.setFailed(error);
    }
}

async function createPrComment(explorerUrl) {
    try {
        let commentBody = {};
        
        getUserName().then((result) => {
            result = {
                username: result.trim()
            }
            console.log("Retrieving username...", result);

            return result;
        }).then((result) => {
            getQualityGates(result.username).then((data) => {
                commentBody = {
                    body : data 
                };
                commentBody.body += `[See results in TICS Viewer](${explorerUrl})\r\n`;
                createIssueComment(commentBody)
            })
        });
        

    }  catch (error) {
        core.setFailed(error.message);
    }
}

function doHttpRequest(url) {
    return new Promise((resolve, reject) => {
        const options = {
          headers: {
            'Authorization' : 'Basic ' + ticsConfig.ticsAuthToken
          },
          followAllRedirects: true
        }
                       
        console.log(options)
        let req = https.get(url, options, (res) => {

          let body = [];
          res.on('data', (chunk) => {
            body += chunk;
          })

          res.on('end', () => {
            console.log("status code: ", res.statusCode);
              if (res.statusCode === 200) {
                //console.log(JSON.parse(body));
                resolve(JSON.parse(body));
              }
          })
        });

        req.on('error', error => {
          console.error("HTTP request error: ", error)
          reject(error.message);
        })

        req.end();

    });
}
