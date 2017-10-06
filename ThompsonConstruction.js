const Lexer = require('./Lexer');
const RegularExpressionHandler = require('./RegularExpressionHandler');
const MacroHandler = require('./MacroHandler');
const NfaMachineConstructor = require('./NfaMachineConstructor')
const NfaPair = require("./NfaPair");
const NfaPrinter = require('./NfaPrinter')

var ThompsonConstruction = function() {
    let macroHandler = new MacroHandler();

    let regularExpr = new RegularExpressionHandler('({AD}|\\034)[a-f]*\\:', macroHandler); //测试用例

    let nfaPrinter = new NfaPrinter()
    regularExpr.processRegularExprs(); //处理正则
    let lexer;
    let pair = new NfaPair();
    let nfaMachineConstructor = null;
    this.runLexerExample = function() {
        lexer = new Lexer(regularExpr);
        var exprCount = 0;
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
        var s = "";
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

    //Nfa自动机构造测试
    function runNfaMachineConstructorExample() {
        lexer = new Lexer(regularExpr);
        nfaMachineConstructor = new NfaMachineConstructor(lexer);

        nfaMachineConstructor.constructNfaForSingleCharacter(pair);
        //nfaMachineConstructor.constructNfaForDot(pair);
        //nfaMachineConstructor.constructNfaForCharacterSetWithoutNegative(pair);
        //nfaMachineConstructor.constructNfaForCharacterSet(pair);
        //nfaMachineConstructor.term(pair);
        //nfaMachineConstructor.constructStarClosure(pair);
        //nfaMachineConstructor.constructPlusClosure(pair);
        //nfaMachineConstructor.constructOptionsClosure(pair);
        //nfaMachineConstructor.factor(pair);
        //nfaMachineConstructor.cat_expr(pair);

        nfaPrinter.printNfa(pair.startNode)
    }

    this.main = function (){
        let constructor = new ThompsonConstruction();
        runNfaMachineConstructorExample();

    }
}

module.exports = ThompsonConstruction