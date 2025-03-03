// my-function.js
exports.handler = async (event) => {
    const keyword = event.queryStringParameters.keyword;
    const response = {
        statusCode: 200,
        body: JSON.stringify(`Taylor Palmer says ${keyword}`),
    };
    return response;
};
