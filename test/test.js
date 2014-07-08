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
    expect(template.render('a.tmpl', {name: 'CWD'})).to.eql('CWD');
  });

  it('should use a locally defined cwd.', function () {
    var template = new Template();
    template.cache('test/fixtures/a.tmpl');
    expect(template.render('a.tmpl', {name: 'CWD', cwd: 'test/fixtures'})).to.eql('CWD');
  });

  it('should use globally defined custom delimiters.', function () {
    var template = new Template({cwd: 'test/fixtures', delims: ['{%', '%}']});
    template.cache('a.custom.tmpl');
    template.cache('b.custom.tmpl');
    expect(template.render('a.custom.tmpl', {name: 'A'})).to.eql('A');
    expect(template.render('b.custom.tmpl', {name: 'B'})).to.eql('B');
  });

  it('should override globally defined custom delims with local ones.', function () {
    var template = new Template({cwd: 'test/fixtures', delims: ['{%', '%}']});
    template.cache('a.custom.tmpl');
    template.cache('b.custom.tmpl');
    expect(template.render('a.custom.tmpl', {name: 'A'})).to.eql('A');
    expect(template.render('b.custom.tmpl', {name: 'B'})).to.eql('B');

    template.cache('a.tmpl', {delims: ['<%', '%>']});
    template.cache('b.tmpl', {delims: ['<%', '%>']});
    expect(template.render('a.tmpl', {name: 'A'})).to.eql('A');
    expect(template.render('b.tmpl', {name: 'B'})).to.eql('B');
  });

  it('should use locally defined custom delimiters.', function () {
    var template = new Template({cwd: 'test/fixtures'});
    template.cache('a.custom.tmpl', {delims: ['{%', '%}']});
    template.cache('b.custom.tmpl', {delims: ['{%', '%}']});
    expect(template.render('a.custom.tmpl', {name: 'A'})).to.eql('A');
    expect(template.render('b.custom.tmpl', {name: 'B'})).to.eql('B');

    template.cache('a.tmpl', {delims: ['<%', '%>']});
    template.cache('b.tmpl', {delims: ['<%', '%>']});
    expect(template.render('a.tmpl', {name: 'A'})).to.eql('A');
    expect(template.render('b.tmpl', {name: 'B'})).to.eql('B');
  });

  it('should cache templates.', function () {
    var template = new Template({cwd: 'test/fixtures'});
    template.cache(['a.tmpl']);
    var filepath = path.resolve('test/fixtures/a.tmpl');
    expect(template._cache[filepath]).to.be.a('function')
  });

  it('should compile templates.', function () {
    var template = new Template({cwd: 'test/fixtures'});
    var actual = template.compile('name', '<%= a %>');
    expect(actual).to.be.a('function');
  });

  it('should use glob patterns.', function () {
    var template = new Template({cwd: 'test/fixtures'});
    template.cache('*.tmpl');
    expect(template.render('a.tmpl', {name: 'A'})).to.eql('A');
    expect(template.render('b.tmpl', {name: 'B'})).to.eql('B');
  });

  it('should use an array of glob patterns.', function () {
    var template = new Template({cwd: 'test/fixtures'});
    template.cache(['*.tmpl']);
    expect(template.render('a.tmpl', {name: 'A'})).to.eql('A');
    expect(template.render('b.tmpl', {name: 'B'})).to.eql('B');
  });

});


// // template.cache('test/fixtures/*.tmpl', ['{%', '%}']);
// // template.cache('template/fixtures/*.tmpl', ['{%', '%}']);
// template
//   .cache('foo.tmpl', ['{%', '%}'])
//   .cache('bar.tmpl', ['<%', '%>'])
//   .cache('bar.tmpl');

// var foo = template.render('foo.tmpl', {name: 'Templates'});
// var bar = template.render('bar.tmpl', {name: 'Templates'});
// console.log(foo)
// console.log(bar)