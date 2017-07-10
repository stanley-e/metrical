import { MetricalRuntime } from '../../../src/metrical-script.js'

describe('Variables', () => {
  it('should detect loops', () => {
    const runtime = new MetricalRuntime()
    var variables = []
    variables.push(runtime.addInterpretedVariable('A0', '10'))
    for (var i = 1; i < 10; i++) {
      variables.push(runtime.addInterpretedVariable('A' + i, 'A' + (i - 1)))
    }
    for (var beforeChange of variables) {
      expect(beforeChange.inError, 'Variables are in error while uncycled').to.equal(false)
    }
    variables[0].setFormula('A9')
    for (var afterCycle of variables) {
      expect(afterCycle.inError, 'Variables are not in error when they are in a cycle').to.equal(true)
    }
    variables[0].setFormula('10')
    for (var fixedCycle of variables) {
      expect(fixedCycle.inError, 'Variables remain in error after a cycle has been fixed').to.equal(false)
    }
  })
})
