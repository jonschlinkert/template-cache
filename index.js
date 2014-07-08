/*!
 * template-cache <https://github.com/jonschlinkert/template-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var glob = require('globby');
var delims = require('delims');
var isAbsolute = require('is-absolute');
var _ = require('lodash');


/**
 * ## Template
 *
 * Create a new instance of `Template`.
 *
 * **Example:**
 *
 * ```js
 * var Template = require('template-cache');
 * var template = new Template( options );
 * ```
 *
 * @class `Template`
 * @param {Object} `options` Options to pass to [delims][delims] and [Lo-Dash][lodash]
 */

function Template(options) {
  this.options = options || {};
  this.options.cwd = this.options.cwd || process.cwd();
  this.options.delims = this.options.delims || ['<%', '%>'];
  this._cache = {};

  this.defaults = {
    body: '',
    beginning: '',
    end: '',
    flags: 'g',
    noncapture: false,
    escape: true
  };
};

Template.prototype._delims = function (delimiters, options) {
  options = _.extend({}, this.defaults, options);
  return delims(delimiters || this.options.delims, options);
};

Template.prototype.compile = function (name, str, options) {
  this.options = _.extend({}, this.options, options);
  var delims = this._delims(this.options.delims);
  return this._cache[name] = _.template(str, null, delims);
};

Template.prototype.compileFile = function (filepath, options) {
  var str = fs.readFileSync(filepath, 'utf8');
  this.compile(filepath, str, options);
};

Template.prototype.cache = function (patterns, options) {
  this.options = _.extend({}, this.options, options);
  if (typeof patterns === 'string' && isAbsolute(patterns)) {
    if (this._cache.hasOwnProperty(patterns)) {
      return this._cache[patterns];
    }
    this.compileFile(filepath, this.options);
    return this;
  }

  glob.sync(patterns, this.options).forEach(function(filepath) {
    filepath = path.resolve(this.options.cwd, filepath);

    if (this._cache.hasOwnProperty(filepath)) {
      return this._cache[filepath];
    }
    this.compileFile(filepath, this.options);
  }.bind(this));
  return this;
};

Template.prototype.render = function (filepath, options) {
  this.options = _.extend({}, this.options, options);
  filepath = path.resolve(this.options.cwd, filepath);
  if (this._cache[filepath]) {
    return this._cache[filepath](this.options);
  }
  var fn = this.cache(filepath, this.options);
  return fn(this.options);
};

module.exports = Template;