
const https = require('http');
const { exec } = require("child_process");
const core = require('@actions/core');

const { config, ticsConfig } = require('./src/github/configuration');
const { addCheckRun, editCheckRun } = require('./src/github/api/checkruns/index');
const {createIssueComment, deleteIssueComments} = require('./src/github/api/issues/index');

if(config.eventpayload.action !== 'closed') {
    analyseTiCSBranch();
}


async function analyseTiCSBranch() {
    try {
        console.log(`Analysing new pull request for project ${ticsConfig.projectName} and ${ticsConfig.branchName} and ${ticsConfig.branchDir}.`)
        
        exec(`TICS -project ${ticsConfig.projectName} -cdtoken ${ticsConfig.viewerToken} -qg tics_dock.py`, (error, stdout, stderr) => {
            if (error || stderr) {
                console.log(error)
                console.log(stderr)
                core.setFailed(error);
                return;
            }

            console.log(stdout)
            createPrComment();
            
        });
        /*
        exec(`TICS -version`, (error, stdout, stderr) => {
            if (error || stderr) {
                console.log(error)
                console.log(stderr)
                core.setFailed(error);
                return;
            }

            console.log(stdout)
            //createPrComment();
            
        });
        */

    }  catch (error) {
       core.setFailed(error.message);
    }
}


async function getQualityGates() {
    try {
        console.log(`Getting Quality Gates from ${ticsConfig.ticsViewerUrl}api/private/qualitygate/Status?axes=ClientData(${ticsConfig.viewerToken}),Project(${ticsConfig.projectName}),Branch(${ticsConfig.branchName})`)
        let qualityGates = await doHttpRequest(`${ticsConfig.ticsViewerUrl}api/private/qualitygate/Status?axes=ClientData(${ticsConfig.viewerToken}),Project(${ticsConfig.projectName}),Branch(${ticsConfig.branchName})`).then((data) => {
            let response = {
                statusCode: 200,
                body: JSON.stringify(data),
            };
            return response;
        });

        let qualityGateObj = JSON.parse(qualityGates.body)
        let gate_status = qualityGateObj.passed === true ? 'Passed ' : 'Failed '
        let gates_conditions = '';

        qualityGateObj.gates.map((gate) => {
            gate.conditions.map((condition) => {
                let condition_status = condition.skipped === true ? ':warning: ' : (condition.passed === true ? ':heavy_check_mark: ' : ':x: ');
                gates_conditions = gates_conditions + condition_status + " " + condition.descriptionText + '\r\n';  
            })
        })

        let summary = `#### TICS Analysis \r\n\r\n ${gate_status}\r\n\r\n Run for : ${qualityGateObj.subject}\r\n\r\n* * * * *\r\n\r\n#### TICS Quality Gate \r\n\r\n ${gate_status} \r\n\r\n ${gates_conditions} \n[See results in TICS Viewer](${ticsConfig.ticsViewerUrl}api/public/v1/QualityGateStatusDetails?axes=ClientData(${ticsConfig.viewerToken}),Project(${ticsConfig.projectName}),Branch(${ticsConfig.branchName}))\r\n`
        return summary;

    } catch (error) {
        core.setFailed(error);
    }
}

async function createPrComment() {
    try {
        let commentBody = {};

        getQualityGates().then((data) => {
            commentBody = {
                body : data 
            };

            createIssueComment(commentBody)
        });

    }  catch (error) {
        core.setFailed(error.message);
    }
}

function doHttpRequest(path) {
    return new Promise((resolve, reject) => {

        let req = https.get(path, res => {

          let body = [];
          res.on('data', d => {
            body.push(d);
          })

          res.on('end', () => {
            //if (res.statusCode < 200 || res.statusCode >= 300) {
                try {
                  body = JSON.parse(Buffer.concat(body).toString());
                } catch(e) {
                  console.log("Result error: ", e)
                  reject(e);
                }
                resolve(body)
            //}
          })

        });

        req.on('error', error => {
          console.error("HTTP request error: ", error)
          reject(error.message);
        })

        req.end();

    });
    
}
