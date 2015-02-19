var childProcess = require('child_process'),
    path = require('path'),
    fs = require('fs');

var del = require('del'),
    touch = require('touch');

var executable = path.resolve('bin/cmd.js');


describe('cmd', function() {

  function wiredeps(args, options, cb) {

    var stdo = '',
        stde = '';

    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    var child = childProcess.spawn('node', [ executable ].concat(args), options, cb);

    child.stdout.on('data', function(data) {
      stdo += data.toString('utf8');
    });

    child.stderr.on('data', function (data) {
      stde += data.toString('utf8');
    });

    child.on('close', function (code) {
      cb(null, {
        code: code,
        output: stdo,
        stdout: stdo,
        stderr: stde
      });
    });
  }


  describe('should skip', function() {

    it('tagged build', function(done) {

      wiredeps([ '--tag=FOO', '--cwd=example' ], function(err, result) {

        if (err) {
          return done(err);
        }

        expect(result.output).to.eql('tagged build, skipping\n');

        done();
      });

    });


    it('non-existing .wiredeps', function(done) {

      wiredeps([ '--cwd=test/fixtures/no-config' ], function(err, result) {

        if (err) {
          return done(err);
        }

        expect(result.output).to.eql('no local .wiredeps found, skipping\n');

        done();
      });

    });


    it('existing npm-shrinkwrap.json', function(done) {

      wiredeps([ '--cwd=test/fixtures/existing-shrinkwrap' ], function(err, result) {

        if (err) {
          return done(err);
        }

        expect(result.output).to.eql('a local npm-shrinkwrap.json already exists, skipping\n');

        done();
      });

    });

  });


  describe('should handle error', function() {

    it('broken .wiredeps config', function(done) {

      wiredeps([ '--cwd=test/fixtures/broken-config' ], function(err, result) {

        if (err) {
          return done(err);
        }

        expect(result.stderr).to.contain('SyntaxError: Unexpected token');

        expect(result.output).to.eql('');

        done();
      });

    });

  });


  describe('should generate', function() {

    afterEach(function() {
      del.sync('example/npm-shrinkwrap.json');
    });

    function readGenerated() {
      return fs.readFileSync('example/npm-shrinkwrap.json', 'utf8');
    }


    it('simple shrinkwrap descriptor', function(done) {

      wiredeps([ '--cwd=example' ], function(err, result) {

        if (err) {
          return done(err);
        }

        expect(result.stderr).to.eql('');

        expect(result.output).to.eql(
          'writing shrinkwrap descriptor\n' +
          'done.\n');

        var generated = readGenerated();

        expect(generated).to.contain('"version": "0.0.0"');
        expect(generated).to.contain('"version": "nikku/wiredeps-test"');

        done();
      });

    });


    it('branched shrinkwrap descriptor', function(done) {

      wiredeps([ '--branch=other', '--cwd=example', '--verbose' ], function(err, result) {

        if (err) {
          return done(err);
        }

        expect(result.stderr).to.eql('');

        expect(result.output).to.eql(
          'running in folder example\n' +
          'loading descriptor from example\n' +
          'trying to resolve dependencies from <other>\n' +
          'resolving nikku/wiredeps-test via <other>\n' +
          'skipping nikku/wiredeps-test#explicit, already specified\n' +
          'writing shrinkwrap descriptor\n' +
          'done.\n');


        var generated = readGenerated();

        expect(generated).to.contain('"version": "0.0.0"');
        expect(generated).to.contain('"version": "nikku/wiredeps-test#other"');
        expect(generated).to.contain('"version": "nikku/wiredeps-test#explicit"');

        done();
      });

    });


    it('branched shrinkwrap descriptor (non-existing)', function(done) {

      wiredeps([ '--branch=non-existing', '--cwd=example', '--verbose' ], function(err, result) {

        if (err) {
          return done(err);
        }

        expect(result.stderr).to.eql('');

        expect(result.output).to.eql(
          'running in folder example\n' +
          'loading descriptor from example\n' +
          'trying to resolve dependencies from <non-existing>\n' +
          'skipping nikku/wiredeps-test#explicit, already specified\n' +
          'writing shrinkwrap descriptor\n' +
          'done.\n');


        var generated = readGenerated();

        expect(generated).to.contain('"version": "0.0.0"');
        expect(generated).to.contain('"version": "nikku/wiredeps-test"');
        expect(generated).to.contain('"version": "nikku/wiredeps-test#explicit"');

        done();
      });

    });


    describe('--force', function() {

      it('overriding existing npm-shrinkwrap.json', function(done) {

        touch.sync('example/npm-shrinkwrap.json');

        wiredeps([ '--branch=non-existing', '--cwd=example', '--force' ], function(err, result) {

          if (err) {
            return done(err);
          }

          expect(result.stderr).to.eql('');

          expect(result.output).to.eql(
            'trying to resolve dependencies from <non-existing>\n' +
            'writing shrinkwrap descriptor\n' +
            'done.\n');


          var generated = readGenerated();

          expect(generated).to.contain('"version": "0.0.0"');
          expect(generated).to.contain('"version": "nikku/wiredeps-test"');
          expect(generated).to.contain('"version": "nikku/wiredeps-test#explicit"');

          done();
        });
      });

    });

  });

});