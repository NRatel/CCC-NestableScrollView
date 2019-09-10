Cocos Creator 中ScrollView嵌套的解决办法。
 
现行支持版本：Cocos Creator v2.0+。
历史版本已放入分支：Cocos Creator v1.9+。
 
演示：  
![Image](https://github.com/NRatel/CCC-NestableScrollView/tree/master/demonstration/demonstration.gif)

使用方法：
1.用NestableScrollView_Outer和NestableScrollView_Inner代替ScrollView组件，分别挂在需要嵌套的父子ScrollView上；
2.在NestableScrollView_Outer的 m_InnerScrollViews 属性上设置子数量，并拖上NestableScrollView_Inner；
3.分别设定父子ScrollView的方向。(一般不同向, 若同向会都滑动)

注意：
1.不打算解决多层嵌套的情况。比较复杂并且一般很难遇到这样的需求。
2.嵌套深度和数量太多会影响效率。
3.由于重写了ScrollView，别忘了把content结点重新拖上去。
4.代替ScrollView组件不会影响原项目有getComponent(cc.ScrollView)的地方，因为getComponent可以传父类取到子类。
5.很多人私信问我PageView和ScrollView怎么嵌套，最简单的办法就是基于两个ScrollView嵌套，附加自己另写的Page逻辑上去。（如果直接继承PageView并重写其部分方法，会让检视面板变乱，就要重写部分编辑器逻辑，比较麻烦）

-------------------------------------------------------------------------------

为了逻辑清晰高效，
现在的版本将原来的NestableScrollView拆为了NestableScrollView_Outer和NestableScrollView_Inner。
老版本(在分支中，最新版本已移除)已不推荐使用。
