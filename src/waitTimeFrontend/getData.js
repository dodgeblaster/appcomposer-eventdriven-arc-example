const AWS = require('aws-sdk')
const documentClient = new AWS.DynamoDB.DocumentClient()
AWS.config.update({ region: process.env.AWS_REGION })

function formatTime(x) {
    let date = new Date(x)
    let dd = date.getDate()
    let mm = date.getMonth() + 1
    let yyyy = date.getFullYear()
    let hours = date.getHours()
    let minutes = '0' + date.getMinutes()
    let seconds = '0' + date.getSeconds()
    return `${yyyy}/${mm}/${dd} ${hours}:${minutes.substr(-2)}:${seconds.substr(
        -2
    )}`
}

/**
 * List order wait times for a store
 */
module.exports.getData = async (props) => {
    let params = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
            ':pk': 'store_' + props.id,
            ':sk': 'order_'
        },
        Limit: 10
    }

    if (props.cursor) {
        params.ExclusiveStartKey = {
            pk: 'store_' + props.id,
            sk: props.cursor
        }
    }

    const result = await documentClient.query(params).promise()
    return {
        items: result.Items.map((x) => ({
            id: x.id,
            time: formatTime(x.time),
            waitTime: x.waitTime
        })),
        next: result.LastEvaluatedKey ? result.LastEvaluatedKey.sk : false
    }
}
