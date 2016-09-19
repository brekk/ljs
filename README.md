# ljs2

> Generate docs from your source

[![CircleCI](https://circleci.com/gh/brekk/ljs2.svg?style=shield&circle-token=ba5f3371283ba17121f58a3645e3799598579755)](https://circleci.com/gh/brekk/ljs2)

## command line

If `ljs2` is installed globally,
you can use `ljs2` command line tool to process your literate javascript files

```sh
$ ljs2 -c -o foo.md foo.js
$ ljs2 --help
```

## Release History

- **1.0.0** &mdash; *2016-09-19* &mdash; Initial release
  - forked off of [ljs](https://github.com/phadej/ljs) 0.3.2

## Contributing

_Disclaimer:_ As this project is a fork of an existing (seemingly [unmaintained](https://github.com/phadej/ljs/pulse)) [library](https://github.com/phadej/ljs), the direction has changed slightly.

In the spirit of the original [CONTRIBUTING.md](https://github.com/phadej/ljs/blob/master/CONTRIBUTING.md):

Take care to maintain the existing coding style (as maintained by eslint). Add unit tests for any new or changed functionality. Lint and test your code.

## Related work

This tool can be used to do literate programming!
[Docco](http://jashkenas.github.io/docco/) is similar tool, however *ljs2* is markup-language-agnostic.

The MIT License (MIT)

* Copyright (c) 2016 Brekk Bockrath
* Copyright (c) 2013, 2014 [Oleg Grenrus](https://github.com/phadej/ljs/blob/master/LICENSE)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
