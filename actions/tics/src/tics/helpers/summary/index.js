const core = require('@actions/core');
const { generateLinkMarkdown,
    generateStatusMarkdown,
    generateTableMarkdown,
    generateExpandableAreaMarkdown } = require('./markdownGenerator');

const getErrorSummary = (errorList) => {
    let errorMessage = `## TICS Quality Gate\r\n\r\n### :x: Failed \r\n\r\n #### The following errors have occured during analysis:\r\n\r\n`;

   if (errorList && Array.isArray(errorList)) {
       errorList.forEach(item => errorMessage += `> :x: ${item}\r\n`); 
    } else {
        errorMessage += `> :x: ${errorList}\r\n`
    }

    return errorMessage;
}

const getQualityGateSummary = (qualityGateObj) => {
    if (!qualityGateObj) {
       return "";
    }
    
    let gatesConditionsSummary = '';

    qualityGateObj.gates && qualityGateObj.gates.forEach(gate => {
        gatesConditionsSummary = getQGCondtionsSummary(gate.conditions);
    })
    
    return `## TICS Quality Gate \n\n ### ${generateStatusMarkdown(qualityGateObj.passed, true)} \n\n ${gatesConditionsSummary}\n`;
}

const getLinkSummary = (link) => {
    return generateLinkMarkdown('See the results in the TICS Viewer', link) + `\n\n`;
}

const getFilesSummary = (fileList) => {
    return `#### The following file(s) have been checked:\n> ${fileList}`;
}

/**
* Helper methods to generate markdown
*/
const getQGCondtionsSummary = (conditions) => {
    let out = '';
    
    conditions.forEach(condition => {
        if (condition.skipped !== true) {
            const gateConditionWithIcon = `${generateStatusMarkdown(condition.passed, false)}  ${condition.message}`; 

            if (condition.details !== null && condition.details.items.length > 0) {
                let headers = [];
                headers.push("File", condition.details.dataKeys.actualValue.title);
                let cells = getTableCellsDetails(condition.details.items.filter(item => item.itemType === "file"));

                out += generateExpandableAreaMarkdown(gateConditionWithIcon, generateTableMarkdown(headers, cells)) + '\n\n\n';
            } else {
                out += gateConditionWithIcon + ' \n\n\n';
            }
        }
    })
    
    return out;
}

const getTableCellsDetails = (items) => {
    return items.map((item) => {
        return {
                 name: item.name,
                 link: core.getInput('ticsViewerUrl') + item.link,
                 score: item.data.actualValue.formattedValue
               };
    });
}

module.exports = {
    getErrorSummary: getErrorSummary,
    getQualityGateSummary: getQualityGateSummary,
    getLinkSummary: getLinkSummary,
    getFilesSummary: getFilesSummary
}
