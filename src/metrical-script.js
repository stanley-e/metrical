import {Lexer} from './lexer.js'
import {AccessContext, MetObject, MetVariable} from './reactive-reference.js'
import {PrattParser, infixChainable, prefixChain, prefix, literal} from './pratt-parser.js'

var whitespace = new function () {
  this.name = 'whitespace'
  this.regex = /^\s+/
  var self = this
  this.construct = function (match) {
    return Object.create(self)
  }
  this.leftBindingPower = 0
  this.nullDenotation = null
  this.leftDenotation = null
  this.evaluate = null
}()

var plus = new function () {
  this.name = '+'
  this.regex = /^\+/
  var self = this
  this.construct = function (match) {
    return Object.create(self)
  }
  this.leftBindingPower = 50
  this.nullDenotation = prefixChain(70)
  this.leftDenotation = infixChainable(50)
  this.evaluate = function (handle) {
    var n = 0
    for (var i = 0; i < this.expr.length; i++) {
      n += this.expr[i].evaluate(handle)
    }
    return n
  }
}()

var minus = new function () {
  this.name = '-'
  this.regex = /^-/
  var self = this
  this.construct = function (match) {
    return Object.create(self)
  }
  this.leftBindingPower = 50
  this.nullDenotation = prefix(70)
  this.leftDenotation = infixChainable(50)
  this.evaluate = function (handle) {
    if (this.expr.length === 1) {
      return (-this.expr[0].evaluate(handle))
    } else {
      var n = this.expr[0].evaluate(handle)
      for (var i = 1; i < this.expr.length; i++) {
        n -= this.expr[i].evaluate(handle)
      }
      return n
    }
  }
}()

var division = new function () {
  this.name = '/'
  this.regex = /^\//
  var self = this
  this.construct = function (match) {
    return Object.create(self)
  }
  this.leftBindingPower = 60
  this.nullDenotation = null
  this.leftDenotation = infixChainable(60)
  this.evaluate = function (handle) {
    var n = this.expr[0].evaluate(handle)
    for (var i = 1; i < this.expr.length; i++) {
      n = n / this.expr[i].evaluate(handle)
    }
    return n
  }
}()

var multiplication = new function () {
  this.name = '*'
  this.regex = /^\*/
  var self = this
  this.construct = function (match) {
    return Object.create(self)
  }
  this.leftBindingPower = 60
  this.nullDenotation = null
  this.leftDenotation = infixChainable(60)
  this.evaluate = function (handle) {
    var n = this.expr[0].evaluate(handle)
    for (var i = 1; i < this.expr.length; i++) {
      n = n * (this.expr[i].evaluate(handle))
    }
    return n
  }
}()

var number = new function () {
  this.name = 'number'
  this.regex = /^\d*\.?\d+\b/
  this.construct = function (x) {
    var newToken = Object.create(this)
    newToken.value = parseFloat(x.toString())
    return newToken
  }
  this.leftBindingPower = 10
  this.nullDenotation = literal()
  this.evaluate = function (handle) {
    return this.value
  }
}()
var variableName = new function () {
  this.name = 'name'
  this.regex = /^[A-Za-z]\w*/
  this.construct = function (x) {
    var newToken = Object.create(this)
    newToken.value = x.toString()
    return newToken
  }
  this.leftBindingPower = 0
  this.nullDenotation = literal()
  this.leftDenotation = null
  this.evaluate = function (handle) {
    return handle.get(this.value)
  }
}()
var dot = new function () {
  this.name = '.'
  this.regex = /^\./
  this.construct = function () { return Object.create(this) }
  this.leftBindingPower = 80
  this.nullDenotation = null
  var dot = this
  this.leftDenotation = function (pratt, left) {
    if (dot.isPrototypeOf(left)) {
      this.expr = left.expr.slice()
    } else {
      this.expr = []
    }
    this.expr.push(pratt.consume(variableName))
    this.arity = 'sequence'
    return this
  }
}()

var rightParen = new function () {
  this.name = ')'
  this.regex = /^\)/
  this.construct = function () {
    return Object.create(this)
  }
  this.leftBindingPower = 0
  this.nullDenotation = null
  this.leftDenotation = null
}()

var leftParen = new function () {
  this.name = '('
  this.regex = /^\(/
  this.construct = function () {
    return Object.create(this)
  }
  this.leftBindingPower = 0
  this.nullDenotation = function (pratt) {
    this.expr = [pratt.expression(0)]
    pratt.consume(rightParen)
    this.arity = 'literal'
    return this
  }
  this.leftDenotation = function (pratt, left) {
    this.variableName = left
    this.args = pratt.expression(0)
    pratt.consume(rightParen)
    this.arity = 'infix'
    return this
  }
  this.evaluate = function (handle) {
    return this.expr[0].evaluate(handle)
  }
}()

var tokens = [
  whitespace,
  plus,
  minus,
  division,
  multiplication,
  leftParen,
  rightParen,
  number, // Make sure number is before dot
  dot,
  variableName
]

var metricalLexer = new Lexer(tokens)
var parser = new PrattParser()

export function interpret (context, formula) {
  try {
    var t = metricalLexer.lex(formula)
    t = t.filter(function (x) {
      return !(whitespace.isPrototypeOf(x))
    })
  } catch (error) {
    console.log(error)
    throw error
  }
  var x = parser.parse(t)
  console.log()
  return x.evaluate(context)
}

export class MetricalRuntime extends MetObject {
  addVariable (path, formula) {
    path = [].concat(path)
    var lastName = path.pop()
    var v = (new AccessContext(this)).get(path)
    var newVar = new MetVariable(formula, interpret, this)
    v.createMember(lastName, newVar)
    return newVar
  }
}
