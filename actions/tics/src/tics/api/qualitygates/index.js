 const core = require('@actions/core');
 const { doHttpRequest } = require('../../utils');
 const { ticsConfig } = require('../../../github/configuration');

 const getAPIEndpoint = () => {
    let qgBaseAPI = `${ticsConfig.ticsViewerUrl}api/public/v1/QualityGateStatus?project=${ticsConfig.projectName}&branch=${ticsConfig.branchName}&fields=details,annotationsApiV1Links`;
    
    return qgBaseAPI;
 }

 const getQualityGates = async() => {
    try {
     
        console.log("\u001b[35m > Trying to retrieve quality gates from ", getAPIEndpoint())
        let qualityGates = await doHttpRequest(getAPIEndpoint()).then((data) => {
            let response = {
                statusCode: 200,
                body: JSON.stringify(data),
            };
            return response;
        });
     
        console.log("\u001b[35m > Trying to parse quality gates response.")
        let qualityGateObj = JSON.parse(qualityGates.body);
        
        console.log("\u001b[35m > Trying to retrieve quality gate status ", qualityGateObj.passed)
        if(qualityGateObj.passed === false) {
            core.setFailed('Quality gate failed');
        }
        
        return qualityGateObj;

    } catch (error) {
        core.setFailed("An error occured when trying to retrieve quality gates " + error);
    }
}

module.exports = {
    getQualityGates: getQualityGates
}
