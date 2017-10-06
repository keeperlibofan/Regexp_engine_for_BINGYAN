
let Nfa = function() {
    const ANCHOR = {
        NONE: 0,
        START: 1,
        END: 2,
        BOTH: 3
    };
    this.EPSILON = -1; //边对应的是ε
    this.CCL = -2; //边对应的是字符集
    this.EMPTY = -3; //该节点没有出去的边
    const ASCII_COUNT = 127;

    let edge; //记录转换边对应的输入，输入可以是空, ε，字符集(CCL),或空，也就是没有出去的边

    this.getEdge = function() {
        return edge
    };

    //@params type int
    this.setEdge = function(type) {
        return edge = type
    };


    this.inputSet = new Set(); //用来存储字符集类
    this.next = null; //跳转的下一个状态，可以是空
    this.next2 = null; //跳转的另一个状态，当状态含有两条ε边时，这个指针才有效
    let anchor; //对应的正则表达式是否开头含有^, 或结尾含有$,  或两种情况都有
    let stateNum; //节点编号
    let visited = false; //节点是否被访问过，用于节点打印

    this.setVisited = function() {
        visited = true
    };

    this.isVisited = function() {
        return visited
    };


    this.clearState = function() {
        this.inputSet.clear();
        this.next = this.next2 = null;
        anchor = ANCHOR.NONE;
        stateNum = -1;
    };
    //constructor

    this.clearState();

    //@params num int
    this.setStateNum = function(num) {
        stateNum = num
    };

    this.getStateNum = function() {
        return stateNum
    };

    //@params b Byte
    this.addToSet = function(b) {
        this.inputSet.add(b)
    };

    this.setComplement = function () {
        let newSet = new Set();
        for (let b = 0; b < ASCII_COUNT; b++) {
            if (!this.inputSet.has(b)) {
                newSet.add(b)
            }
        }

        this.inputSet = null;
        this.inputSet = newSet;
    };

    //@params anchor ANCHOR
    this.setAnchor = function(theAnchor) {
        anchor = theAnchor;
    };

    this.getAnchor = function() {
        return anchor
    };

    this.cloneNfa = function(nfa) {
        this.inputSet.clear();
        let _this = this;
        nfa.inputSet.forEach((set) => {
            _this.inputSet.add(set)
        });

        anchor = nfa.getAnchor();
        this.next = nfa.next;
        this.next2 = nfa.next2;
        edge = nfa.getEdge()
    }
};
Nfa.ANCHOR = {
    NONE: 0,
    START: 1,
    END: 2,
    BOTH: 3
};

Nfa.EPSILON = -1;
module.exports = Nfa;