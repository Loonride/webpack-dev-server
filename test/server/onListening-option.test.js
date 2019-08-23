'use strict';

const { join } = require('path');
const { unlinkAsync } = require('../helpers/fs');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['onListening-option'];
const { skipTestOnWindows } = require('../helpers/conditional-test');
const TestUnixSocket = require('../helpers/test-unix-socket');

describe('onListening option', () => {
  describe('with host and port', () => {
    let onListeningIsRunning = false;
    let server;
    let resultingDevServer;
    let resultingErr;

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          onListening: (err, devServer) => {
            resultingErr = err;
            resultingDevServer = devServer;
            if (!devServer) {
              throw new Error('webpack-dev-server is not defined');
            }

            onListeningIsRunning = true;
          },
          port,
        },
        done
      );
    });

    afterAll(testServer.close);

    it('should run onListening callback, providing server without error', () => {
      expect(resultingErr).toEqual(null);
      expect(resultingDevServer).toEqual(server);
      expect(onListeningIsRunning).toBe(true);
    });
  });

  describe('with Unix socket', () => {
    if (skipTestOnWindows('Unix sockets are not supported on Windows')) {
      return;
    }

    const socketPath = join('.', 'onListening.webpack.sock');
    let onListeningIsRunning = false;
    let server;
    let resultingDevServer;
    let resultingErr;

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          onListening: (err, devServer) => {
            resultingErr = err;
            resultingDevServer = devServer;
            if (!devServer) {
              throw new Error('webpack-dev-server is not defined');
            }

            onListeningIsRunning = true;
          },
          socket: socketPath,
        },
        done
      );
    });

    afterAll(testServer.close);

    it('should run onListening callback, providing server without error', async () => {
      expect(resultingErr).toEqual(null);
      expect(resultingDevServer).toEqual(server);
      expect(onListeningIsRunning).toBe(true);

      await unlinkAsync(socketPath);
    });
  });

  describe('with Unix socket that is already in use', () => {
    if (skipTestOnWindows('Unix sockets are not supported on Windows')) {
      return;
    }

    const socketPath = join('.', 'onListening.webpack.sock');
    let onListeningIsRunning = false;
    let server;
    let resultingDevServer;
    let resultingErr;
    let testUnixSocket;

    beforeAll((done) => {
      testUnixSocket = new TestUnixSocket();
      // this unix socket is meant to use the file that the dev server
      // will try to listen on, causing an error to be passed to onListening
      testUnixSocket.server.listen(socketPath, 511, () => {
        server = testServer.start(
          config,
          {
            onListening: (err, devServer) => {
              resultingErr = err;
              resultingDevServer = devServer;
              if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
              }

              onListeningIsRunning = true;
            },
            socket: socketPath,
          },
          done
        );
      });
    });

    afterAll((done) => {
      testUnixSocket.close(() => {
        testServer.close(done);
      });
    });

    it('should run onListening callback, providing server without error', async () => {
      expect(resultingErr).not.toEqual(null);
      expect(resultingErr.message).toEqual('This socket is already used');
      expect(resultingDevServer).toEqual(server);
      expect(onListeningIsRunning).toBe(true);

      await unlinkAsync(socketPath);
    });
  });
});
