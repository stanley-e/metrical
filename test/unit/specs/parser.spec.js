import { MetricalRuntime } from '../../../src/metrical-script.js'

describe('MetricalScript', () => {
  it('should understand 2+2', () => {
    var runtime = new MetricalRuntime()
    var x = runtime.addInterpretedVariable('A', '2+2')
    var y = x.getValue()
    expect(y).to.equal(4)
  })
})
