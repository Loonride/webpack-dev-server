'use strict';

const request = require('supertest');
const config = require('../fixtures/simple-config/webpack.config');
const testServer = require('../helpers/test-server');
const port = require('../ports-map')['clientOptions-option'];

describe('clientOptions option', () => {
  let server;
  let req;

  afterEach((done) => {
    testServer.close(done);
    req = null;
    server = null;
  });

  describe('default behavior', () => {
    beforeEach((done) => {
      server = testServer.start(
        config,
        {
          transportMode: 'sockjs',
          port,
        },
        done
      );
      req = request(`http://localhost:${port}`);
    });

    it('defaults to a path', () => {
      expect(
        server.options.clientOptions.path.match(/\/[a-z0-9\-/]+[^/]$/)
      ).toBeTruthy();
    });

    it('responds with a 200', (done) => {
      req.get('/ws').expect(200, done);
    });
  });

  describe('path option', () => {
    const path = '/foo/test/bar';

    beforeEach((done) => {
      server = testServer.start(
        config,
        {
          transportMode: 'sockjs',
          clientOptions: {
            path: '/foo/test/bar/',
          },
          port,
        },
        done
      );
      req = request(`http://localhost:${port}`);
    });

    it('sets the sock path correctly and strips leading and trailing /s', () => {
      expect(server.options.clientOptions.path).toEqual(path);
    });

    it('responds with a 200 second', (done) => {
      req.get(path).expect(200, done);
    });
  });
});
