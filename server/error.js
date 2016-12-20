// 返回的错误都在此编辑

'use strict';

module.exports = {
  common: {
    saveFailed: { status: 422, msg: 'Save failed.' },
    loseParam: { status: 400, msg: 'Param lost.' },
    delFailed: { status: 422, msg: 'Delete failed.' },
    getFailed: { status: 422, msg: 'Get data failed.' },
    unknown: { status: 520, msg: 'Unknown error.' },
  },
  auth: {
    loginFailed: { status: 403, msg: 'Login failed.' },
    unauthorized: { status: 401, msg: 'User unauthorized.' },
    accessDenied: { status: 403, msg: 'Permission denied.' },
  },
};
