// RESPONSE HELPER
// Builds a standard JSON response payload and sends it with the provided status.
const sendResponse = (res, { success, message, status, data = null, errors = null }) => {
  const payload = { success, message };

  if (data !== null) payload.data = data;
  if (errors !== null) payload.errors = errors;

  return res.status(status).json(payload);
};

// SUCCESS RESPONSE
// Sends a successful JSON response with optional data.
export const success = (res, message, data = null, status = 200) =>
  sendResponse(res, { success: true, message, status, data });

// ERROR RESPONSE
// Sends a failure JSON response with optional error details.
export const error = (res, message, errors = null, status = 400) =>
  sendResponse(res, { success: false, message, status, errors });
