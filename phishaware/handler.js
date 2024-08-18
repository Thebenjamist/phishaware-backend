const Dynamo = require("./common/dynamodb");

exports.hello = async (event) => {
  const username = event.requestContext.authorizer.jwt.claims.username;
  console.log("event", event.requestContext.authorizer.jwt.claims.username);
  try {
    // const res = await Dynamo.write({ id: "1", name: "test" }, "test-table");
    // const read = await Dynamo.get("1", "test-table");
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Example!",
        data: username,
      }),
    };
  } catch (err) {
    console.log(err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
      }),
    };
  }
};
