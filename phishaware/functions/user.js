const Dynamo = require("../common/dynamodb");
const { getResponse } = require("../common/responses");

exports.fetchProfile = async (event) => {
  const username = event?.requestContext?.authorizer?.lambda?.userId;

  try {
    const user = await Dynamo.get(username, "user-table");
    return getResponse(200, "User profile fetched successfully", user);
  } catch {
    return getResponse(400, "Failed to fetch user profile");
  }
};

exports.updateFirstTimeOpen = async (event) => {
  const username = event?.requestContext?.authorizer?.lambda?.userId;
  try {
    await Dynamo.update({
      Key: { id: username },
      UpdateExpression: "set #firstTimeOpen = :firstTimeOpen",
      ConditionExpression: "attribute_exists(id)",
      ExpressionAttributeNames: {
        "#firstTimeOpen": "firstTimeOpen",
      },
      ExpressionAttributeValues: {
        ":firstTimeOpen": false,
      },
      TableName: "user-table",
    });

    return getResponse(200, "User profile updated successfully");
  } catch (err) {
    console.log(err);
    return getResponse(400, "Failed to update user profile");
  }
};
