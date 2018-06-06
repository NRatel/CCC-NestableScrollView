Cocos Creator(v1.9.1) 中ScrollView嵌套的解决办法。


使用方法：
1.用NestableScrollView_Outer和NestableScrollView_Inner代替ScrollView组件，分别挂在需要嵌套的父子ScrollView上；
2.在NestableScrollView_Outer的 m_InnerScrollViews 属性上设置子数量，并拖上NestableScrollView_Inner；
3.分别设定父子ScrollView的方向。(一般不同向, 若同向会都滑动)


注意：
1.不打算解决多层嵌套的情况。比较复杂并且一般很难遇到这样的需求。
2.嵌套深度和数量太多会影响效率。
3.由于重写了ScrollView，别忘了把content结点重新拖上去


-------------------------------------------------------------------------------
为了逻辑清晰高效，
新版本将原来的NestableScrollView拆为了NestableScrollView_Outer和NestableScrollView_Inner。
老版本已不推荐使用, 之后会删掉。

废弃版本使用方法：
1.用NestableScrollView代替ScrollView组件，分别挂在需要嵌套的父子ScrollView上；
2.在父ScrollView的 m_InnerScrollViews 属性上设置子数量，并拖上子ScrollView；
3.分别设定父子ScrollView的方向。(一般不同向, 若同向会都滑动)


欢迎留言交流
或者QQ：646729772
