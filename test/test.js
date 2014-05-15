var assert = require('assert');
var fs = require('fs');
var path = require('path');

var xslt = require('..');

function testTemplate(templFile, docFile, resultFile, params) {
  var templString = fs.readFileSync(path.join(__dirname, templFile), { encoding: 'utf8' });
  var docString = fs.readFileSync(path.join(__dirname, docFile), { encoding: 'utf8' });
  
  var ss;
  try {
    ss = xslt.compileStylesheet(templString);
  } catch (e) {
    console.error('%s', e);
    throw e;
  }

  var result = xslt.transform(ss, docString, params);

  var desired = fs.readFileSync(path.join(__dirname, resultFile), { encoding: 'utf8' });

  // Desired results were produced by xsltproc, which produces slightly different whitespace than Java
  var d = removeWhitespace(desired);
  var r = removeWhitespace(result);

  assert.equal(d, r);
}

function removeWhitespace(s) {
  // Remove all whitespace between HTML tags
  return s.replace(/>\s+</g, '><');
}


function testTemplateAsync(templFile, docFile, resultFile, cb, params) {
  var templString = fs.readFileSync(path.join(__dirname, templFile), { encoding: 'utf8' });
  var docString = fs.readFileSync(path.join(__dirname, docFile), { encoding: 'utf8' });
  
  var ss = xslt.compileStylesheet(templString);

  xslt.transform(ss, docString, params, function(err, result) {
      assert(!err);
    
      var desired = fs.readFileSync(path.join(__dirname, resultFile), { encoding: 'utf8' });
    
      // Desired results were produced by xsltproc, which produces slightly different whitespace than Java
      var d = removeWhitespace(desired);
      var r = removeWhitespace(result);
    
      assert.equal(d, r);
      cb();
  });
}

function removeWhitespace(s) {
  // Remove all whitespace between HTML tags
  return s.replace(/>\s+</g, '><');
}

describe('trireme-xslt', function() {
    it('templates', function() {
        testTemplate('./fixtures/apply-templates.xsl', './fixtures/catalog.xml',
                     './fixtures/apply-templates-result.xml');
    });
    it('templatesAsync', function(done) {
        testTemplateAsync('./fixtures/apply-templates.xsl', './fixtures/catalog.xml',
                     './fixtures/apply-templates-result.xml', done);
    });
    it('for-each', function() {
        testTemplate('./fixtures/for-each.xsl', './fixtures/catalog.xml', 
                     './fixtures/for-each-result.xml');
    });
    it('sort', function() {
        testTemplate('./fixtures/sort.xsl', './fixtures/catalog.xml', 
                     './fixtures/sort-result.xml');
    });
    it('value-of', function() {
        testTemplate('./fixtures/value-of.xsl', './fixtures/catalog.xml', 
                     './fixtures/value-of-result.xml');
    });
    it('param-1987', function() {
        testTemplate('./fixtures/for-each-param.xsl', './fixtures/catalog.xml',
                     './fixtures/for-each-param-result-1987.xml', 
                     { year: '1987' });
    });
    it('param-1987', function(done) {
        testTemplateAsync('./fixtures/for-each-param.xsl', './fixtures/catalog.xml',
                     './fixtures/for-each-param-result-1987.xml', 
                     done, { year: '1987' });
    });
    it('param-1991', function() {
        testTemplate('./fixtures/for-each-param.xsl', './fixtures/catalog.xml',
                     './fixtures/for-each-param-result-1991.xml', 
                     { year: '1991' });
    });
    it('param-1991', function(done) {
        testTemplateAsync('./fixtures/for-each-param.xsl', './fixtures/catalog.xml',
                     './fixtures/for-each-param-result-1991.xml', 
                     done, { year: '1991' });
    });
    
    it('Bad stylesheet', function() {
        assert.throws(function() {
          xslt.readXsltString('<Bogus>This is a bogus stylesheet</Bogus>');
        });
    });
    
    it('Bad parameters', function() {
        assert.throws(function() {
            xslt.transform({ foo: 'bar' }, 'this is not what you want');
        });
    }); 
    it('Bad parameters Async', function(done) {
          xslt.transform({ foo: 'bar' }, 'this is not what you want', 
            function(err, result) {
              assert(err);
              done();
            });
    });
    
    it('Bad XML', function() {
        var ss = xslt.compileStylesheet(fs.readFileSync(path.join(__dirname, './fixtures/apply-templates.xsl')));
        var doc = 'This is not even XML';

        // Valid stylesheet, doc does not contain XML
        assert.throws(function() {
            xslt.transform(ss, doc);
        });
    });
    it('Bad XML Async', function(done) {
        var ss = xslt.compileStylesheet(fs.readFileSync(path.join(__dirname, './fixtures/apply-templates.xsl')));
        var doc = 'This is not even XML';

        xslt.transform(ss, doc, function(err, result) {
            assert(err);
            done();
        });
    });
});


