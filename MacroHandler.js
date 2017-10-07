var ErrorHandler = require('./ErrorHandler')

var MacroHandler = function() {
    /*
    * 宏定义如下
    * 宏名称 <空格>  宏内容 [<空格>]
    */

    this.macroMap = new Map();
    newMacro(this.macroMap);


    function newMacro(macroMap) {
        macroMap.set("D", "[0-9]");
        macroMap.set("a", "[a-z]");
        macroMap.set("A", "[A-Z]");
        macroMap.set("AD", "{A}|{D}");
        macroMap.set("aD", "{a}|{D}")
    }

    this.expandMacro = function(macroName) {
        if (this.macroMap.get(macroName) === undefined) { //如果不存在当前这个key
            ErrorHandler.parseErr("E_NOMAC")
        } else {
            return "(" + this.macroMap.get(macroName) + ")";
        }
        return "ERROR" //走到这里就是bug
    };

    //未完成函数
    this.printMacs = function() {
        if (this.macroMap.size === 0) { //哈希表是空的
            console.log('There are no macros')
        } else {

        }
    }
};


module.exports = MacroHandler;

