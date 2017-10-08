const Lexer = require('./Lexer');
const RegularExpressionHandler = require('./RegularExpressionHandler');
const MacroHandler = require('./MacroHandler');
const NfaMachineConstructor = require('./NfaMachineConstructor');
const NfaPair = require("./NfaPair");
const NfaPrinter = require('./NfaPrinter');
const NfaIntepretor = require('./NfaIntepretor');
const Nfa = require('./Nfa');

//@params inputStr RegExpr为需要被解析的正则表达式
let ThompsonConstruction = function(inputStr) {
    let macroHandler = new MacroHandler();
    //anchor处理
    let STA_ANCHOR = false;
    let END_ANCHOR = false;
    if (inputStr[0] === "^") {
        STA_ANCHOR = true;
        inputStr = inputStr.substring(1);
    }

    if (inputStr[inputStr.length - 1] === '$') {
        END_ANCHOR = true;
        inputStr = inputStr.substring(0,inputStr.length - 1)
    }
    //进行{n} , {n,m} 替换
    inputStr = prePreProcessExpr(inputStr);

    let regularExpr = new RegularExpressionHandler(inputStr, macroHandler); //测试用例

    let nfaPrinter = new NfaPrinter();
    let nfaIntepretor = null;
    regularExpr.processRegularExprs(); //处理正则
    let lexer;
    let pair = new NfaPair();
    let nfaMachineConstructor = null;



    this.runLexerExample = runLexerExample;

    //@params importRawExpr string 需要导入的原生表达式
    function runLexerExample (importRawExpr) {
        //为了测试词法构造器，在这里我们不得不取消宏处理，因此重新new了一个处理器
        let regularExpr = new RegularExpressionHandler();
        regularExpr.importRawRegularExprs(importRawExpr);

        lexer = new Lexer(regularExpr);
        let exprCount = 0;
        console.log("当前正则解析的正则表达式: " + regularExpr.getRegularExpression(exprCount));
        lexer.advance();
        while (!lexer.MatchToken(lexer.Token.END_OF_INPUT)) {

            if (lexer.MatchToken(lexer.Token.EOS)) {
                console.log("解析下一个正则表达式");
                exprCount++;
                console.log("当前正则解析的正则表达式: " + regularExpr.getRegularExpression(exprCount));
                lexer.advance();
            }
            else {
                printLexResult();
            }

        }
    }

    //----------------------限定函数处理模块 {m,n} | {m} | {m,}-----------------------
    //处理x{n,m}
    //@params x char
    //@params n numChar
    function multiQulifier2Regexpr(x, min, max) {
        if (!parseInt(min) || parseInt(min) <= 0) {
            throw new Error('Invalid input max!')
        }
        if (!parseInt(max) || parseInt(max) <= 0) {
            throw new Error('Invalid input max!')
        }
        let minNum = parseInt(min);
        let maxNum = parseInt(max);

        let res = "";
        res += qualifier2Regexpr(x, minNum);
        res += qualifier2Regexpr(x + '?', maxNum - minNum)
        return "(" + res + ")"
    }

    //处理x{n} n > 0
    //@params x char
    //@params n numChar
    function qualifier2Regexpr(x, n) {
        if (!parseInt(n) || parseInt(n) <= 0) {
            throw new Error('Invalid input n!')
        }
        let num = parseInt(n);

        let res = "";
        for (let i = 0; i < num; i++) {
            res += x;
        }
        return '(' + res + ')'
    }

    //input处理限定符 {n}
    function prePreProcessExpr(inputStr) {
        let preToken = null;
        let charIndex = 0;
        let regExpr;
        let startPlace = charIndex;
        let begin = inputStr.indexOf('\\');
        let end;
        let ccl_set = new Set(['.','{','}','|','^','$','*','?','+','[',']','(',')']);
        while (begin !== -1) {
            regExpr = "";
            if (isAlpha(inputStr[begin + 1]) || ccl_set.has(inputStr[begin + 1])) {
                switch (inputStr[begin + 1].toUpperCase()) {
                    case '.':
                    case '{':
                    case '}':
                    case '|':
                    case '^':
                    case '$':
                    case '*':
                    case '?':
                    case '+':
                    case '[':
                    case ']':
                    case '(':
                    case ')':
                    case 'W':
                    case 'B':
                    case 'F':
                    case 'S':
                    case 'N':
                    case 'R':
                    case 'T':
                    case 'D':
                    case '\0':
                    case '\033':
                        if (inputStr[begin + 2] === '{') {
                            let subStr = inputStr.substring(begin + 3, inputStr.indexOf('}', begin + 3));
                            if (parseInt(subStr)) { //如果是 {n} 或者 {n,m}
                                if (parseInt(subStr).toString() === subStr) { //如果是单个n
                                    regExpr += inputStr.substring(0, begin);
                                    regExpr += qualifier2Regexpr(inputStr.substring(begin, begin + 2), parseInt(subStr))
                                    regExpr += inputStr.substring(inputStr.indexOf('}', begin + 3) + 1);
                                    inputStr = regExpr;
                                    begin = inputStr.indexOf('\\', begin + 1)
                                } else if (subStr.split(',').length === 2){
                                    let array = subStr.split(',');
                                    let min = parseInt(array[0]);
                                    let max = parseInt(array[1]);
                                    let frontChars = inputStr.substring(begin, begin + 2)
                                    if (max) { //{n,m}
                                        regExpr += inputStr.substring(0, begin);
                                        regExpr += multiQulifier2Regexpr(frontChars,min, max)
                                        regExpr += inputStr.substring(inputStr.indexOf('}', begin + 3) + 1);
                                        inputStr = regExpr;
                                        begin = inputStr.indexOf('\\', begin + 1);
                                    } else { //{m,}
                                        regExpr += inputStr.substring(0, begin);
                                        regExpr += qualifier2Regexpr(frontChars,min) + '(' + frontChars+ '*)';
                                        regExpr += inputStr.substring(inputStr.indexOf('}', begin + 3) + 1);
                                        inputStr = regExpr;
                                        begin = inputStr.indexOf('\\', begin + 1);
                                    }

                                } else {
                                    throw new Error()
                                }
                            } else {
                                begin = inputStr.indexOf('\\', begin + 1);
                                break;
                            }
                        } else {
                            begin = inputStr.indexOf('\\', begin + 1);
                            break;
                        }
                        break;
                    case 'X':

                    default :
                        begin = inputStr.indexOf('\\', begin + 1);
                        break;
                }
            }
            else {
                begin = inputStr.indexOf('\\', begin + 1)
            }
        }

        //第二部分
        charIndex = 0;
        begin = charIndex;
        begin = inputStr.indexOf("{", begin);
        while (begin !== -1) {
            regExpr = "";
            end = inputStr.indexOf("}", begin + 1);
            let subStr = inputStr.substring(begin + 1, end);
            if (parseInt(subStr)) { //如果是数
                let frontChar = inputStr[begin - 1];
                if (parseInt(subStr).toString() === subStr) {
                    regExpr += inputStr.substring(0, begin - 1);
                    regExpr += qualifier2Regexpr(frontChar, subStr);
                    regExpr += inputStr.substring(end + 1);
                    inputStr = regExpr;
                    begin = inputStr.indexOf('{', begin)
                } else if (subStr.split(',').length === 2) {

                    let array = subStr.split(',');
                    let min = parseInt(array[0]);
                    let max = parseInt(array[1]);
                    if (max) {
                        regExpr += inputStr.substring(0, begin - 1);
                        regExpr += multiQulifier2Regexpr(frontChar, min, max);
                        regExpr += inputStr.substring(end + 1);

                    } else { //如果是NaN也就是{n,}
                        regExpr += inputStr.substring(0, begin - 1);
                        regExpr += qualifier2Regexpr(frontChar, min) + '(' + frontChar + '*)';
                        regExpr += inputStr.substring(end + 1);

                    }
                    inputStr = regExpr;
                    begin = inputStr.indexOf('{', begin);

                } else {
                    throw new Error()
                }
            }
            else {
                begin = inputStr.indexOf("{", begin + 1)
            }
        }


        return inputStr
    }


    function isAlpha(c) {
        let charCode = c.charCodeAt();
        return (charCode >= 'a'.charCodeAt() && charCode <= 'z'.charCodeAt()) || (charCode >= 'A'.charCodeAt() && charCode <= 'Z'.charCodeAt());
    }

    //------------------以上为限定符模块处理部分---------------------------------


    function printLexResult() {
        while (!lexer.MatchToken(lexer.Token.EOS)) {
            console.log("当前识别字符ASCII码是: " + lexer.getLexeme());

            if (!lexer.MatchToken(lexer.Token.L)) {
                console.log("当前字符具有特殊含义");
                printMetaCharMeaning(lexer);
            }
            else {
                console.log("当前字符是普通字符常量");
            }

            lexer.advance();
        }
    }

    function printMetaCharMeaning() {
        let s = "";
        if (lexer.MatchToken(lexer.Token.QUA)) {
            s = "当前匹配到了限定符{}"
        }

        if (lexer.MatchToken(lexer.Token.ANY)) {
            s = "当前字符是点通配符";
        }

        if (lexer.MatchToken(lexer.Token.AT_BOL)) {
            s = "当前字符是开头匹配符";
        }

        if (lexer.MatchToken(lexer.Token.AT_EOL)) {
            s = "当前字符是末尾匹配符";
        }

        if (lexer.MatchToken(lexer.Token.CCL_END)) {
            s = "当前字符是字符集类结尾括号";
        }

        if (lexer.MatchToken(lexer.Token.CCL_START)) {
            s = "当前字符是字符集类的开始括号";
        }

        if (lexer.MatchToken(lexer.Token.CLOSE_CURLY)) {
            s = "当前字符是结尾大括号";
        }

        if (lexer.MatchToken(lexer.Token.CLOSE_PAREN)) {
            s = "当前字符是结尾圆括号";
        }

        if (lexer.MatchToken(lexer.Token.DASH)) {
            s = "当前字符是横杆";
        }

        if (lexer.MatchToken(lexer.Token.OPEN_CURLY)) {
            s = "当前字符是起始大括号";
        }

        if (lexer.MatchToken(lexer.Token.OPEN_PAREN)) {
            s = "当前字符是起始圆括号";
        }

        if (lexer.MatchToken(lexer.Token.OPTIONAL)) {
            s = "当前字符是单字符匹配符?";
        }

        if (lexer.MatchToken(lexer.Token.OR)) {
            s = "当前字符是或操作符";
        }

        if (lexer.MatchToken(lexer.Token.PLUS_CLOSE)) {
            s = "当前字符是正闭包操作符";
        }

        if (lexer.MatchToken(lexer.Token.CLOSURE)) {
            s = "当前字符是闭包操作符";
        }

        console.log(s);
    }



    this.runNfaIntepretorExample = runNfaIntepretorExample;
    function runNfaIntepretorExample(inputStr) {
        nfaIntepretor = new NfaIntepretor(pair.startNode);
        console.log(nfaIntepretor.intepretNfa(inputStr))
    }

    this.runNfaGreedMatchingExample = runNfaGreedMatchingExample;

    //贪婪匹配与非贪婪匹配
    //需要匹配的字符串
    function runNfaGreedMatchingExample(matchingStr, ifGreed) {
        if (typeof ifGreed !== 'boolean') {
            throw new Error()
        }
        if (STA_ANCHOR) {
            matchingStr = '\n' + matchingStr;
        }
        nfaIntepretor = new NfaIntepretor(pair.startNode);
        console.log(nfaIntepretor.stringController(matchingStr, ifGreed))
    }


    this.runNfaMachineConstructorExample = runNfaMachineConstructorExample
    //Nfa自动机构造测试
    function runNfaMachineConstructorExample() {
        lexer = new Lexer(regularExpr);
        nfaMachineConstructor = new NfaMachineConstructor(lexer);

        //nfaMachineConstructor.constructNfaForSingleCharacter(pair);
        //nfaMachineConstructor.constructNfaForDot(pair);
        //nfaMachineConstructor.constructNfaForCharacterSetWithoutNegative(pair);
        //nfaMachineConstructor.constructNfaForCharacterSet(pair);
        //nfaMachineConstructor.term(pair);
        //nfaMachineConstructor.constructStarClosure(pair);
        //nfaMachineConstructor.constructPlusClosure(pair);
        //nfaMachineConstructor.constructOptionsClosure(pair);
        //nfaMachineConstructor.factor(pair);
        //nfaMachineConstructor.cat_expr(pair);
        nfaMachineConstructor.expr(pair);

        if (STA_ANCHOR) {
            let startNode = new Nfa();
            let temp;
            startNode.setStateNum(513);
            startNode.setEdge('\n'.charCodeAt());
            temp = pair.startNode;
            pair.startNode = startNode;
            startNode.next = temp;
        }
        nfaPrinter.printNfa(pair.startNode);
    }

    this.main = function (){
        let constructor = new ThompsonConstruction('0{2，4}0');
        runLexerExample('0{2,4}0');
        runNfaMachineConstructorExample();
        //runNfaIntepretorExample();
        runNfaGreedMatchingExample();
    }
};

module.exports = ThompsonConstruction;