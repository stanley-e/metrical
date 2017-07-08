// Todo: Create custom lexing error that can be caught and rethrown
// after remapping position.

export class Lexer {
  constructor (tokenTypes) {
    this.tokenTypes = tokenTypes
  }
  lex (str) {
    var tokenOutput = []
    var brokenString = str
    while (brokenString.length > 0) {
      for (var each of this.tokenTypes) {
        var match = each.regex.exec(brokenString)
        if (match) {
          var newToken = each.construct(match)
          newToken.type = each
          tokenOutput.push(newToken)
          brokenString = brokenString.substring(match[0].length)
          break
        }
      }
      if (!match) {
        throw Error('Lexing Error')
      }
    }
    return tokenOutput
  }
}
