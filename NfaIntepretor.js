const Nfa = require('./Nfa');

//@params start Nfa 起始节点
//@params input 输入系统
let NfaIntepretor = function(start, input) {
    //constructor
    this.start = start;
    if (input !== undefined) {
        this.input = input;
    }
    let debug = true;


    //贪婪模式 Greed
    //@params inputStr string
    //@retVal 匹配到了返回 贪婪匹配值 未匹配到返回null
    function partIntepretNfaG(inputStr, index) {
        if (typeof inputStr !== 'string' || inputStr.length === 0) {
            throw new Error('Invalid input string')
        }
        let collectCharsCurMax = null; //寄存的当前长度最长匹配的字符串
        let collectCharsforMore = ""; //找到贪婪匹配更多的字符串
        let next = new Set();

        next.add(start);
        next = e_closure(next);
        let current = new Set();
        if (next.size === 0 || next === null) {
            return null;
        }
        for (let i = index, c = inputStr[i]; i < inputStr.length; i++, c = inputStr[i]) {
            current = move(next, c);
            next = e_closure(current);

            if (current.size === 0) { //如果解析到一半发现所有的状态点都在move后死掉了
                if (collectCharsCurMax === null) {
                    return null;
                }
                return collectCharsCurMax;
            }
            collectCharsforMore += c;
            if (hasAcceptState(next)) {
                collectCharsCurMax = collectCharsforMore;
            }
        }

        if (collectCharsCurMax !== null) {
            return collectCharsCurMax;
        }
        return null;
    }

    this.stringController = stringController;
    //@params inputStr string
    function stringController(inputStr, ifGreed) {
        for (let i = 0; i < inputStr.length; i++) {

            let res = ifGreed ? partIntepretNfaG(inputStr, i) : partIntepretNfaUG(inputStr, i);

            if (res !== null) {
                return res;
            }
        }
        return null;
    }
    //非贪婪匹配 UnGreed
    //@params inputStr string
    //@params index int 当前匹配的开始点
    function partIntepretNfaUG(inputStr, index) {
        if (typeof inputStr !== 'string' || inputStr.length === 0) {
            throw new Error('Invalid input string')
        }
        let collectChars = "";
        let next = new Set();
        next.add(start);
        next = e_closure(next);
        let current = new Set();
        if (hasAcceptState(next)) {
            return collectChars;
        }
        for (let i = index, c = inputStr[i]; i < inputStr.length; i++, c = inputStr[i]) {
            current = move(next, c);
            next = e_closure(current);
            if (current.size === 0) {
                return null;
            }
            collectChars += c;
            if (hasAcceptState(next)) {
                return collectChars;
            }
        }

    }

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
        input.forEach((set) => { //set是一个nfa对象
            s += set.getStateNum();
            if (index < size) {
                s += ',';
            }
            index++;
        });
        return s;
    }

    this.move = move;
    //@retVal Set<Nfa>
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

    this.intepretNfa = intepretNfa; //全匹配模式
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
        let partInputStr = "";
        let lastAccepted = false;

        for (charIndex = 0; charIndex < inputStr.length; charIndex++, c = inputStr[charIndex]) {
            current = move(next, c);
            next = e_closure(current);

            if (next !== null && (next.size > 0)) {
                if (hasAcceptState(next)) {
                    lastAccepted = true;
                }
            }else {
                break
            }
            partInputStr += c;
        }

        // if (lastAccepted) {
        //     console.log("The Nfa Machine can recognize string: " + inputStr);
        // } else {
        //     console.log("The Nfa Machine can't recognize string and stop at " + partInputStr);
        // }

        //如果匹配到最后一个字符则匹配成功，否则匹配失败
        return charIndex === inputStr.length
    }

    //@params input Set<Nfa>
    function hasAcceptState(input) {
        let isAccepted = false;
        if (input === null || input.size === 0) {
            return false;
        }

        let acceptedStatement = "Accept State: ";

        input.forEach((set) => {
            let p = set;
            if (p.next === null && p.next2 === null) {
                isAccepted = true;
                acceptedStatement += p.getStateNum() + " ";
            }
        });

        if (isAccepted) {
            console.log(acceptedStatement);
        }

        return isAccepted;
    }

};

module.exports = NfaIntepretor;