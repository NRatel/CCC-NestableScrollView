Cocos Creator 中ScrollView嵌套的解决办法。


使用方法：
1.用NestableScrollView代替ScrollView组件，分别挂在需要嵌套的父子ScrollView上；
2.在父ScrollView的 m_InnerScrollView属性上拖上子ScrollView；
3.设定父子ScrollView的方向。(一般不同向, 若同向会都滑动)


TODO：
1.不打算解决多层嵌套的情况。比较复杂并且一般很难遇到这样的需求。
2.解决父ScrollView 中嵌套多个同层级的子ScrollView 的需求。

欢迎留言交流
或者QQ：646729772
