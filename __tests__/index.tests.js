const { exec } = require('child_process');

test('gets the version', (done) => {
  exec('node index.js -V', (err, out) => {
    expect(out.trim()).toMatchSnapshot();
    done();
  });
});
