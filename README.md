# Regexp_engine_for_BINGYAN

##Javascript version

***
###使用手册
 ThompsonConstruct.js文件为主文件，ThompsonConstruct.main为主函数
 支持多条字符串同时解析，闭包变量regExprArr为解析后字符串存储的数组
 
###具体实现功能
 + 1.支持圆括号嵌套 eg: '((expr1)|(expr2))'
 + 2.支持宏替换预处理 eg: '{A}' => ([A-Z])
 + 3.支持[]解析 eg: '[a-zA-Z0-9_]'
 + 4.支持\s, \n, \b, \r, \n, \e等特殊字符匹配
 + 5.支持\w(匹配任何单个 "单词" 字符,), \d()