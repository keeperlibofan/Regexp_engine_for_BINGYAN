const Nfa = require('./Nfa')

//@params start Nfa 起始节点
//@params input
var NfaIntepretor = function(start, input) {
    //constructor
    this.start = start;
    this.input = input;

    let debug = true;

    //@params input Set<Nfa>
    function e_closure (input) {
        /*
         * 计算input集合中nfa节点所对应的ε闭包，
         * 并将闭包的节点加入到input中
         */
        let res = "";
        if (debug) {
            res += ("ε-Closure( " + strFromNfaSet(input) + " ) = ")
        }

        let nfaStack = [];
        if (input === null || input.length === 0) {
            return null;
        }

        input.forEach((set) => {
            nfaStack.push(set);
        });

        while (nfaStack.length >= 1) {
            let p = nfaStack.pop();

            if (p.next !== null && p.getEdge() === Nfa.EPSILON) {
                if (!input.has(p.next))  {
                    let next = p.next; //useless

                    nfaStack.push(p.next);
                    input.add(p.next);
                }
            }

            if (p.next2 !== null && p.getEdge() === Nfa.EPSILON) {
                if (!input.has(p.next2)) {
                    let next = p.next2; //useless

                    nfaStack.push(p.next2);
                    input.add(p.next2)
                }
            }
        }

        if (input !== null && debug) {
            res += ("{ " + strFromNfaSet(input) + " }");
            console.log(res)
        }

        return input;

    }

    //@params input Set<Nfa>
    function strFromNfaSet(input) {
        let s = "";
        let index = 1;
        let size = input.size;
        input.forEach((set) => {
            s += set.next().getStateNum();
            if (index < size) {
                s += ',';
            }
            index++;
        });
        return s;
    }

    this.move = move;
    //@params input Set<Nfa>
    function move(input, c) {
        let outSet = new Set();

        input.forEach((set) => {
            let p = set;

            let s = p.inputSet;
            let cb = c.charCodeAt();

            if (p.getEdge() === cb || (p.getEdge() === Nfa.CCL && p.inputSet.has(cb))) {

                outSet.add(p.next);
            }
        });
        let res = "";

        if (outSet !== null && debug) {
            res += ("move({ " + strFromNfaSet(input) + " }, '" + c + "')= ");
            res += ("{ " + strFromNfaSet(outSet) + " }");
            console.log(res);
        }

        return outSet;
    }

    this.intepretNfa = intepretNfa; //全匹配字符
    function intepretNfa(inputStr) {
        if (inputStr.length === 0) {
            throw Error("Invalid input string")
        }

        //读入要解读的inputStr
        let charIndex = 0;

        let next = new Set();
        next.add(start);
        next = e_closure(next);

        let current = new Set();
        let c = inputStr[charIndex];
        let partInputStr;
        let lastAccepted = false;

        for (charIndex = 0; charIndex < inputStr.length; charIndex++, c = inputStr[charIndex]) {
            current = move(next, c)

        }
    }

};

module.exports = NfaIntepretor;