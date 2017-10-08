const ThompsonConstruction = require('./ThompsonConstruction');

//(of|ah)*ofabf    ofabf ==>   true
//o*ofabf      oofabf  ===> true
//(1(\\d+)[0-9])
let thompsonConstruction = new ThompsonConstruction('(.+)?');
thompsonConstruction.runNfaMachineConstructorExample(); //根剧解析后的正则来构造Nfa图像
// thompsonConstruction.runNfaGreedMatchingExample('http://net.bingyan.com', true);
thompsonConstruction.runNfaIntepretorExample('oofabf');
console.log("Finish");

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
// function A() {
//     this.inputSet = new Set();
//     this.returnIS = function () {
//         return this.inputSet
//     }
// }
// var a = new A()
// a.inputSet.add('1')
// a.returnIS();
// var b = new A()
// b.inputSet.add('2')

// const Nfa = require('./Nfa');


// //处理x{n,m}
// //@params x char
// //@params n numChar
// function multiQulifier2Regexpr(x, min, max) {
//     if (!parseInt(min) || parseInt(min) <= 0) {
//         throw new Error('Invalid input max!')
//     }
//     if (!parseInt(max) || parseInt(max) <= 0) {
//         throw new Error('Invalid input max!')
//     }
//     let minNum = parseInt(min);
//     let maxNum = parseInt(max);
//
//     let res = "";
//     res += qualifier2Regexpr(x, minNum);
//     res += qualifier2Regexpr(x + '?', maxNum - minNum)
//     return "(" + res + ")"
// }
//
// //处理x{n} n > 0
// //@params x char
// //@params n numChar
// function qualifier2Regexpr(x, n) {
//     if (!parseInt(n) || parseInt(n) <= 0) {
//         throw new Error('Invalid input n!')
//     }
//     let num = parseInt(n);
//
//     let res = "";
//     for (let i = 0; i < num; i++) {
//         res += x;
//     }
//     return '(' + res + ')'
// }
//
// //input处理限定符 {n}
// function prePreProcessExpr(inputStr) {
//     let preToken = null;
//     let charIndex = 0;
//     let regExpr;
//     let startPlace = charIndex;
//     let begin = inputStr.indexOf('\\');
//     let end;
//     while (begin !== -1) {
//         regExpr = "";
//         if (isAlpha(inputStr[begin + 1])) {
//             switch (inputStr[begin + 1].toUpperCase()) {
//                 case 'W':
//                 case 'B':
//                 case 'F':
//                 case 'S':
//                 case 'N':
//                 case 'R':
//                 case 'T':
//                 case 'D':
//                 case '\0':
//                 case '\033':
//                     if (inputStr[begin + 2] === '{') {
//                         let subStr = inputStr.substring(begin + 3, inputStr.indexOf('}', begin + 3));
//                         if (parseInt(subStr)) { //如果是 {n} 或者 {n,m}
//                             if (parseInt(subStr).toString() === subStr) { //如果是单个n
//                                 regExpr += inputStr.substring(0, begin);
//                                 regExpr += qualifier2Regexpr(inputStr.substring(begin, begin + 2), parseInt(subStr))
//                                 regExpr += inputStr.substring(inputStr.indexOf('}', begin + 3) + 1);
//                                 inputStr = regExpr;
//                                 begin = inputStr.indexOf('\\', begin + 1)
//                             } else if (subStr.split(',').length === 2){
//                                 let array = subStr.split(',');
//                                 let min = parseInt(array[0]);
//                                 let max = parseInt(array[1]);
//                                 let frontChars = inputStr.substring(begin, begin + 2)
//                                 if (max) { //{n,m}
//                                     regExpr += inputStr.substring(0, begin);
//                                     regExpr += multiQulifier2Regexpr(frontChars,min, max)
//                                     regExpr += inputStr.substring(inputStr.indexOf('}', begin + 3) + 1);
//                                     inputStr = regExpr;
//                                     begin = inputStr.indexOf('\\', begin + 1);
//                                 } else { //{m,}
//                                     regExpr += inputStr.substring(0, begin);
//                                     regExpr += qualifier2Regexpr(frontChars,min) + '(' + frontChars+ '*)';
//                                     regExpr += inputStr.substring(inputStr.indexOf('}', begin + 3) + 1);
//                                     inputStr = regExpr;
//                                     begin = inputStr.indexOf('\\', begin + 1);
//                                 }
//
//                             } else {
//                                 throw new Error()
//                             }
//                         } else {
//                             begin = inputStr.indexOf('\\', begin + 1);
//                             break;
//                         }
//                     } else {
//                         begin = inputStr.indexOf('\\', begin + 1);
//                         break;
//                     }
//                     break;
//                 case 'X':
//                 case '0':
//
//                 default :
//                     begin = inputStr.indexOf('\\', begin + 1);
//                     break;
//             }
//         }
//     }
//
//     //第二部分
//     charIndex = 0;
//     begin = charIndex;
//     begin = inputStr.indexOf("{", begin);
//     while (begin !== -1) {
//         regExpr = "";
//         end = inputStr.indexOf("}", begin + 1);
//         let subStr = inputStr.substring(begin + 1, end);
//         if (parseInt(subStr)) { //如果是数
//             let frontChar = inputStr[begin - 1];
//             if (parseInt(subStr).toString() === subStr) {
//                 regExpr += inputStr.substring(0, begin - 1);
//                 regExpr += qualifier2Regexpr(frontChar, subStr);
//                 regExpr += inputStr.substring(end + 1);
//                 inputStr = regExpr;
//                 begin = inputStr.indexOf('{', begin)
//             } else if (subStr.split(',').length === 2) {
//
//                 let array = subStr.split(',');
//                 let min = parseInt(array[0]);
//                 let max = parseInt(array[1]);
//                 if (max) {
//                     regExpr += inputStr.substring(0, begin - 1);
//                     regExpr += multiQulifier2Regexpr(frontChar, min, max);
//                     regExpr += inputStr.substring(end + 1);
//
//                 } else { //如果是NaN也就是{n,}
//                     regExpr += inputStr.substring(0, begin - 1);
//                     regExpr += qualifier2Regexpr(frontChar, min) + '(' + frontChar + '*)';
//                     regExpr += inputStr.substring(end + 1);
//
//                 }
//                 inputStr = regExpr;
//                 begin = inputStr.indexOf('{', begin);
//
//             } else {
//                 throw new Error()
//             }
//         }
//         else {
//             begin = inputStr.indexOf("{", begin + 1)
//         }
//     }
//
//
//     return inputStr
// }
//
//
// function isAlpha(c) {
//     let charCode = c.charCodeAt();
//     return (charCode >= 'a'.charCodeAt() && charCode <= 'z'.charCodeAt()) || (charCode >= 'A'.charCodeAt() && charCode <= 'Z'.charCodeAt());
// }

// let b = multiQulifier2Regexpr("a", '1', '10');
// let a = prePreProcessExpr('(o{10,}|\\w{3})');
