// AI 서버 모듈 테스트용: @diki/core 를 컴파일 결과로 연결한다
const Module = require('module');
const path = require('path');

const coreEntry = path.join(__dirname, '..', '..', '.ai-test-dist', 'packages', 'core', 'src', 'index.js');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === '@diki/core') return coreEntry;
  return resolve.call(this, request, ...rest);
};
