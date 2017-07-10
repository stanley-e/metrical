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
      current = retrievedVariable.getValue(chain)
    }
    return current
  }
  getRelative (address, namespace) {
    return this.get(address, this.variable)
  }
}
class MetBaseVariable {
  constructor (namespace) {
    this.value = null
    this.error = null
    this.inError = false
    this.name = null
    this.owningObject = null
    this.isUpToDate = false
    this.immediateDependants = new Set()
  }
  getValue () {
    return this.value
  }
  setValue (value) {
    this.value = value
    this.isUpToDate = true
    var dependants = this.immediateDependants.keys()
    for (let each of dependants) {
      each.recalculate()
    }
  }
  registerOwningObject (obj, key) {
    if (this.owningObject == null && this.name == null) {
      this.name = key
      this.owningObject = obj
    } else {
      throw new Error('Cannot set owner object of variable twice')
    }
  }
  getAddress () {
    var value = this
    var address = []
    while (value !== this.namespace) {
      address.push(value.name)
      value = value.getOwningObject()
    }
    address.reverse()
    return address
  }
  getOwningObject () {
    return this.OwningObject
  }
}

export class MetSetVariable extends MetBaseVariable {
  constructor (initialValue, namespace) {
    super(namespace)
    this.setValue(initialValue)
  }
}

export class MetInterpretedVariable extends MetBaseVariable {
  constructor (formula, interpreter, namespace) {
    super(namespace)
    this.formula = formula || ''
    this.immediateDependencies = new Set()
    this.interpreter = interpreter
    this.namespace = namespace
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
  markOutdated () {
    if (this.isUpToDate === true) {
      this.isUpToDate = false
      var dependants = this.immediateDependants.keys()
      for (let each of dependants) {
        each.markOutdated()
      }
    }
  }
  setFormula (x) {
    this.formula = x
    this.recalculate()
  }
  recalculate (chain) {
    this.markOutdated()
    // Reset
    this.clearDependencies()
    this.error = null
    this.inError = false

    chain = chain || []
    var variableHandle = new AccessContext(this.namespace, chain.concat(this), this)
    variableHandle.onAccess.subscribe(this, this.addDependency)
    try {
      chain = loopCheck(this, chain)
      var newValue = this.interpreter(variableHandle, this.formula)
    } catch (error) {
      this.error = error
      this.inError = true
    }
    newValue = newValue || null
    this.setValue(newValue)
  }
  getValue (chain) {
    if (this.inError) {
      throw this.error
    }
    if (this.isUpToDate) {
      return this.value
    } else {
      this.recalculate(chain)
      return this.getValue()
    }
  }
}

export class MetObject {
  constructor () {
    this.members = new Map()
    this.owningObject = null
  }
  createMember (key, variable) {
    this.members.set(key, variable)
    variable.registerOwningObject(this, key)
    return variable
  }
  registerOwningObject (owner) {
    this.OwningObject = owner
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
