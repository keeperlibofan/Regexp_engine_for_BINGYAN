var ErrorHandler = {
    Exception : {
        E_MEM: "Not enough memory for NFA", //内存不足
        E_BADEXPR: "Malformed regular expression", //正则表达式错误
        E_PAREN: "Missing close parenthesis",  //括号不匹配
        E_LENGTH: "Too many regular expression or expression too long", //要解析的正则表达式过多
        E_BRACKET: "Missing [ in character class", //字符集类没有以 [ 开头
        E_BOL: "^ must be at the start of expression or after [", //^必须在表达式的开头
        E_CLOSE: "+ ? or * must follow an expression or subexpression", //* ? + 后面必须跟着表达式
        E_NEWLINE: "Newline in quoted string, use \\n to get newline into expression", //双引号中不能保护换行符
        E_BADMAC: "Missing ) in macro expansion", //没有匹配的 }
        E_NOMAC: "Missing ) in macro expansion", //给定的宏表达式不存在
        E_MACDEPTH: "Macro expansions nested too deeply" //宏表达式的间套太深
    },
    parseErr: function (type) {
        throw new Error(ErrorHandler.Exception[type])
    }
}

module.exports = ErrorHandler;