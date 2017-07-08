/*
  mNumber = function(x) {
  var m = this
  this.value = x
  this.__add__ = function(y) {
  if (m.isPrototypeOf(y)) {
  return m.call(this.value+y.value)
  }
  }
  this.__subtract__ = fucntion(y) {
  }

  this.__divide__ = function(y) {
  if (m.isPrototypeOf(y)) {
  return m.call(this.value/y.value)
  }
  }
  this.__multiply__ = function(y) {
  if (m.isPrototypeOf(y)) {
  return m.call(this.value*y.value)
  }
  }
  }
  incremental = function(fun) {
  return function(

  }

  }
*/

export function infix (bp) {
  return function (pratt, left) {
    this.left = left
    this.right = pratt.expression(bp)
    this.arity = 'binary'
    return this
  }
}
export function infixChainable (bp) {
  return function (pratt, left) {
    if (left.type === this.type) {
      this.expr = left.expr.slice()
    } else {
      this.expr = [left]
    }
    this.expr.push(pratt.expression(bp))
    this.arity = 'sequence'
    return this
  }
}
export function prefix (bp) {
  return function (pratt) {
    this.right = pratt.expression(bp)
    this.arity = 'unary-prefix'
    return this
  }
}
export function prefixChain (bp) {
  return function (pratt) {
    this.expr = [pratt.expression(bp)]
    this.arity = 'unary-prefix-sequence'
  }
}

export function literal () {
  return function (pratt) {
    this.arity = 'literal'
    return this
  }
}

export class PrattParser {
  constructor (tokens) {
    this.tokenStream = null
    this.tokenPos = null
  }
  parse (tokens) {
    this.tokenStream = tokens
    this.tokenPos = 0
    return this.expression()
  }
  currentToken () {
    return this.tokenStream[this.tokenPos]
  }
  advance () {
    this.tokenPos++
  }
  canAdvance () {
    return this.tokenPos < this.tokenStream.length
  }
  consume (type) {
    var current = this.currentToken()
    if (type.isPrototypeOf(current)) {
      this.advance()
      return current
    } else {
      throw new Error()
    }
  }
  expression (rightBindingPower) {
    var leftExpression
    rightBindingPower = rightBindingPower || 0
    var current = this.currentToken()
    this.advance()
    leftExpression = current.nullDenotation(this)
    while (this.canAdvance() && (rightBindingPower < this.currentToken().leftBindingPower)) {
      var prevToken = this.currentToken()
      this.advance()
      leftExpression = prevToken.leftDenotation(this, leftExpression)
    }
    return leftExpression
  }
}
