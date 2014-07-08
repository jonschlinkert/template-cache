/*!
 * template-cache <https://github.com/jonschlinkert/template-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

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
}


/**
 * ## ._delims
 *
 * Pass custom delimiters to Lo-Dash.
 *
 * **Example:**
 *
 * ```js
 * template.compile('{%%= foo %}', {delims: ['{%', '%}']});
 * ```
 *
 * @param  {Array} `delimiters`
 * @param  {Object} `options`
 * @return {Object} Object of regular expressions to pass to Lo-Dash.
 * @api private
 */

Template.prototype._delims = function (delimiters, options) {
  options = _.extend({}, this.defaults, options);
  return delims(delimiters || this.options.delims, options);
};


/**
 * ## .compile
 *
 * Compile a template string.
 *
 * **Example:**
 *
 * ```js
 * template.compile('<%= foo %>');
 * ```
 *
 * @param  {String} `str` The actual template string.
 * @param  {String} `settings` Delimiters to pass to Lo-dash.
 * @return {String}
 * @api public
 */

Template.prototype.compile = function (str, settings) {
  this.options = _.extend({}, this.options, settings);
  var delims = this._delims(this.options.delims);
  return _.template(str, null, delims);
};


/**
 * ## .compileFile
 *
 * Compile a template from a filepath.
 *
 * **Example:**
 *
 * ```js
 * template.compileFile('templates/index.tmpl');
 * ```
 *
 * @param  {String} `filepath`
 * @param  {Object} `options`
 * @return {String}
 * @api public
 */

Template.prototype.compileFile = function (filepath, options) {
  var str = fs.readFileSync(filepath, 'utf8');
  return this._cache[filepath] = this.compile(str, options);
};


/**
 * ## .cache
 *
 * Pass a filepath, array of filepaths or glob patterns and cache each file.
 *
 * **Example:**
 *
 * ```js
 * template.cache('<%= foo %>', {delims: ['{%', '%}']});
 * ```
 *
 * @param  {Array|String} `patterns` File path(s) or glob patterns.
 * @param  {Array} `options`
 * @return {Array}
 * @api public
 */

Template.prototype.cache = function (patterns, options) {
  this.options = _.extend({}, this.options, options);

  if (typeof patterns === 'string' && isAbsolute(patterns)) {
    if (this._cache.hasOwnProperty(patterns)) {
      return this._cache[patterns];
    }
    this.compileFile(patterns, this.options);
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


/**
 * ## .render
 *
 * Render a file with the given context.
 *
 * **Example:**
 *
 * ```js
 * template.render('<%= a %>', {a: 'b'});
 * ```
 *
 * @param  {String|Function} The `function`, `filepath` or `string` to render.
 * @param  {Object} `context` Options and context to pass to templates.
 * @return {String} The final string.
 * @api public
 */

Template.prototype.render = function (filepath, context) {
  this.options = _.extend({}, this.options, context);
  var str = filepath; // store a reference

  filepath = path.resolve(this.options.cwd, filepath);
  if (this._cache[filepath]) {
    return this._cache[filepath](this.options);
  }
  try {
    this.cache(filepath, this.options);
    return this._cache[filepath](this.options);
  } catch(err) {
    return this.compile(str, this.options)(this.options);
  }
};

module.exports = Template;