const generateLinkMarkdown = (text, link) => {
    return Boolean(text) && Boolean(link) ? `[${text}](${link})` : '';
}

const generateStatusMarkdown = (truthCondition, text) => {
    let status = "";
    
    switch (truthCondition) {
        case true:
            status = ':heavy_check_mark: ' + (text ? 'Passed ' : '');
            break;
        case false:
            status = ':x: ' + (text ? 'Failed ' : '');
            break;
    }
    
    return status;
}

/**
*  To properly render a table markdown, the table should start with a blank line.
*  Hyphens(-) are used to create each column's header, while pipes(|) separate each column.
*  For example:
*  
*  | First Header  | Second Header |
*  | ------------- | ------------- |
*  | Content Cell  | Content Cell  |
*  | Content Cell  | Content Cell  |
*/
const generateTableMarkdown = (headers, cells) => {
    let tableText = `\n ${generateTableHeaders(headers, true)} ${generateTableHeaders(headers, false)}`;
    
    cells.forEach(cell => {
        tableText += `|  ${generateLinkMarkdown(cell.name, cell.link)} | ${cell.score} | \n`
    })
    
    return tableText;
}

const generateTableHeaders = (array, isHeader) => {
  let tableText = '';

  array && array.map((header, i, arr) => {
        if (arr.length - 1 === i) {
            tableText = tableText.substring(0, tableText.length - 1);
        }

        tableText += isHeader ? `| ${header} |` : `| --- |`;
    });
    
    return tableText + '\n';
}

const generateExpandableAreaMarkdown = (title, body) => {
    return `<details><summary>${title}</summary> \n ${body} </details> \n`;
}

module.exports = {
    generateLinkMarkdown: generateLinkMarkdown,
    generateStatusMarkdown: generateStatusMarkdown,
    generateTableMarkdown: generateTableMarkdown,
    generateExpandableAreaMarkdown: generateExpandableAreaMarkdown
}