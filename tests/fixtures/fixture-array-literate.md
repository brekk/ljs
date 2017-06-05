
```js
import {curry} from 'lodash/fp'


// This line should be visible
```


* @namespace util.array
* @function join
* @desc curried array.join with inverted parameter orders
* @curried
* @param {string} joiner - a string to join the array together with
* @param {array} array
* @return {string}
* @example
* <!--@assert(join(`x`, [1,2,3]), `1x2x3`)-->
* <!--/@-->


```js
export const join = curry(function _join(joiner, array) {
  if (typeof joiner !== `string`) {
    throw new TypeError(`Expected joiner to be string.`)
  }
  if (!Array.isArray(array)) {
    throw new TypeError(`Expected array to be given.`)
  }
  return array.join(joiner)
})
```
