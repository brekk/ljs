'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.literate = exports.unindent = exports.getTokens = exports.fileDirective = exports.stripShebang = exports.isWhitespace = exports.regex = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _forEach = require('lodash/fp/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _find = require('lodash/fp/find');

var _find2 = _interopRequireDefault(_find);

var _map = require('lodash/fp/map');

var _map2 = _interopRequireDefault(_map);

var _debug2 = require('f-utility/dev/debug');

var _lex = require('./lex');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var namespace = 'ljs2:literate';
var note = (0, _debug2.annotate)(namespace);
var debug = (0, _debug2.debug)(namespace, ['base']);

var regex = exports.regex = {
  splain: /^\s*plain\s+(.*?)\s*$/,
  include: /^\s*include\s+(.*?)\s*$/,
  whitespaceEnd: /^\s*$/,
  whitespace: /^(\s*)/,
  newline: /\n/,
  strippable: /^(?:\s*\n)+/,
  strippable2: /[\s\n]*$/,
  EOF: /\n+$/
};

/**
 * test whether a string is whitespace
 * @function isWhitespace
 * @param {string} x - string to test
 * @return {boolean} isItWhitespace?
 */
var isWhitespace = exports.isWhitespace = note('isWhitespace')(function (x) {
  return regex.whitespaceEnd.test(x);
});

/**
 * return an empty string when given a string matching a shebang i.e. #!/usr/bin/env node
 * @function stripShebang
 * @pure
 * @param {string} x - a string to test for shebang-iness
 * @return {string} the original string or an empty one
 */
var stripShebang = exports.stripShebang = note('stripShebang')(function _stripShebang(x) {
  var match = x.match(/^#!\/[^\n]*\n/);
  return match ? x.substr(match[0].length) : x;
});

/**
 * @function fileDirective
 * @impure
 * @param {string} filename - file path
 * @param {string} value - value for comparison
 * @param {regex} comparison - regular expression to match value
 * @param {function} callback - a function to call for every file match
 * @async
 * @return {boolean} wasAnyThingMatched?
 */
var fileDirective = exports.fileDirective = note('fileDirective')(function _fileDirective(filename, value, comparison, callback) {
  var match = value.match(comparison);
  if (match) {
    var directivePattern = match[1];
    var globPattern = _path2.default.join(_path2.default.dirname(filename), directivePattern);
    var files = _glob2.default.sync(globPattern);
    if (files.length === 0) {
      throw new Error(directivePattern + ' doesn\'t match any files');
    }
    files.forEach(callback);
    return true;
  } else {
    return false;
  }
});

var getTokens = exports.getTokens = note('getTokens')(function _getTokens(filename) {
  var source = _fs2.default.readFileSync(filename, 'utf8');
  var raw = stripShebang(source);
  var tokens = (0, _lex.lex)({ sourceType: 'module' }, raw);
  debug('tokens!', tokens);
  var resTokens = [];
  (0, _forEach2.default)(note('processToken')(function _processToken(t) {
    var r = void 0;
    if (t.type === 'Comment' && t.value.type === 'Line' && t.value.value[0] === '/') {
      debug('### comment-line-/');
      var value = t.value.value.substr(1);
      r = fileDirective(filename, value, regex.splain, note('matchExplained')(function _matchExplained(name) {
        resTokens.push({
          type: 'Plain',
          value: _fs2.default.readFileSync(name).toString()
        });
      }));
      if (r) {
        debug('### barfing on matchExplained');
        return;
      }
      debug('### passed explained');
      r = fileDirective(filename, value, regex.include, note('matchIncluded')(function _matchIncluded(name) {
        resTokens = resTokens.concat(getTokens(name));
      }));
      if (r) {
        debug('### barfing on matchIncluded');
        return;
      }
      (0, _assert2.default)(false, 'unknown directive: ' + value);
    } else {
      t.raw = raw.substr(t.range[0], t.range[1] - t.range[0]);
      resTokens.push(t);
    }
  }), tokens);
  resTokens.push({
    type: 'EOF',
    value: ''
  });
  return resTokens;
});

var unindent = exports.unindent = note('unindent')(function _unindent(value) {
  var lines = value.split(regex.newline);
  var first = (0, _find2.default)(function (l) {
    return !isWhitespace(l);
  }, lines);
  var indent = first ? regex.whitespace.exec(first)[1] : '';
  // Drop empty lines at the beginning of the literate comment
  while (lines[0] !== undefined && isWhitespace(lines[0])) {
    lines.shift();
  }
  // unindent lines
  return (0, _map2.default)(note('processLine')(function _processLine(l) {
    if (l.indexOf(indent) === 0) {
      return l.replace(indent, '');
    } else if (isWhitespace(l)) {
      return '';
    } else {
      return l;
    }
  }), lines).join('\n') + '\n';
});

var literate = exports.literate = note('function')(function _literate(filename) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var code = opts.code || false;
  var codeOpen = opts.codeOpen || '\n```js\n';
  var codeClose = opts.codeClose || '\n```\n\n';
  var tokens = getTokens(filename);
  var state = 'code';
  var content = '';
  var codeBuffer = '';
  function appendCode() {
    if (state === 'code') {
      state = 'text';
      if (!isWhitespace(codeBuffer)) {
        content += codeOpen + codeBuffer.replace(regex.strippable, '').replace(regex.strippable2, '') + codeClose;
      }
    }
  }
  function appendText(value) {
    if (content === '') {
      content = value;
    } else {
      content += '\n' + value;
    }
  }
  (0, _forEach2.default)(note('processToken')(function processToken(t) {
    if (t.type === 'Plain') {
      appendCode();
      appendText(t.value);
    } else if (t.type === 'EOF') {
      appendCode();
      appendText('');
    } else if (t.type === 'Comment' && t.value.type === 'Block' && t.value.value[0] === '*') {
      appendCode();
      // literate comment
      var comment = t.value;
      // block comment starting with /**
      var value = comment.value.slice(1);
      appendText(unindent(value));
    } else if (code) {
      if (state !== 'code') {
        state = 'code';
        codeBuffer = '';
      }
      codeBuffer += t.raw;
    }
  }), tokens);
  // code at the end of the file
  appendCode();
  // newline EOF
  content = content.replace(regex.EOF, '\n');
  return content;
});

exports.default = literate;