const { getData } = require('./getData')
const { makeHtml } = require('./makeHtml')

/**
 * HTTP Responses
 */
const headers = {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS,GET'
}

const http = {
    success: (x) => ({
        statusCode: 200,
        body: x,
        headers
    })
}

/**
 * Handler
 */
const DEFAULT_STORE = 'blue'

exports.handler = async (event) => {
    let store = DEFAULT_STORE
    let cursor = null

    if (event.queryStringParameters && event.queryStringParameters.store) {
        store = event.queryStringParameters.store
    }

    if (event.queryStringParameters && event.queryStringParameters.cursor) {
        cursor = event.queryStringParameters.cursor
    }

    try {
        const result = await getData({
            id: store,
            cursor
        })

        const items = result.items.sort((a, b) => a.time - b.time)
        const html = makeHtml({
            store,
            items,
            nextCursor: result.next,
            currentCursor: cursor
        })

        return http.success(html)
    } catch (e) {
        return http.success(`<p>A problem has occured ${e.message}</p>`)
    }
}
