/*!
 * template-cache <https://github.com/jonschlinkert/template-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var expect = require('chai').expect;
var Template = require('../');


describe('template', function () {
  it('should use a globally defined cwd.', function () {
    var template = new Template({cwd: 'test/fixtures'});
    template.cache('a.tmpl');
    expect(template.render('a.tmpl', {name: 'CWD'})).to.equal('CWD');
  });

  it('should use a locally defined cwd.', function () {
    var template = new Template();
    template.cache('test/fixtures/a.tmpl');
    expect(template.render('a.tmpl', {name: 'CWD', cwd: 'test/fixtures'})).to.equal('CWD');
  });

  it('should use globally defined custom delimiters.', function () {
    var template = new Template({cwd: 'test/fixtures', delims: ['{%', '%}']});
    template.cache('a.custom.tmpl');
    template.cache('b.custom.tmpl');
    expect(template.render('a.custom.tmpl', {name: 'A'})).to.equal('A');
    expect(template.render('b.custom.tmpl', {name: 'B'})).to.equal('B');
  });

  it('should override globally defined custom delims with local ones.', function () {
    var template = new Template({cwd: 'test/fixtures', delims: ['{%', '%}']});
    template.cache('a.custom.tmpl');
    template.cache('b.custom.tmpl');
    expect(template.render('a.custom.tmpl', {name: 'A'})).to.equal('A');
    expect(template.render('b.custom.tmpl', {name: 'B'})).to.equal('B');

    template.cache('a.tmpl', {delims: ['<%', '%>']});
    template.cache('b.tmpl', {delims: ['<%', '%>']});
    expect(template.render('a.tmpl', {name: 'A'})).to.equal('A');
    expect(template.render('b.tmpl', {name: 'B'})).to.equal('B');
  });

  it('should use locally defined custom delimiters.', function () {
    var template = new Template({cwd: 'test/fixtures'});
    template.cache('a.custom.tmpl', {delims: ['{%', '%}']});
    template.cache('b.custom.tmpl', {delims: ['{%', '%}']});
    expect(template.render('a.custom.tmpl', {name: 'A'})).to.equal('A');
    expect(template.render('b.custom.tmpl', {name: 'B'})).to.equal('B');

    template.cache('a.tmpl', {delims: ['<%', '%>']});
    template.cache('b.tmpl', {delims: ['<%', '%>']});
    expect(template.render('a.tmpl', {name: 'A'})).to.equal('A');
    expect(template.render('b.tmpl', {name: 'B'})).to.equal('B');
  });

  it('should cache templates from glob patterns.', function () {
    var template = new Template({cwd: 'test/fixtures'});
    template.cache(['*.tmpl']);
    var filepath = path.resolve('test/fixtures/a.tmpl');
    expect(template._cache[filepath]).to.be.a('function')
  });

  it('should cache templates from file paths.', function () {
    var template = new Template({cwd: 'test/fixtures'});
    template.cache(['a.tmpl']);
    var filepath = path.resolve('test/fixtures/a.tmpl');
    expect(template._cache[filepath]).to.be.a('function')
  });

  it('should cache templates from arrays of file paths.', function () {
    var template = new Template({cwd: 'test/fixtures'});
    template.cache('a.tmpl');
    var filepath = path.resolve('test/fixtures/a.tmpl');
    expect(template._cache[filepath]).to.be.a('function')
  });

  it('should compile templates.', function () {
    var template = new Template();
    var actual = template.compile('<%= a %>');
    expect(actual).to.be.a('function');
  });

  it('should render cached templates.', function () {
    var template = new Template();
    var a = template.compile('<%= a %>');
    expect(a({a: 'b'})).to.equal('b');
  });

  it('should render non-cached templates.', function () {
    var template = new Template();
    expect(template.render('<%= a %>', {a: 'b'})).to.equal('b');
  });

  it('should render a template directly from a filepath.', function () {
    var template = new Template({cwd: 'test/fixtures'});
    expect(template.render('a.tmpl', {name: 'b'})).to.equal('b');
  });

  it('should pass global context to templates.', function () {
    var template = new Template({a: 'b'});
    expect(template.render('<%= a %>')).to.equal('b');
  });

  it('should use glob patterns.', function () {
    var template = new Template({cwd: 'test/fixtures'});
    template.cache('*.tmpl');
    expect(template.render('a.tmpl', {name: 'A'})).to.equal('A');
    expect(template.render('b.tmpl', {name: 'B'})).to.equal('B');
  });

  it('should use an array of glob patterns.', function () {
    var template = new Template({cwd: 'test/fixtures'});
    template.cache(['*.tmpl']);
    expect(template.render('a.tmpl', {name: 'A'})).to.equal('A');
    expect(template.render('b.tmpl', {name: 'B'})).to.equal('B');
  });

  it('should cache templates from glob patterns.', function () {
    var template = new Template({cwd: 'test/fixtures'});
    template
      .cache('a.tmpl', {delims: ['{%', '%}']})
      .cache('b.tmpl', {delims: ['<%', '%>']})
      .cache('c.tmpl');

    var a = template.render('a.tmpl', {name: 'A'});
    var b = template.render('b.tmpl', {name: 'B'});
    var c = template.render('c.tmpl', {name: 'C'});

    expect(a).to.equal('<%= name %>'); // custom delims
    expect(b).to.equal('B');
    expect(c).to.equal('C');
  });
});
