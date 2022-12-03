const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
AWS.config.update({ region: process.env.AWS_REGION })

/**
 * Validate Input
 */
function validate(data) {
    if (typeof data.id !== 'string') {
        throw new Error('Must have an id')
    }
    if (typeof data.storeId !== 'string') {
        throw new Error('Must have a storeId')
    }
    if (typeof data.timestamp !== 'number') {
        throw new Error('Must have a timestamp')
    }

    if (typeof data.total !== 'number') {
        throw new Error('Must have a total')
    }
    return data
}

/**
 * Create Order
 */
async function setOrder(props) {
    const params = {
        TableName: process.env.TABLE_NAME,
        Item: {
            pk: `store_${props.storeId}`,
            sk: `order_${props.id}`,
            id: props.id,
            storeId: props.storeId,
            total: props.total,
            startTimestamp: props.timestamp
        }
    }

    await db.put(params).promise()
}

exports.handler = async (event) => {
    const data = validate(event.detail)
    await setOrder(data)
}
