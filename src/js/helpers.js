import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config.js';

// contains all helpers functions

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const getJSON = async function (url) {
  try {
    const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
    const result = await res.json();
    if (!res.ok) {
      throw new Error(`${result.message} (${res.status})`);
    }
    return result;
  } catch (err) {
    throw err;
  }
};
