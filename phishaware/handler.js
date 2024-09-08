const Dynamo = require("./common/dynamodb");
const { getResponse } = require("./common/responses");

exports.hello = async (event) => {
  const username = event?.requestContext?.authorizer?.lambda?.userId;
  console.log("event", username);
  try {
    return getResponse(200, "Example!", username);
  } catch (err) {
    console.log(err);

    return getResponse(400, "Example failed!");
  }
};
