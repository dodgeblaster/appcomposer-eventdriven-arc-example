const AWS = require('aws-sdk')
const fs = require('fs')
AWS.config.update({ region: process.env.AWS_REGION })

function getFile(path) {
    const data = fs.readFileSync(path, 'utf8')
    return data
}

module.exports.makeHtml = ({ store, items, currentCursor, nextCursor }) => {
    /**
     * Get layout html and css
     */
    const styles = getFile('./src/style.css')
    const layout = getFile('./src/index.html')

    /**
     * Make wait time list html
     */
    let content = ''
    items.forEach((x) => {
        const waitTime = parseFloat(x.waitTime * 0.001).toFixed(2)
        const icon = waitTime > 5 ? '😬' : '✅'
        content =
            content +
            `<div class='row'>
            <p class='label'>${x.id}</p> 
             <p class='value'>${x.time}</p>
            <p class='value'>${icon} ${waitTime}s</p>
            </div>`
    })

    /**
     * Put it all together
     */
    const html = layout
        .replace('{{styles}}', styles)
        .replace('{{content}}', content)
        .replace(
            '{{nextlink}}',
            nextCursor
                ? `/?store=${store}&cursor=${nextCursor}`
                : `/?store=${store}&cursor=${currentCursor}`
        )

    return html
}
