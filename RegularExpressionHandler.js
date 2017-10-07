const ErrorHandler = require('./ErrorHandler');

//@params input String
let RegularExpressionHandler = function(input, macroHandler) {
    this.input = input; //输入的字符串
    this.macroHandler = macroHandler;
    let inquoted = false;
    let charIndex = 0;
    let regularExprArr = [];


    this.getRegularExpressionCount = function() {
        return regularExprArr.length;
    };

    //@params index int
    this.getRegularExpression = function(index) {
        if (index < 0 || index >= regularExprArr.length) {
            return null;
        }

        return regularExprArr[index]
    };

    this.processRegularExprs = function() {
        preProcessExpr()
    };



    function preProcessExpr() {
        /*
		 * 对正则表达式进行预处理，将表达式中的宏进行替换，例如
		 * D*\.D 预处理后输出
		 * [0-9]*\.[0-9]
		 * 注意，宏是可以间套的，所以宏替换时要注意处理间套的情形
		 */
        input = input.trim(); //去除字符串左右两边的空格或空行

        let regularExpr = "";
        let c = ii_advance();
        while (c !== " " && c !== '\n' && c !== undefined) {
            if (c === '"') {
                //判断当前字符是否在双引号里
                inquoted = !inquoted;
            }

            if (!inquoted && c === '{') {
                let name = extracMacroNameFromInput();
                regularExpr += expandMacro(name)
            } else {
                regularExpr += c;
            }
            c = ii_advance()
        }
        regularExprArr.push(regularExpr)
    }

    //@params macroName String
    function expandMacro(macroName) {
        let macroContent = macroHandler.expandMacro(macroName);
        let begin = macroContent.indexOf('{');
        while (begin !== -1) {
            let end = macroContent.indexOf('}', begin);
            if (end === -1) {
                ErrorHandler.parseErr("E_BADMAC");
                return null;
            }

            let inquoted = checkInQuoted(macroContent, begin, end);

            if (inquoted === false) {
                macroName = macroContent.substring(begin + 1, end);
                let content = macroContent.substring(0, begin);
                content += macroHandler.expandMacro(macroName);
                content += macroContent.substring(end + 1, macroContent.length);
                macroContent = content;
                //如果宏替换后，替换的内容还有宏定义，那么继续替换，直到所有宏都替换完为止
                begin = macroContent.indexOf('{');
            }
            else {
                begin = macroContent.indexOf('{', end);
            }
        }
        return macroContent;
    }


    /*
     * @params macroContent String
     * @params curlyBracesBegin int
     * @params curlyBracesEnd int
     */
    function checkInQuoted(macroContent, curlyBracesBegin, curlyBracesEnd) {
        /*
		 * 先查找距离 { 最近的一个 双引号
		 * 然后查找第二个双引号
		 * 如果双括号{}在两个双引号之间
		 * 那么inquoted设置为 true
		 */

        let inquoted = false;
        let quoteBegin = macroContent.indexOf('"');
        let quoteEnd = -1;

        while (quoteBegin !== -1) {

            quoteEnd = macroContent.indexOf('"', quoteBegin + 1);
            if (quoteEnd === -1) {
                ErrorHandler.parseErr("E_BADMAC")
            }

            if (quoteBegin < curlyBracesBegin && quoteEnd > curlyBracesEnd) {
                inquoted = true;
            }

            else if (quoteBegin < curlyBracesBegin && curlyBracesEnd < quoteEnd){
                /*
                 * "{" ... }
                 * 大括号不匹配
                 */
                ErrorHandler.parseErr("E_BADMAC");
            }

            else if (quoteBegin > curlyBracesBegin && quoteEnd < curlyBracesEnd) {
                /*
                 * {...."}"
                 * 大括号不匹配
                 */
                ErrorHandler.parseErr("E_BADMAC");
            }

            quoteBegin = macroContent.indexOf('"', quoteEnd + 1)
        }
        return inquoted;
    }

    function ii_advance() {
        return input[charIndex++]
    }


    function extracMacroNameFromInput() {
        let name = "";
        let c = ii_advance();
        while (c !== '}' && c !== "\n") {
            name += c;
            c = ii_advance()
        }

        if (c === '}') {
            return name;
        } else {
            ErrorHandler.parseErr('E_BADMAC');
            return null;
        }
    }
};

module.exports = RegularExpressionHandler;
/*
class RegularExpressionHandler {
    constructor(input, macroHandler) {
        this.input = input
        this.macroHandler = macroHandler

        processRegularExprs();
    }
    processRegularExprs
}
*/