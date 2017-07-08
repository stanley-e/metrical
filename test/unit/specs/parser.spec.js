import { MetricalRuntime } from '../../../src/metrical-script.js'

describe('MetricalScript', () => {
  it('should understand 2+2', () => {
    var runtime = new MetricalRuntime()
    var x = runtime.addVariable('A', '2+2')
    var y = x.evaluate()
    expect(y).to.equal(4)
  })
})
