class ApiResponse {
  static send(res, { success, message, status, data = null, errors = null, meta = null }) {
    const payload = { success, message };

    if (data !== null) payload.data = data;
    if (errors !== null) payload.errors = errors;
    if (meta !== null) payload.meta = meta;

    return res.status(status).json(payload);
  }

  static success(res, message, data = null, status = 200, meta = null) {
    return this.send(res, { success: true, message, status, data, meta });
  }

  static error(res, message, errors = null, status = 400) {
    return this.send(res, { success: false, message, status, errors });
  }
}

export const success = ApiResponse.success.bind(ApiResponse);
export const error = ApiResponse.error.bind(ApiResponse);

export default ApiResponse;
