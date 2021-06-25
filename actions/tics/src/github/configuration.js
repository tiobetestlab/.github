const os = require('os');
const core = require('@actions/core');
let processEnv = process.env;

let config = {
    eventpayload: require(processEnv.GITHUB_EVENT_PATH),
    repo: processEnv.GITHUB_REPOSITORY,
    owner: processEnv.GITHUB_REPOSITORY.split("/")[0],
    reponame: processEnv.GITHUB_REPOSITORY.split("/")[1],
    branchname: processEnv.GITHUB_HEAD_REF,
    basebranchname: processEnv.GITHUB_BASE_REF,
    branchdir: processEnv.GITHUB_WORKSPACE
}

let ticsConfig = {
    //buildServerPath: core.getInput('buildServerPath'), 
    //ticsDir: core.getInput('ticsDir'), 
    projectName: core.getInput('projectName') ? core.getInput('projectName'): config.reponame,     
    branchName: core.getInput('branchName') ? core.getInput('branchName') : config.branchname,     
    branchDir: core.getInput('branchDir') ? core.getInput('branchDir'): config.branchdir,      
    //calc: core.getInput('calc'),         
    //recalc: core.getInput('recalc'),
    ticsViewerUrl: core.getInput('ticsViewerUrl'),         
    checkQualityGate: core.getInput('checkQualityGate'),                           
    failIfQualityGateFails: core.getInput('failIfQualityGateFails'),
    viewerToken: core.getInput('clientToken'),
    ticsAuthToken: core.getInput('ticsAuthToken')

}

//TO CHANGE
let osconf = {
    username: ticsConfig.viewerToken ? os.userInfo().username : '';
}

module.exports = {
    config: config,
    ticsConfig: ticsConfig,
    osconf: osconf
};
