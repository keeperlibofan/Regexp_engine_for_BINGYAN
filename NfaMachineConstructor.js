const NfaManager = require('./NfaManager');
const ErrorHandler = require('./ErrorHandler');
const Nfa = require('./Nfa');
const NfaPair = require('./NfaPair');

let NfaMachineConstructor = function (lexer) {
    let nfaManager = null;
    let toolNfa = new Nfa(); //tool nfa

    //constructor
    this.lexer = lexer;
    nfaManager = new NfaManager();

    while (lexer.MatchToken(lexer.Token.EOS)) {
        lexer.advance();
    }

    //@params pairOut NfaPair
    this.factor = factor;

    function factor (pairOut) {

        term(pairOut);

        let handled = false;

        handled = constructStarClosure(pairOut);
        if (!handled) {
            handled = constructPlusClosure(pairOut);
        }
        if (!handled) {
            handled = constructOptionsClosure(pairOut);
        }
        if (!handled) {
            handled = constructQualifierClosure(pairOut); //inStack
        }

    }

    //@params pairOut NfaPair
    this.expr = expr;

    function expr (pairOut) {
        /*
    	 * expr 由一个或多个cat_expr 之间进行 OR 形成
    	 * 如果表达式只有一个cat_expr 那么expr 就等价于cat_expr
    	 * 如果表达式由多个cat_expr做或连接构成那么 expr-> cat_expr | cat_expr | ....
    	 * 由此得到expr的语法描述为:
    	 * expr -> expr OR cat_expr
    	 *         | cat_expr
    	 *
    	 */
        cat_expr(pairOut);
        let localPair = new NfaPair()
        while (lexer.MatchToken(lexer.Token.OR)) {
            lexer.advance();
            cat_expr(localPair);

            //形成 或 结构
            let startNode = nfaManager.newNfa();
            startNode.next2 = localPair.startNode;
            startNode.next = pairOut.startNode;
            pairOut.startNode = startNode;

            let endNode = nfaManager.newNfa();
            pairOut.endNode.next = endNode;
            localPair.endNode.next = endNode;
            pairOut.endNode = endNode;
        }
    }
    
    this.cat_expr = cat_expr;

    function cat_expr(pairOut) {
        /*
    	 * cat_expr -> factor factor .....
    	 * 由于多个factor 前后结合就是一个cat_expr所以
    	 * cat_expr-> factor cat_expr
    	 */

        if (first_in_cat(lexer.getCurrentToken())) {
            factor(pairOut);
        }

        let c = lexer.getLexeme();
        if (c > 128) {
            factor(pairOut)
        }
        while (first_in_cat(lexer.getCurrentToken())) {
            let pairLocal = new NfaPair();
            factor(pairLocal);

            pairOut.endNode.next = pairLocal.startNode;

            pairOut.endNode = pairLocal.endNode;
        }
    }



    //@retVal boolean
    //@params tok lexer.Token
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
                //*, +, ? 这几个符号应该放在表达式的末尾
                ErrorHandler.parseErr('E_CLOSE');
                return false;
            case lexer.Token.CCL_END:
                //表达式不应该以]开头
                ErrorHandler.parseErr('E_BRACKET')
                return false;
            case lexer.Token.AT_BOL:
                //^必须在表达式的最开始
                ErrorHandler.parseErr('E_BOL');
                return false;

        }
        return true;
    }


    function constructQualifierClosure(pairOut) {
        /*
         * term{n,m} | {n,} | {n}
         */
        let start, end;
        if (!lexer.MatchToken(lexer.Token.QUA)) {
            return false;
        }

        start = nfaManager.newNfa();
        end = nfaManager.newNfa();

        let min = lexer.getMin();
        let max = lexer.getMax();


    }

    function constructOptionsClosure(pairOut) {
        /*
    	 * term?
    	 */
        let start, end;

        if (!lexer.MatchToken(lexer.Token.OPTIONAL)) {
            return false;
        }

        start = nfaManager.newNfa();
        end = nfaManager.newNfa();

        start.next = pairOut.startNode;
        pairOut.endNode.next = end;

        start.next2 = end;

        pairOut.startNode = start;
        pairOut.endNode = end;

        lexer.advance();

        return true;
    }

    function constructPlusClosure(pairOut) {
        /*
    	 * term+
    	 */
        let start, end;

        if (!lexer.MatchToken(lexer.Token.PLUS_CLOSE)) {
            return false;
        }

        start = nfaManager.newNfa();
        end = nfaManager.newNfa();

        start.next = pairOut.startNode;
        pairOut.endNode.next2 = end;
        pairOut.endNode.next = pairOut.startNode;

        pairOut.startNode = start;
        pairOut.endNode = end;

        lexer.advance();
        return true;
    }

    function constructStarClosure(pairOut) {
        /*
    	 * term*
    	 */
        let start, end;

        if (!lexer.MatchToken(lexer.Token.CLOSURE)) {
            return false;
        }

        start = nfaManager.newNfa();
        end = nfaManager.newNfa();

        start.next = pairOut.startNode;
        pairOut.endNode.next = pairOut.startNode;

        start.next2 = end;
        pairOut.endNode.next2 = end;

        pairOut.startNode = start;
        pairOut.endNode = end;

        lexer.advance();

        return true;
    }

    //@params pairOut NfaPair
    this.term = term;
    function term (pairOut) {
        /*
         * term ->  character | [...] | [^...] | [character-charcter] | . | (expr) | \\w
         * term是解析的最小单位，可以解析括号，还可以解析\\w
         */
        let handled = constructExprInParen(pairOut);
        if (!handled) {
            handled = constructNfaForSingleCharacter(pairOut);
        }
        if (!handled) {
            handled = constructNfaForDot(pairOut);
        }
        if (!handled) {
            constructNfaForCharacterSet(pairOut);
        }
        if (!handled) {
            constructNfaForANY_CHAR(pairOut);
        }
        if (!handled) {
            constructNfaForANY_NUM(pairOut);
        }

    }

    //@params pairOut NfaPair
    function constructExprInParen(pairOut) {
        if (lexer.MatchToken(lexer.Token.OPEN_PAREN)) {
            lexer.advance();
            expr(pairOut);
            if (lexer.MatchToken(lexer.Token.CLOSE_PAREN)) {
                lexer.advance()
            } else {
                ErrorHandler.parseErr('E_PAREN')
            }

            return true;
        }
        return false;
    }

    this.constructNfaForSingleCharacter = constructNfaForSingleCharacter
    function constructNfaForSingleCharacter(pairOut) {
        if (!lexer.MatchToken(lexer.Token.L)) {
            return false;
        }

        let start = null;
        start = pairOut.startNode = nfaManager.newNfa();
        pairOut.endNode = pairOut.startNode.next = nfaManager.newNfa();

        start.setEdge(lexer.getLexeme());

        lexer.advance();

        return true;
    }

    function constructNfaForCharacterSet(pairOut) {
        if (!lexer.MatchToken(lexer.Token.CCL_START)) {
            return false;
        }

        lexer.advance();
        let negative = false;

        if (lexer.MatchToken(lexer.Token.AT_BOL)) {
            negative = true;
        }

        let start = null;
        start = pairOut.startNode = nfaManager.newNfa();
        pairOut.endNode = pairOut.startNode.next = nfaManager.newNfa();
        start.setEdge(toolNfa.CCL);

        if (!lexer.MatchToken(lexer.Token.CCL_END)) {
            dodash(start.inputSet);
        }

        if (!lexer.MatchToken(lexer.Token.CCL_END)) {
            ErrorHandler.parseErr('E_BADEXPR');
        }

        if (negative) {
            start.setComplement();
        }

        lexer.advance();

        return true;
    }

    function constructNfaForANY_NUM(pairOut) {
        if (!lexer.MatchToken(lexer.Token.ANY_NUM) && !lexer.MatchToken(lexer.Token.REV_ANY_NUM)) {
            return false;
        }

        let start = null;
        start = pairOut.startNode = nfaManager.newNfa();
        pairOut.endNode = pairOut.startNode.next = nfaManager.newNfa()

        start.setEdge(toolNfa.CCL);
        //把所有的数字添加到Nfa节点中来
        for (let i = '0'.charCodeAt(); i <= "9".charCodeAt(); i++) {
            start.addToSet(i);
        }
        if (lexer.MatchToken(lexer.Token.REV_ANY_NUM)) {
            start.setComplement();
        }

        lexer.advance();

        return true;
    }

    function constructNfaForANY_CHAR(pairOut) {
        if (!lexer.MatchToken(lexer.Token.ANY_CHAR) && !lexer.MatchToken(lexer.Token.REV_ANY_CHAR)) {
            return false;
        }

        let start = null;
        start = pairOut.startNode = nfaManager.newNfa();
        pairOut.endNode = pairOut.startNode.next = nfaManager.newNfa();

        start.setEdge(toolNfa.CCL);
        //先把所有的小写字母全部添加进入
        for (let i = 'a'.charCodeAt(); i <= 'z'.charCodeAt(); i++) {
            start.addToSet(i);
        }
        //然后把大写字符添加进入
        for (let i = "A".charCodeAt(); i <= 'Z'.charCodeAt(); i++) {
            start.addToSet(i);
        }
        //最后把所有的数字添加进入
        for (let i = '0'.charCodeAt(); i <= "9".charCodeAt(); i++) {
            start.addToSet(i);
        }

        start.addToSet('_'.charCodeAt());

        if (lexer.MatchToken(lexer.Token.REV_ANY_CHAR)) {
            start.setComplement();
        }

        lexer.advance();

        return true;
    }

    //@params pairOut NfaPair
    function constructNfaForDot(pairOut) {
        if (!lexer.MatchToken(lexer.Token.ANY)) {
            return false;
        }

        let start = null;
        start = pairOut.startNode = nfaManager.newNfa();
        pairOut.endNode = pairOut.startNode.next = nfaManager.newNfa();

        start.setEdge(toolNfa.CCL);
        start.addToSet('\n'.charCodeAt());
        start.addToSet('\r'.charCodeAt());
        start.setComplement();

        lexer.advance();

        return true;
    }

    //@params set Set
    function dodash(set) {
        let first = 0;
        while ((!lexer.MatchToken(lexer.Token.EOS)) &&
        (!lexer.MatchToken(lexer.Token.CCL_END))) {

            if (!lexer.MatchToken(lexer.Token.DASH)) {
                first = lexer.getLexeme();
                set.add(first);
            }
            else {
                lexer.advance(); //越过 -
                for (; first <= lexer.getLexeme(); first++) {
                    set.add(first);
                }
            }

            lexer.advance();
        }

    }
};

module.exports = NfaMachineConstructor;