let NestableScrollView = cc.Class({
    extends: cc.ScrollView,

    statics: {
        s_PlanDir: {            //计划方向, 本次滑动的目的方向。根据刚开始滑动的方向决定 1为横, -1为纵
            default: 0,
            visible: false,
        },
    },

    properties: {
        m_InnerScrollView: cc.ScrollView,   //挂内嵌的ScrollView
        m_HasInner: {                       //是否有内嵌的ScrollView((只有两层所以可以认为，有就为父, 否则为子),
            default: false,
            visible: false,
        },
    },

    onLoad: function () {
        NestableScrollView.s_PlanDir = 0;
        if (this.m_InnerScrollView instanceof cc.ScrollView) {
            this.m_HasInner = true;
        } else {
            this.m_HasInner = false;
        }
    },

    //检查实际与计划方向一致性
    _isDifferentBetweenSettingAndPlan() {
        if (NestableScrollView.s_PlanDir == 0) {
            return false;
        }

        if (NestableScrollView.s_PlanDir == 1 && this.horizontal){
            return false;
        }

        if (NestableScrollView.s_PlanDir == -1 && this.vertical){
            return false;
        }

        return true;
    },

    //是否为嵌套滑动视图的子物体
    _isInnersChild(node) {
        if (node == this.m_InnerScrollView.node) {
            return true;
        }
        if (node.parent != null) {
            if (node.parent == this.m_InnerScrollView.node) {
                return true;
            } else {
                return this._isInnersChild(node.parent);
            }
        }
        return false;
    },

    //#region override method
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
        if (this.m_HasInner && this._isInnersChild(event.target)) {
            if (NestableScrollView.s_PlanDir == 0 && cc.pLength(deltaMove) > 7) {
                NestableScrollView.s_PlanDir = Math.abs(deltaMove.x) > Math.abs(deltaMove.y) ? 1 : -1;
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
        if ((this.m_HasInner && !this._isInnersChild(event.target)) || (!this.m_HasInner)) {
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
