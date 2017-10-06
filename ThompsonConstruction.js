const Lexer = require('./Lexer');
const RegularExpressionHandler = require('./RegularExpressionHandler');
const MacroHandler = require('./MacroHandler');

var ThompsonConstruction = function() {
    var macroHandler = new MacroHandler();
    var regularExpr = new RegularExpressionHandler('{AD}|\\034', macroHandler);
    regularExpr.processRegularExprs(); //处理正则
    var lexer;
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
}

module.exports = ThompsonConstruction