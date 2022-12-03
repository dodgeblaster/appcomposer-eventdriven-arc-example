const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const eventbridge = new AWS.EventBridge()
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

    return data
}

/**
 * Store completed order
 */
async function updateOrderToCompleted(props) {
    const params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            pk: `store_${props.storeId}`,
            sk: `order_${props.id}`
        },
        UpdateExpression: 'SET completeTimeStamp = :t',
        ConditionExpression: 'attribute_not_exists(completeTimeStamp)',
        ExpressionAttributeValues: {
            ':t': props.timestamp
        },
        ReturnValues: 'ALL_NEW'
    }

    const result = await db.update(params).promise()
    return result.Attributes
}

/**
 * Emit order details have been stored
 */
async function emitOrderDetailsStored(data) {
    const params = {
        Entries: [
            {
                Detail: JSON.stringify(data),
                DetailType: 'orderDetailsStored',
                EventBusName: process.env.EVENTBUS,
                Source: 'orderService'
            }
        ]
    }
    const result = await eventbridge.putEvents(params).promise()
    console.log(result)
}

exports.handler = async (event) => {
    const data = validate(event.detail)
    const completedOrder = await updateOrderToCompleted(data)
    await emitOrderDetailsStored(completedOrder)
}
