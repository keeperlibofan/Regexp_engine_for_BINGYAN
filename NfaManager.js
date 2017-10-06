const Nfa = require('./Nfa')
const ErrorHandler = require('./ErrorHandler')

let NfaManager = function() {
    const NFA_MAX = 256;
    let nfaStatesArr = null;
    let nfaStack = null;
    let nextAlloc = 0; //nfa数组下标
    let nfaStates = 0; //分配的nfa编号

    //constructor
    nfaStatesArr = [];
    for (let i = 0; i < NFA_MAX; i++) {
        nfaStatesArr[i] = new Nfa();
    }

    nfaStack = [];

    if (nfaStatesArr === null || nfaStack === null) {
        ErrorHandler.parseErr('E_MEM');
    }

    this.newNfa = function() {
        //分配太多nfa内存不足够
        if (++nfaStates >= NFA_MAX) {
            ErrorHandler.parseErr('E_LENGTH');
        }
        let nfa = null;

        if (nfaStack.length > 0) {
            nfa = nfaStack.pop();
        }
        else { //如果没有就直接从nfa状态数组里提取
            nfa = nfaStatesArr[nextAlloc];
            nextAlloc++;
        }

        nfa.clearState();
        nfa.setStateNum(nfaStates);
        nfa.setEdge(nfa.EPSILON);

        return nfa;
    }

    //@params nfaDiscarded Nfa
    this.discardNfa = function(nfaDiscarded) {
        --nfaStates;
        nfaDiscarded.clearState();
        nfaStack.push(nfaDiscarded);
    }
};
module.exports = NfaManager