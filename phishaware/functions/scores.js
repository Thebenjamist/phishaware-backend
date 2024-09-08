const Dynamo = require("../common/dynamodb");
const { getResponse } = require("../common/responses");
const { v4: uuidv4 } = require("uuid");

exports.fetchUserScores = async (event) => {
  const username = event?.requestContext?.authorizer?.lambda?.userId;
  try {
    const emails = await Dynamo.scan({
      FilterExpression: "#userId = :userId",
      ExpressionAttributeNames: {
        "#userId": "userId",
      },
      ExpressionAttributeValues: {
        ":userId": username,
      },
      TableName: "score-table",
    });
    return getResponse(200, "User scores fetched successfully", emails);
  } catch (err) {
    console.log(err);
    return getResponse(400, "Failed to fetch user scores");
  }
};

exports.submitScore = async (event) => {
  const { score } = JSON.parse(event.body);
  const username = event?.requestContext?.authorizer?.lambda?.userId;
  console.log("score", score);

  try {
    await Dynamo.write(
      { id: uuidv4(), ...score, userId: username },
      "score-table"
    );
    return getResponse(200, "Score submitted successfully");
  } catch (err) {
    console.log(err);
    return getResponse(400, "Failed to add user score");
  }
};
