const { spawn } = require('child_process');
const got = require('got');
const test = require('tape');

// Start the app
const env = Object.assign({}, process.env, {PORT: 5000});
const child = spawn('node', ['index.js'], {env});

test('responds to requests', (t) => {
  t.plan(4);

  child.stdout.on('data', _ => {
    (async () => {
      const response = await got('http://localhost:5000');
      // stop the server
      child.kill();

      // No error
      t.false(response.error);
      // Successful response
      t.equal(response.statusCode, 200);
      // Assert content checks
      t.notEqual(response.body.indexOf("Parking System"), -1);
      t.notEqual(response.body.indexOf("System to book parking slots"), -1);
    })();
  });
});
