//
// 可嵌套的ScrollView。ccc1.9.1上可用, 若之后新版本不可用, 请在github上联系我。
// 开源地址：https://github.com/NRatel/CCC-NestableScrollView
// 挂在嵌套外层ScrollView上
//
cc.Class({
    extends: cc.ScrollView,

    properties: {
        m_InnerScrollViews: [require("NestableScrollView_Inner")],    //挂内嵌的ScrollView
        m_PlanDir: {                                                  //计划方向, 本次滑动的目的方向。根据刚开始滑动的方向决定 0为不限制方向, 1为横, -1为纵
            default: null,
            visible: false,
        },
        m_ScrollingInnerSv: {                                         
            default: null,
            visible: false,
        },
    },

    onLoad: function () {
        this.m_PlanDir = null;
        this.m_InnerScrollViews.forEach(inner => {
            inner.setOuterScrollView(this);
        });
    },

    //是否为子物体
    //注意，这里递归, 如果child藏的太深, 可能影响效率。其实也还好，只是开始滑动时执行一次。
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

    //判断Target是否是InnerScrollView的子物体, 如果是，就返回这个InnerScrollView。
    //注意，这里遍历所有InnerScrollView, 如果InnerScrollView数量太多，可能影响效率。其实也还好，只是开始滑动时执行一次。
    _findScrollingInnerSv(target) {
        for (let i = 0; i < this.m_InnerScrollViews.length; i++) {
            let isHisChild = this._isHisChild(target, this.m_InnerScrollViews[i].node);
            if (isHisChild) {
                return this.m_InnerScrollViews[i];
            }
        }
        return null;
    },

    //检查实际与计划方向的一致性
    isDifferentBetweenSettingAndPlan(sv) {
        if (this.m_PlanDir == 0) {
            return false;
        }
        if (this.m_PlanDir == 1 && sv.horizontal) {
            return false;
        }
        if (this.m_PlanDir == -1 && sv.vertical) {
            return false;
        }
        return true;
    },

    //#region 重写cc.ScrollView的方法
    _hasNestedViewGroup: function (event, captureListeners) {
        if (event.eventPhase !== cc.Event.CAPTURING_PHASE) return;
        //不阻止out上onTouch事件执行。
        return false;
    },

    _onTouchBegan: function (event, captureListeners) {
        if (!this.enabledInHierarchy) return;
        if (this._hasNestedViewGroup(event, captureListeners)) return;

        //重置计划方向
        this.m_PlanDir = null;
        this.m_ScrollingInnerSv = null;

        var touch = event.touch;
        if (this.content) {
            this._handlePressLogic(touch);
        }
        this._touchMoved = false;
        this._stopPropagationIfTargetIsMe(event);
    },

    _onTouchMoved: function (event, captureListeners) {
        if (!this.enabledInHierarchy) return;
        if (this._hasNestedViewGroup(event, captureListeners)) return;

        var touch = event.touch;
        var deltaMove = cc.pSub(touch.getLocation(), touch.getStartLocation());

        //在滑动时, 设置开始时滑动的方向为计划方向
        //为什么在Outer中做这件事？
        //因为Outer的_onTouchMoved比Inner的早执行, 如果在Inner里做, Outer中就得忽略一帧，体验可能会不好。
        if (this.m_PlanDir == null && cc.pLength(deltaMove) > 7) {
            this.m_ScrollingInnerSv = this._findScrollingInnerSv(event.target);
            if (this.m_ScrollingInnerSv != null) {
                let contentSize = this.m_ScrollingInnerSv.content.getContentSize();
                let scrollViewSize = this.m_ScrollingInnerSv.node.getContentSize();
                if ((this.m_ScrollingInnerSv.vertical && (contentSize.height > scrollViewSize.height)) || (this.m_ScrollingInnerSv.horizontal && (contentSize.width > scrollViewSize.width))) {
                    this.m_PlanDir = Math.abs(deltaMove.x) > Math.abs(deltaMove.y) ? 1 : -1;
                } else {
                    this.m_PlanDir = 0;
                }
            } else {
                this.m_PlanDir = 0;
            }
        }

        //在InnerScrollView上滑动时, 设置开始时滑动的方向为计划方向
        if (this.content) {
            if (!this.isDifferentBetweenSettingAndPlan(this)) {
                this._handleMoveLogic(touch);
            }
        }

        if (!this.cancelInnerEvents) {
            return;
        }

        //只取消会捕获事件的直接子物体(如Button)上的事件
        if (this.m_ScrollingInnerSv == null) {
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