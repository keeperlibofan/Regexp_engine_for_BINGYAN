const Nfa = require('./Nfa')

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
        })
        return s;
    }

};

module.exports = NfaIntepretor;