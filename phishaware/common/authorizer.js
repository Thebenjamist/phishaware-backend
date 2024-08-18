const { CognitoJwtVerifier } = require("aws-jwt-verify");
const AWS = require("aws-sdk");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
const { getResponse } = require("./responses");

exports.handler = async (event) => {
  const token = event.headers.authorization || event.headers.Authorization;
  const userPoolId = process.env.userPoolId;
  const clientId = process.env.userPoolClientId;

  const verifier = CognitoJwtVerifier.create({
    userPoolId: userPoolId,
    clientId: clientId,
    tokenUse: "access",
  });

  try {
    const payload = await verifier.verify(token);
    const policyDocument = generatePolicy("Allow", event.routeArn);
    return {
      principalId: payload.sub,
      policyDocument: policyDocument,
      context: {
        user: JSON.stringify(payload),
        userId: payload.sub,
      },
    };
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return {
      principalId: "unauthenticated",
      policyDocument: generatePolicy("Deny", event.routeArn),
      context: {
        errorMessage: "Custom Error: Token verification failed",
        originalError: err.message,
        hint: "Ensure your token is valid and not expired",
      },
    };
  }
};

const generatePolicy = (effect, resource) => {
  const policyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource,
      },
    ],
  };

  return policyDocument;
};

exports.refresh = async (event) => {
  const refreshToken = event.headers.refresh || event.headers.Refresh;
  const clientId = process.env.userPoolClientId;

  const cognito = new AWS.CognitoIdentityServiceProvider({
    region: process.env.region,
  });

  const params = {
    AuthFlow: "REFRESH_TOKEN_AUTH",
    ClientId: clientId,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  };

  try {
    const data = await cognito.initiateAuth(params).promise();
    console.log(data);
    return getResponse(200, "Token refreshed", data);
  } catch (err) {
    console.error(err.message);
    return getResponse(500, `Internal Server Error: ${err.message}`);
  }
};
