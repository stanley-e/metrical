import { MetricalRuntime } from '../../../src/metrical-script.js'

describe('Variables', () => {
  it('should detect loops', () => {
    const runtime = new MetricalRuntime()
    var variables = []
    variables.push(runtime.addVariable('A0', '10'))
    for (var i = 1; i < 10; i++) {
      variables.push(runtime.addVariable('A' + i, 'A' + (i - 1)))
    }
    for (var beforeChange of variables) {
      expect(beforeChange.inError, 'Variables are in error while uncycled').to.equal(false)
    }
    variables[0].setFormula('A9')
    variables[0].recalculate()
    for (var afterCycle of variables) {
      expect(afterCycle.inError, 'Variables are not in error when they are in a cycle').to.equal(true)
    }
    variables[0].setFormula('10')
    variables[0].recalculate()
    for (var fixedCycle of variables) {
      expect(fixedCycle.inError, 'Variables remain in error after a cycle has been fixed').to.equal(false)
    }
  })
})
