const NfaManager = require('./NfaManager');
const Nfa = require('./Nfa');
const NfaPair = require('./NfaPair');
const ErrorHandler = require('./ErrorHandler');

//lexer传入词法解析器
let Parser = function(lexer) {
    let nfaManager = null;

    //constructor
    nfaManager = new NfaManager();
    this.lexer = lexer;

    this.Machine = Machine;
    function Machine() {
        let start, p;
        p = start = nfaManager.newNfa();
        p.next = Rule();

        while (!lexer.MatchToken(lexer.Token.END_OF_INPUT)) {
            p.next2 = nfaManager.newNfa();
            p = p.next2;
            p.next = Rule(); //inStack
        }
    }

    function Rule() {
        /*
    	 *     rule  -->  expr EOS
    	 *                ^expr EOS
    	 *                expr$ EOS
    	 */

        let p, start = null, end = null;
        let pair = new NfaPair();

        let anchor = Nfa.ANCHOR.NONE;
        let anchorStart = false, anchorEnd = false;

        if (lexer.MatchToken(lexer.Token.AT_BOL)) {
            /*
    		 * 开头匹配，例如要匹配表达式^a
    		 * 那么输入的字符串必须要以字符a开头，并且a的前头只能跟着换行符
    		 */
            start = nfaManager.newNfa();
            start.setEdge('\n'.charCodeAt());
            anchor = Nfa.ANCHOR.START;
            lexer.advance();
            expr(pair); //inStack

        }
    }

    //@params pairOut NfaPair
    function expr(pairOut) {
        /*
    	 * expr -> expr OR cat_expr
    	 *         | cat_expr
    	 *  改进为:
    	 *
    	 *  expr-> cat_expr expr'
    	 *  expr' -> OR cat_expr expr' epsilon
    	 *
    	 *  上面更改后的语法可以用循环实现
    	 *  while (lexer.matchToken(Lexer.Token.OR)) {
    	 *      cat_expr();
    	 *      do the or
    	 *  }
    	 */

        cat_expr(pairOut); //inStack

        let e2_start = null, e2_end = null;
        let pairLocal = new NfaPair();
        let p;
        while (lexer.MatchToken(lexer.Token.OR)) {
            lexer.advance();
            cat_expr(pairLocal);
            e2_start = pairLocal.startNode;
            e2_end = pairLocal.endNode;

            p = nfaManager.newNfa();
            p.next2 = e2_start;
            p.next = pairOut.startNode;
            pairOut.startNode = p;

            p = nfaManager.newNfa();
            pairOut.endNode.next = p;
            e2_end.next = p;
            pairOut.endNode = p;
        }
    }

    function cat_expr(pairOut){
        /*
    	 * cat_expr -> cat_expr | factor
    	 *             factor
    	 *  改进为:
    	 *
    	 *  cat_expr -> factor cat_expr'
    	 *  cat_expr' -> | factor cat_expr'
    	 *               epsilon
    	 *
    	 */
        let e2_start, e2_end;
        let pairLocal = new NfaPair();

        if (first_in_cat(lexer.getCurrentToken())) {
            factor(pairOut);
        }

        while (first_in_cat(lexer.getCurrentToken())) {
            factor(pairLocal);
            e2_start = pairLocal.startNode;
            e2_end = pairLocal.endNode;


        }





    }

    //@params tok lexer.Token
    //@retVal boolean
    function first_in_cat(tok) {
        switch (tok) {
            //正确的表达式不会以 ) $ 开头,如果遇到EOS表示正则表达式解析完毕，那么就不应该执行该函数
            case lexer.Token.CLOSE_PAREN:
            case lexer.Token.AT_EOL:
            case lexer.Token.OR:
            case lexer.Token.EOS:
            case lexer.Token.ANY_CHAR:
            case lexer.Token.REV_ANY_CHAR:
                return false;
            case lexer.Token.CLOSURE:
            case lexer.Token.PLUS_CLOSE:
            case lexer.Token.OPTIONAL:
            case lexer.Token.QUA:
                //*, +, ? , {n,m}, {n}, {n,}这几个符号应该放在表达式的末尾
                ErrorHandler.parseErr('E_CLOSE');
                return false;
            case lexer.Token.CCL_END:
                //表达式不应该以]开头
                ErrorHandler.parseErr('E_BRACKET');
                return false;
            case lexer.Token.AT_BOL:
                //^必须在表达式的最开始
                ErrorHandler.parseErr('E_BOL');
                return false;
        }
        return true;
    }

};

module.exports = Parser;