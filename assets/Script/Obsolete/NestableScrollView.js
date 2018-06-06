//
// 可嵌套的ScrollView(已废弃！！！之后会删除)
// 开源地址：https://github.com/NRatel/CCC-NestableScrollView
// 挂在分别挂在内外层ScrollView上
//
let NestableScrollView = cc.Class({
    extends: cc.ScrollView,

    statics: {
        s_PlanDir: {            //计划方向, 本次滑动的目的方向。根据刚开始滑动的方向决定 1为横, -1为纵
            default: 0,
            visible: false,
        },
    },

    properties: {
        m_InnerScrollViews: [cc.ScrollView],    //挂内嵌的ScrollView
        m_HasInner: {                           //是否有内嵌的ScrollView((只有两层所以可以认为，有就为父, 否则为子),
            default: false,
            visible: false,
        },
    },

    onLoad: function () {
        NestableScrollView.s_PlanDir = 0;
        if (this.m_InnerScrollViews.length > 0) {
            this.m_HasInner = true;
        } else {
            this.m_HasInner = false;
        }
    },

    //检查实际与计划方向的一致性
    _isDifferentBetweenSettingAndPlan() {
        if (NestableScrollView.s_PlanDir == 0) {
            return false;
        }

        if (NestableScrollView.s_PlanDir == 1 && this.horizontal) {
            return false;
        }

        if (NestableScrollView.s_PlanDir == -1 && this.vertical) {
            return false;
        }

        return true;
    },

    //是否为子物体
    _isHisChild(child, undeterminedParent) {
        if (child == undeterminedParent) {
            return true;
        }
        if (child.parent != null) {
            if (child.parent == undeterminedParent) {
                return true;
            } else {
                return this._isHisChild(child.parent, undeterminedParent);
            }
        }
        return false;
    },

    //是否为嵌套滑动视图的子物体
    _findInnerSvOfTarget(target) {
        for (let i = 0; i < this.m_InnerScrollViews.length; i++) {
            let isHisChild = this._isHisChild(target, this.m_InnerScrollViews[i].node);
            if (isHisChild) {
                return this.m_InnerScrollViews[i];
            }
        }

        return null;
    },

    //#region 重写cc.ScrollView的方法
    _hasNestedViewGroup: function (event, captureListeners) {
        if (event.eventPhase !== cc.Event.CAPTURING_PHASE) return;

        //总是处理传递来的事件
        return false;
    },

    // touch event handler
    _onTouchBegan: function (event, captureListeners) {
        if (!this.enabledInHierarchy) return;
        if (this._hasNestedViewGroup(event, captureListeners)) return;

        //重置计划方向
        NestableScrollView.s_PlanDir = 0;

        var touch = event.touch;
        if (this.content) {
            this._handlePressLogic(touch);
        }
        this._touchMoved = false;
        this._stopPropagationIfTargetIsMe(event);
    },

    _onTouchMoved: function (event, captureListeners) {
        if (!this.enabledInHierarchy) return;

        var touch = event.touch;
        var deltaMove = cc.pSub(touch.getLocation(), touch.getStartLocation());
        if (this._hasNestedViewGroup(event, captureListeners)) return;

        //在嵌套滚动视图上滑动时, 设置开始时滑动的方向为计划方向
        let targetParentSv = this._findInnerSvOfTarget(event.target);
        if (this.m_HasInner && targetParentSv != null) {
            let contentSize = targetParentSv.content.getContentSize();
            let scrollViewSize = targetParentSv.node.getContentSize();
            if ((targetParentSv.vertical && (contentSize.height > scrollViewSize.height)) || (targetParentSv.horizontal && (contentSize.width > scrollViewSize.width))) {
                if (NestableScrollView.s_PlanDir == 0 && cc.pLength(deltaMove) > 7) {
                    NestableScrollView.s_PlanDir = Math.abs(deltaMove.x) > Math.abs(deltaMove.y) ? 1 : -1;
                }
            }
        }

        if (this.content) {
            //按计划方向确定是否处理父子ScrollView的移动逻辑
            //这块注意不能直接return掉而是让其继续走下去, 
            //否则 下边的 event.target.dispatchEvent(cancelEvent) 会有报错。
            //原因是 取消子物体事件只能在 首先截获事件的ScrollView中进行(原因不明)。
            if (!this._isDifferentBetweenSettingAndPlan()) {
                this._handleMoveLogic(touch);
            }
        }

        if (!this.cancelInnerEvents) {
            return;
        }

        //保证 只在首次截获事件的ScrollView中取消子物体事件
        //(脚本运行在父ScrollView上 && 事件目标不在嵌套的子ScrollView上) || (脚本运行在子ScrollView的)
        if ((this.m_HasInner && targetParentSv == null) || (!this.m_HasInner)) {
            if (cc.pLength(deltaMove) > 7) {
                if (!this._touchMoved && event.target !== this.node) {
                    var cancelEvent = new cc.Event.EventTouch(event.getTouches(), event.bubbles);
                    cancelEvent.type = cc.Node.EventType.TOUCH_CANCEL;
                    cancelEvent.touch = event.touch;
                    cancelEvent.simulate = true;
                    event.target.dispatchEvent(cancelEvent);
                    this._touchMoved = true;
                }
            }
            this._stopPropagationIfTargetIsMe(event);
        }
    },
    //#endregion
});
