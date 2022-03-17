const os = require('os');
const core = require('@actions/core');
const { getSubstring } = require('../tics/utils');
let processEnv = process.env;

let config = {
    eventpayload: require(processEnv.GITHUB_EVENT_PATH),
    eventname: processEnv.GITHUB_EVENT_NAME,
    repo: processEnv.GITHUB_REPOSITORY,
    owner: processEnv.GITHUB_REPOSITORY.split("/")[0],
    reponame: processEnv.GITHUB_REPOSITORY.split("/")[1],
    branchname: processEnv.GITHUB_HEAD_REF,
    basebranchname: processEnv.GITHUB_BASE_REF,
    branchdir: processEnv.GITHUB_WORKSPACE,
    ticsEnv: processEnv.TICS
}

let ticsConfig = {
    projectName: core.getInput('projectName', {required: true}),
    branchName: core.getInput('branchName', {required: true}),   
    branchDir: core.getInput('branchDir', {required: false}),
    tmpDir: core.getInput('tmpDir'),
    calc: core.getInput('calc'),
    ticsViewerUrl: core.getInput('ticsViewerUrl') ? core.getInput('ticsViewerUrl') : getSubstring(config.ticsEnv, "api", ""),
    viewerToken: core.getInput('clientToken'),
    ticsAuthToken: core.getInput('ticsAuthToken'),
    installTics: core.getInput('installTics')
}

let osconf = {
    username: ticsConfig.viewerToken ? os.userInfo().username : ''
}

let execString = 'TICS -qg ';
    execString += ticsConfig.calc ? `-calc ${ticsConfig.calc} -changed `: '-calc ALL -changed ';
    execString += ticsConfig.projectName ? `-project ${ticsConfig.projectName} ` : '';
    execString += ticsConfig.viewerToken ? `-cdtoken ${ticsConfig.viewerToken} ` : '';
    execString += ticsConfig.tmpDir ? `-tmpdir ${ticsConfig.tmpDir} ` : '';
    execString += ticsConfig.branchDir ? `${ticsConfig.branchDir} ` : ' .';
    
let execCommands = {
    ticsClientViewer: execString
}

module.exports = {
    config: config,
    ticsConfig: ticsConfig,
    osconf: osconf,
    execCommands: execCommands
};
