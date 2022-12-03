const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
AWS.config.update({ region: process.env.AWS_REGION })

async function setWaitTimeRecord(props) {
    const params = {
        TableName: process.env.TABLE_NAME,
        Item: {
            pk: `store_${props.storeId}`,
            sk: `order_${props.id}`,
            id: props.id,
            storeId: props.storeId,
            waitTime: props.waitTime,
            time: props.time
        }
    }

    await db.put(params).promise()
}

exports.handler = async (event) => {
    const data = event.detail
    const id = data.id
    const storeId = data.storeId
    const start = data.startTimestamp
    const end = data.completeTimeStamp

    await setWaitTimeRecord({
        id,
        storeId,
        time: data.completeTimeStamp,
        waitTime: end - start
    })
}
