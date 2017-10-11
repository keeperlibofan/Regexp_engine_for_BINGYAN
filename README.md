# Regexp_engine_for_BINGYAN

## Javascript version

***
### 使用手册
 + ThompsonConstruct.js文件为主文件，支持多条字符串同时解析，
 闭包变量regExprArr为解析后字符串存储的数组
 本正则引擎使用Nfa图构造法，由 3 个部分组成: 词法分析器，Nfa图构造器，Nfa解释器。
 
 + 1.最开始的限定符{}匹配实现。这一部分应该使用词法解析器lexer
 来完成设置一个Token类型叫做`QUA`,然后需要在NfaMachineConstuctor构建一个NfaPairDuplication函数,
 用来完整的复制以份NfaPair
 但是只实现了部分词法解析器可以解析限定符{}以及`卷括号`内的内容,而且解析{m,n}前面的字符
 不可以加括号
 
 + 2.宏替换部分输入的正则表达式可以进行宏替换，宏一般写在`卷括号`内部，
 也可以进行多成替换，直到表达式内部没有`卷括号`为止，所以宏替换和词法解析器版的
 限定符{}不可以同时使用，后续会完善这个`bug`
 + 3.NfaMachineConstructor用来构造Nfa图，其构造的过程分为几个步骤，`expr解析`，
 `cat_expr解析`，`factor解析`, `term解析`,自上而下的递归调用，其中term用来处理最简单
 的情况，遇到圆括号后会递归到expr中。
 
 
 ###源代码目录结构
 ```
 myRegex(dir)
    ├──ErrorHandler.js
    ├──Lexer.js
    ├──Nfa.js
    ├──NfaIntepretor.js
    ├──NfaPair.js
    ├──RegularExpressionHandler.js
    ├──ThompsonConstruction.js
    ├──MacroHandler.js
    ├──NfaMachineConstructor.js
    ├──NfaPrinter.js
    ├──NfaManager.js (管理nfa节点，构造nfa节点，和回收弃用的nfa节点)
    └──Debug.js
 
```

### 具体实现功能
 + 1.支持圆括号嵌套 eg: '((expr1)|(expr2))'
 + 2.支持宏替换预处理 eg: '{A}' => ([A-Z])
 + 3.支持[...]解析，同时支持[^...]解析 eg: '[a-zA-Z0-9_]'
 + 4.支持\s, \n, \b, \r, \n, \e等特殊字符匹配
 + 4.1 对本来有特殊意义的字符 \ 可以转义为普通字符 eg： \\0
 + 5.支持\w(匹配任何单个 "单词" 字符,大写W相反匹配), \d(匹配任意一个数字 (相当于类 [0-9])，大写D相反[^0-9])
 + 6.支持所有闭包限定符 +,?,*
 + 7.不完全匹配模式下支持贪婪匹配与非贪婪匹配
 + 8.支持 | (或) 符号
 + 9.支持 使用八进制或者十六进制表示单个字符 eg： '\\X033' => '3'
 + 10.支持 使用{n}, {n,} ,{n,m} 限定符，这个功能实现仍然有待完善
 + 11.支持 anchor ^
 
 ### 学习日记
 
 > 简书：http://www.jianshu.com/p/7129c41af11b
