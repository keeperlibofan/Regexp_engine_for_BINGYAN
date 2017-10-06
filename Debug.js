// const MacroHandler = require('./MacroHandler')
// const ErrorHandler = require('./ErrorHandler')


// function isDigit(c) {
//     return c.charCodeAt() >= '0'.charCodeAt() && c.charCodeAt() <= '9'.charCodeAt()
// }
// function isHexDigit(c) {
//     return (isDigit(c) || ('a'.charCodeAt() <= c.charCodeAt() && c.charCodeAt() <= 'f'.charCodeAt()) || ('A'.charCodeAt() <= c.charCodeAt() && c.charCodeAt() <= 'F'.charCodeAt()))
// }
// function hex2Bin(c) {
//     /*
//      * 将十六进制数对应的字符转换为对应的数值，例如
//      * A 转换为10， B转换为11
//      * 字符c 必须满足十六进制字符： 0123456789ABCDEF
//      */
//     return (isDigit(c) ? (c.charCodeAt() - '0'.charCodeAt()) : (c.toUpperCase().charCodeAt() - 'A'.charCodeAt() + 10)) & 0xf;
// }

// const RegularExpressionHandler = require('./RegularExpressionHandler')
// const Lexer = require('./Lexer');
// var b = new MacroHandler()
// var testCase = '{D}|{A}'
// var exprHandler = new RegularExpressionHandler(testCase, b)
// exprHandler.processRegularExprs()
// var lexer = new Lexer(exprHandler)
// lexer.advance()
function A() {
    this.inputSet = new Set();
    this.returnIS = function () {
        return this.inputSet
    }
}
var a = new A()
a.inputSet.add('1')
a.returnIS();
var b = new A()
b.inputSet.add('2')
const ThompsonConstruction = require('./ThompsonConstruction')
var thompsonConstruction = new ThompsonConstruction();
thompsonConstruction.runLexerExample()
console.log("Finish")