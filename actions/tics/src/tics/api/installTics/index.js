 const core = require('@actions/core');
 const { doHttpRequest } = require('../../utils');
 const { ticsConfig, config, execCommands } = require('../../../github/configuration');

 const osEnum = {
    LINUX: 'Linux',
    WINDOWS: 'Windows',
    MACOS: 'macOS'
 };

 const getCommand = (installTicsUrl) => {
    let command = "";
    let command2 = `${execCommands.ticsClientViewer}`;
    
    switch(process.env.RUNNER_OS) {
        case osEnum.LINUX: {
            let command1 = `source <(curl -s \\\"${installTicsUrl}\\\")`;
            command = `bash -c \"${command1} && ${command2}\"`;
            break;
        }
        case osEnum.WINDOWS: {
            let command3 = `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('${installTicsUrl}'))`
            command = `powershell \"${command3}; if ($LASTEXITCODE -eq 0) { ${command2} }\"`;
            break;
        }
        default: {
            //
        }
    }

    return command;
 }

 const getAPIEndpoint = () => {
    let installTICSAPI = new URL(config.ticsEnv);
    installTICSAPI.searchParams.append('platform', process.env.RUNNER_OS.toLowerCase());
    installTICSAPI.searchParams.append('url', ticsConfig.ticsViewerUrl);

    return installTICSAPI.href;
 }

 const getInstallTicsLink = async() => {
    try {
     
        console.log("\u001b[35m > Trying to retrieve configuration information from: ", getAPIEndpoint())

        let configInfo = await doHttpRequest(getAPIEndpoint()).then((data) => {
            let response = {
                statusCode: 200,
                body: JSON.stringify(data.links.installTics), //FIX ME; do a check
            };

            return response;
        });
        let configObj = JSON.parse(configInfo.body);
        
        let installTICSUrlTemp = decodeURI(decodeURIComponent(configObj));
        let installTICSUrl = ticsConfig.ticsViewerUrl+ installTICSUrlTemp;

        return installTICSUrl;

    } catch (error) {
        core.setFailed("An error occured when trying to retrieve configuration information " + error);
    }
}

module.exports = {
    osEnum: osEnum,
    getCommand : getCommand,
    getInstallTicsLink: getInstallTicsLink
}
