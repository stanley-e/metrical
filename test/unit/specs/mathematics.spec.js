import { MetricalRuntime } from '../../../src/metrical-script.js'

describe('MetricalScript', () => {
  it('should understand the standard order of operations', () => {
    var runtime = new MetricalRuntime()
    var x = runtime.addVariable('A', '(2+2)*10+20/2-45')
    var y = x.evaluate()
    expect(y).to.equal(5)
  })
})
