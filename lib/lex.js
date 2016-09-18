'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lex = exports.addWhitespace = exports.range = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _curry = require('lodash/fp/curry');

var _curry2 = _interopRequireDefault(_curry);

var _filter = require('lodash/fp/filter');

var _filter2 = _interopRequireDefault(_filter);

var _forEach = require('lodash/fp/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _esprima = require('esprima');

var _esprima2 = _interopRequireDefault(_esprima);

var _debug2 = require('f-utility/dev/debug');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// unable to use annotate from debug here, 'cause it will interfere with curried functions
// as it only works with unary
var _debug = (0, _debug2.debug)('ljs2:lexer');
var debug = {
  range: _debug(['range']),
  addWhitespace: _debug(['addWhitespace']),
  processComment: _debug(['addWhitespace', 'processComment']),
  processToken: _debug(['addWhitespace', 'processToken']),
  lex: _debug(['lex'])
};
/**
 * @function range
 * @param {object} comment - a comment object
 * @return {boolean} isWithinRange
 * @pure
 */
var range = exports.range = (0, _curry2.default)(function _range(from, to, comment) {
  debug.range('# input', from, to, comment);
  if (!comment || !comment.range) {
    throw new ReferenceError('Expected to be able to access comment.range.');
  }
  var output = comment.range[0] >= from && comment.range[1] <= to;
  debug.range('# output', output);
  return output;
});

/**
 * add whitespace to a range
 * @function addWhitespace
 * @curried
 * @impure
 * @param {string} raw - the original raw source
 * @param {object} syntax - the parsed AST
 * @param {number} from - number start
 * @param {number} to - number end
 * @return {null} nothing
 */
var addWhitespace = exports.addWhitespace = (0, _curry2.default)(function _addWhitespace(raw, syntax, tokens, from, to) {
  debug.addWhitespace('# input', raw, syntax, tokens, from, to);
  if (!syntax || !syntax.comments) {
    throw new ReferenceError('Expected to be able to access syntax.comments.');
  }
  var ws = void 0;
  var commentFilter = (0, _filter2.default)(range(from, to));
  var comments = commentFilter(syntax.comments);
  (0, _forEach2.default)(function _processComment(c) {
    debug.processComment('# input', c);
    if (c.range[0] !== from) {
      ws = raw.substr(from, c.range[0] - from);
      tokens.push({
        type: 'Whitespace',
        value: ws,
        range: [from, c.range[0]]
      });
    }
    tokens.push({
      type: 'Comment',
      value: c,
      range: c.range
    });
    from = c.range[1];
  }, comments);
  if (from !== to) {
    ws = raw.substr(from, to - from);
    tokens.push({
      type: 'Whitespace',
      value: ws,
      range: [from, to]
    });
  }
  debug.addWhitespace('# mutated tokens', tokens);
});

/**
 * A lexer, an es6 & fp-lite rewrite from the original ljs repo:
 * https://github.com/phadej/ljs/blob/master/lib/lex.js
 * @function lex
 * @curried
 * @param {object} options - optional inputs to be applied to esprima.parse
 * @param {string} raw - input source
 * @return {array} tokens
 */
var lex = exports.lex = (0, _curry2.default)(function _lex(options, raw) {
  debug.lex('# input', options, raw);
  var syntax = _esprima2.default.parse(raw, _extends({}, options, {
    tokens: true,
    loc: true,
    range: true,
    comment: true
  }));
  var tokens = [];
  var currRange = 0;
  syntax.tokens.forEach(function _processToken(token) {
    debug.processToken('# input', token);
    if (token.range[0] !== currRange) {
      addWhitespace(raw, syntax, tokens, currRange, token.range[0]);
    }
    tokens.push(token);
    currRange = token.range[1];
  });
  if (raw.length !== currRange) {
    addWhitespace(raw, syntax, tokens, currRange, raw.length);
  }
  debug.lex('# output', tokens);
  return tokens;
});

exports.default = lex;