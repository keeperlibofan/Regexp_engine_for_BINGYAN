
//@params exprHandler RegularExpressionHandler
let Lexer = function(exprHandler) {
    const Token = {
        EOS: 0, //正则表达式末尾
        ANY: 1,     // . 通配符
        AT_BOL: 2,  //^ 开头匹配符
        AT_EOL: 3,  //$ 末尾匹配符
        CCL_END: 4,  //字符集类结尾括号 ]
        CCL_START: 5,  //字符集类开始括号 [
        CLOSE_CURLY: 6, // }
        CLOSE_PAREN: 7,  //)
        CLOSURE: 8,      //*
        DASH: 9,       // -
        END_OF_INPUT: 10,  //输入流结束
        L: 11,        //字符常量
        OPEN_CURLY: 12, // {
        OPEN_PAREN: 13, // (
        OPTIONAL: 14,  //?
        OR: 15,       // |
        PLUS_CLOSE: 16, //+
        ANY_CHAR: 17, // \\W
        REV_ANY_CHAR: 18, // \\W
        ANY_NUM: 19, // \\d
        REV_ANY_NUM: 20 // \\D
    };
    this.Token = Token;
    const ASCII_COUNT = 128;
    let tokenMap = new Map(); //Map是 ASCII码对应Token码，都是number类型
    let currentToken = Token.EOS;
    let exprCount = 0;
    let curExpr = '';
    let charIndex = 0;
    let inQuoted = false; //是否在双引号内部
    let sawEsc = false; //是否读取到转义符 /
    let lexeme; //lexeme 是字符的ASCII码

    initTokenMap();
    this.exprHandler = exprHandler;

    function initTokenMap() {
        for (let i = 0; i < ASCII_COUNT; i++) {
            tokenMap.set(i, Token.L)
        }

        tokenMap.set('.'.charCodeAt(), Token.ANY);
        tokenMap.set('^'.charCodeAt(), Token.AT_BOL);
        tokenMap.set('$'.charCodeAt(), Token.AT_EOL);
        tokenMap.set(']'.charCodeAt(), Token.CCL_END);
        tokenMap.set('['.charCodeAt(), Token.CCL_START);
        tokenMap.set('}'.charCodeAt(), Token.CLOSE_CURLY);
        tokenMap.set(')'.charCodeAt(), Token.CLOSE_PAREN);
        tokenMap.set('*'.charCodeAt(), Token.CLOSURE);
        tokenMap.set('-'.charCodeAt(), Token.DASH);
        tokenMap.set('{'.charCodeAt(), Token.OPEN_CURLY);
        tokenMap.set('('.charCodeAt(), Token.OPEN_PAREN);
        tokenMap.set('?'.charCodeAt(), Token.OPTIONAL);
        tokenMap.set('|'.charCodeAt(), Token.OR);
        tokenMap.set('+'.charCodeAt(), Token.PLUS_CLOSE);
        tokenMap.set(129, Token.ANY_CHAR); //为 \\w 准备的特殊位置
        tokenMap.set(130, Token.REV_ANY_CHAR); //为 \\W 准备的特殊位置
        tokenMap.set(131, Token.ANY_NUM); //为 \\为 \\d 准备的特殊位置
        tokenMap.set(132, Token.REV_ANY_NUM); //为 \\D 准备的特殊位置
    }

    this.getCurrentToken = function() {
        return currentToken
    };
    //@params t Token
    this.MatchToken = function(t) {
        return currentToken === t;
    };

    this.getLexeme = function() {
        return lexeme
    };

    this.getCurExp = function() {
        return curExpr;
    };

    this.advance = function() {
        if (currentToken === Token.EOS) {
            //一个正则表达式解析结束后读入下一个表达式
            if (exprCount >= exprHandler.getRegularExpressionCount()) {
                //所有正则表达式都解析完毕
                currentToken = Token.END_OF_INPUT;
                return currentToken;
            } else {
                curExpr = exprHandler.getRegularExpression(exprCount)
                exprCount++;
            }
        }

        if (charIndex >= curExpr.length) {
            currentToken = Token.EOS;
            charIndex = 0;
            return currentToken;
        }

        if (curExpr.charAt(charIndex) === '"') {
            inQuoted = !inQuoted;
            charIndex++
        }

        sawEsc = (curExpr.charAt(charIndex) === '\\');
        if (sawEsc && curExpr.charAt(charIndex + 1)!== '"' &&!inQuoted) {
            lexeme = handleEsc()

        } else if (sawEsc && curExpr.charAt(charIndex + 1) === '"') {
            charIndex += 2;
            lexeme = '"'.charCodeAt();
        } else {
            lexeme = curExpr.charAt(charIndex).charCodeAt();
            charIndex++;
        }

        currentToken = (inQuoted || sawEsc) ? Token.L : tokenMap.get(lexeme);
        if (lexeme > 128) {
            currentToken = tokenMap.get(lexeme);
        }
        return currentToken;
    };


    function handleEsc() {
        /*当转移符 \ 存在时，它必须与跟在它后面的字符或字符串一起解读
    	 *我们处理的转义字符有以下几种形式
    	 * \b backspace
    	 * \f formfeed
    	 * \n newline
    	 * \r carriage return 回车
    	 * \s space 空格
    	 * \t tab
    	 * \e ASCII ESC ('\033')
    	 * \DDD 3位八进制数
    	 * \xDDD 3位十六进制数
    	 * \^C C是任何字符， 例如^A, ^B 在Ascii 表中都有对应的特殊含义
    	 * \w匹配所有字符 相当于[a-zA-Z_]
         * 冰岩要求 实现\w
    	 */

        let rval = 0;
        let exprToUpper = curExpr.toUpperCase();
        charIndex++; //越过 \
        switch (exprToUpper.charAt(charIndex)) {
            case '\0':
                rval = '\\';
                break;
            case 'B':
                rval = '\b';
                break;
            case 'F':
                rval = '\f';
                break;
            case 'N':
                rval = '\n';
                break;
            case 'R':
                rval = '\r';
                break;
            case 'S':
                rval = '\s';
                break;
            case 'T':
                rval = '\t';
                break;
            case 'E':
                rval = '\033';
                break;
            case 'W':
                if (curExpr[charIndex] === 'w') {
                    rval = 129;
                } else {
                    rval = 130;
                }
                break;
            case 'D':
                if (curExpr[charIndex] === 'd') {
                    rval = 131;
                } else {
                    rval = 132;
                }
                break;
            case '^':
                charIndex++;
                /*
                 * 因此当遇到^后面跟在一个字母时，表示读入的是控制字符
                 * ^@ 在ASCII 表中的数值为0，^A 为1, 字符@在ASCII 表中数值为64， 字符A在ASCII表中数值为65
                 * 'A' - '@' 等于1 就对应 ^A 在 ASCII 表中的位置
                 * 具体可参看注释给出的ASCII 图
                 *
                 */
                rval = curExpr.charAt(charIndex).charCodeAt() - '@'.charCodeAt();
                break;
            case 'X':
                /*
                 * \X 表示后面跟着的三个字符表示八进制或十六进制数
                 */
                charIndex++; //越过 X
                if (isHexDigit(curExpr.charAt(charIndex))) {
                    rval = hex2Bin(curExpr.charAt(charIndex)); //返回一个数字
                    charIndex++;
                }

                if (isHexDigit(curExpr.charAt(charIndex))) {
                    rval <<= 4;
                    rval |= hex2Bin(curExpr.charAt(charIndex));
                    charIndex++;
                }

                if (isHexDigit(curExpr.charAt(charIndex))) {
                    rval <<= 4;
                    rval |= hex2Bin(curExpr.charAt(charIndex))
                    charIndex++;
                }
                charIndex--; //由于在函数底部会对charIndex++ 所以这里先 --
                break;

            default:
                if (!isOctDigit(curExpr.charAt(charIndex))) {
                    rval = curExpr.charAt(charIndex);
                }
                else {
                    charIndex++;
                    rval = oct2Bin(curExpr.charAt(charIndex));
                    charIndex++;
                    if (isOctDigit(curExpr.charAt(charIndex))) {
                        rval <<= 3;
                        rval |= oct2Bin(curExpr.charAt(charIndex));
                        charIndex++;
                    }
                    if (isOctDigit(curExpr.charAt(charIndex))) {
                        rval <<= 3;
                        rval |= oct2Bin(curExpr.charAt(charIndex));
                        charIndex++;
                    }

                    charIndex--; ////由于在函数底部会对charIndex++ 所以这里先 --
                }

        }

        charIndex++;
        if (typeof rval === 'string') {
            return rval.charCodeAt();
        } else if (typeof  rval === 'number') {
            return rval;
        }

        throw new Error('real value error')
    }

    function oct2Bin(c) {
        /*
    	 * 将字符c 转换为对应的八进制数
    	 * 字符c 必须是合法的八进制字符: 01234567
    	 */
        return (c.charCodeAt() - '0'.charCodeAt()) & 0x7;
    }

    //@params c char
    function isOctDigit(c) {
        return ('0'.charCodeAt() <= c.charCodeAt() && c.charCodeAt() <= '7'.charCodeAt());
    }

    function hex2Bin(c) {
        /*
    	 * 将十六进制数对应的字符转换为对应的数值，例如
    	 * A 转换为10， B转换为11
    	 * 字符c 必须满足十六进制字符： 0123456789ABCDEF
    	 */
        return (isDigit(c) ? (c.charCodeAt() - '0'.charCodeAt()) : (c.toUpperCase().charCodeAt() - 'A'.charCodeAt() + 10)) & 0xf;
    }

    //@params c char
    function isHexDigit(c) {
        return (isDigit(c) || ('a'.charCodeAt() <= c.charCodeAt() && c.charCodeAt() <= 'f'.charCodeAt()) || ('A'.charCodeAt() <= c.charCodeAt() && c.charCodeAt() <= 'F'.charCodeAt()))
    }

    function isDigit(c) {
        return c.charCodeAt() >= '0'.charCodeAt() && c.charCodeAt() <= '9'.charCodeAt()
    }

    function isAlpha(c) {
        let charCode = c.charCodeAt()
        return (charCode >= 'a'.charCodeAt() && charCode <= 'z'.charCodeAt()) || (charCode >= 'A' && charCode <= 'Z'.charCodeAt());
    }
};

module.exports = Lexer;