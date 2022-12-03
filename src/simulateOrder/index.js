const AWS = require('aws-sdk')
const eventbridge = new AWS.EventBridge()

async function emitOrderStarted(data) {
    var params = {
        Entries: [
            {
                Detail: JSON.stringify(data),
                DetailType: 'orderStarted',
                EventBusName: process.env.EVENTBUS,
                Source: 'orderservice'
            }
        ]
    }
    await eventbridge.putEvents(params).promise()
}

async function emitOrderCompleted(data) {
    var params = {
        Entries: [
            {
                Detail: JSON.stringify(data),
                DetailType: 'orderCompleted',
                EventBusName: process.env.EVENTBUS,
                Source: 'orderservice'
            }
        ]
    }
    await eventbridge.putEvents(params).promise()
}

function wait() {
    const time = Math.ceil(Math.random() * 10000)
    return new Promise((r) =>
        setTimeout(() => {
            r()
        }, time)
    )
}

exports.handler = async () => {
    const id = AWS.util.uuid.v4()

    await emitOrderStarted({
        storeId: 'blue',
        id: id,
        total: 400,
        timestamp: Date.now()
    })

    await wait()

    await emitOrderCompleted({
        storeId: 'blue',
        id: id,
        total: 400,
        timestamp: Date.now()
    })
}
