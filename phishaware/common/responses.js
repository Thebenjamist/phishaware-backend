const getResponse = (statusCode, message, data = null) => {
  const response = {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
      data,
    }),
  };

  return response;
};

module.exports = { getResponse };
