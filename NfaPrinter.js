let NfaPrinter = function() {
    const ASCII_NUM = 128;
    let start = true;

    //@params set Set
    function printCCL(set) {
        let res = "[ ";
        for (let i = 0; i < ASCII_NUM; i++) {
            if (set.has(i)) {
                if (i < ' '.charCodeAt()) {
                    res += ("^" + String.fromCharCode(i + '@'.charCodeAt()));
                }
                else {
                    res += String.fromCharCode(i);
                }
            }
        }
        res += ' ]';
        return res;
    }

    //@params startNfa Nfa
    this.printNfa = function(startNfa) {
        if (startNfa === null || startNfa.isVisited()) {
            return 0;
        }

        if (start) {
            console.log("--------NFA--------");
        }

        startNfa.setVisited();

        printNfaNode(startNfa);

        let res = "";
        if (start) {
            res += "  (START STATE)";
            start = false;
        }

        console.log(res);

        //递归到子节点
        this.printNfa(startNfa.next);
        this.printNfa(startNfa.next2);
    };

    //@params node Nfa
    function printNfaNode(node) {
        if (node.next === null) {
            console.log('TERMINAL')
        }
        else {
            let res = '';
            res += ("NFA state: " + node.getStateNum());
            res += ("--> " + node.next.getStateNum());
            if (node.next2 !== null) {
                res += (" " + node.next2.getStateNum())
            }
            res += " on:";
            switch (node.getEdge()) {
                case node.CCL:
                    res += printCCL(node.inputSet);
                    break;
                case node.EPSILON:
                    res += 'EPSILON';
                    break;
                default:
                    res += String.fromCharCode(node.getEdge());
                    break;
            }
            console.log(res)
        }
    }
};


module.exports = NfaPrinter;