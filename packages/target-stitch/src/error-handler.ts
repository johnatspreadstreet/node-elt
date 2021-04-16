import get from 'lodash/get';
import {
  BadRequest,
  NotAuthenticated,
  PaymentError,
  Forbidden,
  NotFound,
  MethodNotAllowed,
  NotAcceptable,
  Timeout,
  Conflict,
  Unprocessable,
  GeneralError,
  NotImplemented,
  Unavailable,
} from '@feathersjs/errors';

export function errorHandler({ message, code, data = {} }) {
  switch (code) {
    case 400:
      throw new BadRequest(message, data);
    case 401:
      throw new NotAuthenticated(message, data);
    case 402:
      throw new PaymentError(message, data);
    case 403:
      throw new Forbidden(message, data);
    case 404:
      throw new NotFound(message, data);
    case 405:
      throw new MethodNotAllowed(message, data);
    case 406:
      throw new NotAcceptable(message, data);
    case 408:
      throw new Timeout(message, data);
    case 409:
      throw new Conflict(message, data);
    case 422:
      throw new Unprocessable(message, data);
    case 500:
      throw new GeneralError(message, data);
    case 501:
      throw new NotImplemented(message, data);
    case 503:
      throw new Unavailable(message, data);
    case 550:
      throw new GeneralError(`You requested an item that we do not have`, data);
    default:
      throw new GeneralError(message, data);
  }
}

export function asyncErrorHandler(error) {
  if (!error.code) {
    throw new GeneralError('Server error', error);
  }
  if (error.code === 404 || process.env.NODE_ENV === 'production') {
    error.stack = null;
  }
  if (error && error.data && error.data.error) {
    const errorObj = {
      code: error.code,
      message: error.data.error,
      data: error.data,
    };
    return errorHandler(errorObj);
  }
  return errorHandler(error);
}

export function axiosErrorHandler(error, pathToMessage = 'data') {
  // Error 😨
  if (error.response) {
    /*
     * The request was made and the server responded with a
     * status code that falls out of the range of 2xx
     */
    const { data, status } = error.response;
    const errorObj = {
      code: error.response.status,
      message: get(error, `response.${pathToMessage}`),
      data: {
        status,
        data,
      },
    };
    return errorHandler(errorObj);
  }
  if (error.request) {
    /*
     * The request was made but no response was received, `error.request`
     * is an instance of XMLHttpRequest in the browser and an instance
     * of http.ClientRequest in Node.js
     */
    const errorObj = {
      code: 503,
      message: 'The request was made, but no response was received.',
      data: error.request,
    };
    return errorHandler(errorObj);
  }
  // Something happened in setting up the request and triggered an Error
  return asyncErrorHandler(error);
}
