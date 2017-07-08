function extendError (classConstructor) {
  classConstructor.protototype = Object.create(Error.prototype)
  classConstructor.prototype.constructor = classConstructor
}

export function CycleErrorException (chain) {
  this.name = 'CycleErrorException'
  this.message = 'Circular references create a loop consisting of '
  this.chain = chain
  var x = []
  for (var i = 0; i < chain.length; i++) {
    x.push("'" + chain[i].name + "'")
  }
  this.message += x.join(', ')
}
extendError(CycleErrorException)

export function NotDefinedException (msg) {
  this.name = 'NotDefinedException'
  this.message = "The variable '" + msg + "' is not defined"
}
extendError(NotDefinedException)

function loopCheck (variable, chain) {
  // var i = chain.indexOf(variable)
  // Above doesn't work, I assume because of vue wrappers
  for (var i = 0; i < chain.length; i++) {
    var each = chain[i]
    if (variable === each) {
      throw new CycleErrorException(chain.slice(i))
    }
  }
}

class Event {
  constructor () {
    this.subscribers = []
  }
  subscribe (obj, method) {
    var x = [obj, method]
    this.subscribers.push(x)
    return x
  }
  trigger () {
    for (var i = 0; i < this.subscribers.length; i++) {
      var eachObj = this.subscribers[i][0]
      var eachFunc = this.subscribers[i][1]
      eachFunc.apply(eachObj, arguments)
    }
  }
}

export class AccessContext {
  constructor (namespace, chain, variable) {
    this.defaultNamespace = namespace
    this.variable = variable || namespace
    this.chain = chain || []
    this.onAccess = new Event()
  }
  get (address, namespace) {
    namespace = namespace || this.defaultNamespace
    address = [].concat(address)
    var chain = this.chain
    var current = namespace
    for (var i = 0; i < address.length; i++) {
      var addressPart = address[i]
      var retrievedVariable
      if (addressPart === null) {
        retrievedVariable = current.getGroup()
      } else {
        retrievedVariable = current.getMember(address[i])
      }
      this.onAccess.trigger(retrievedVariable)
      current = retrievedVariable.evaluate(chain)
    }
    return current
  }
  getRelative (address, namespace) {
    return this.get(address, this.variable)
  }
}

export class MetVariable {
  constructor (formula, interpreter, namespace) {
    this.value = null
    this.error = null
    this.inError = false
    this.isUpToDate = false
    this.formula = formula || ''
    this.immediateDependants = new Set()
    this.immediateDependencies = new Set()
    this.interpreter = interpreter
    this.namespace = namespace
    this.group = null
    this.name = null
    this.namespace = namespace
  }
  registerGroup (metObj, key) {
    // This is to properly get the name address of a specific variable in
    // an object. Note must also be defined on MetObject
    if (this.group === null) {
      this.group = metObj
      this.name = key
    } else {
      throw Error('A variable cannot exist on multiple objects at once')
    }
  }
  getAddress () {
    // Need to make sure that error handling is handled after the group
    // is already registered. Passing it through the constructor might be
    // needed
    var value = this
    var address = []
    while (value !== this.namespace) {
      address.push(value.name)
      value = value.getGroup()
    }
    address.reverse()
    return address
  }
  getGroup () {
    return this.group
  }
  clearDependencies () {
    var dependencies = this.immediateDependencies.keys()
    for (let each of dependencies) {
      each.immediateDependants.delete(this)
    }
    this.immediateDependencies.clear()
  }
  addDependency (dependancy) {
    this.immediateDependencies.add(dependancy)
    dependancy.immediateDependants.add(this)
  }
  getDependencies () {
    return this.immediateDependencies.keys()
  }
  getDependants () {
    return this.immediateDependants.keys()
  }
  markProcessing () {
    if (this.isUpToDate === true) {
      this.isUpToDate = false
      var dependants = this.immediateDependants.keys()
      for (let each of dependants) {
        each.markProcessing()
      }
    }
  }
  unmarkProcessing () {
    this.isUpToDate = true
    var dependants = this.immediateDependants.keys()
    for (let each of dependants) {
      if (each.isUpToDate === false) {
        each.recalculate()
      }
    }
  }
  setFormula (x) {
    this.formula = x
    this.markProcessing()
  }
  recalculate (chain) {
    this.markProcessing()
    // Reset
    this.clearDependencies()
    this.error = null
    this.inError = false
    chain = chain || []
    var variableHandle = new AccessContext(this.namespace, chain.concat(this), this)
    variableHandle.onAccess.subscribe(this, this.addDependency)
    try {
      chain = loopCheck(this, chain)
      this.value = this.interpreter(variableHandle, this.formula)
    } catch (error) {
      this.error = error
      this.inError = true
    }
    this.unmarkProcessing()
  }
  evaluate (chain) {
    if (this.inError) {
      throw this.error
    }
    if (this.isUpToDate) {
      return this.value
    } else {
      this.recalculate(chain)
      return this.evaluate()
    }
  }
}

export class MetObject {
  constructor () {
    this.members = new Map()
  }
  createMember (key, variable) {
    this.members.set(key, variable)
    variable.registerGroup(this, key)
    return variable
  }
  registerGroup (owner) {
    this.group = owner
  }
  getMember (key) {
    var v = this.members.get(key)
    if (v === undefined) {
      throw new NotDefinedException(key)
    } else {
      return this.members.get(key)
    }
  }
}
