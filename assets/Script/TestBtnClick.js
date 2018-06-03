cc.Class({
    extends: cc.Component,

    properties: {
        m_Btn_A: cc.Button,
        m_Btn_B: cc.Button,
        m_Btn_GiveStar: cc.Button,
    },

    // use this for initialization
    onLoad: function () {
        this.m_Btn_A.clickEvents.push(this.CreateCCEventHandler(this.node, "TestBtnClick", "OnBtnClick", null));
        this.m_Btn_B.clickEvents.push(this.CreateCCEventHandler(this.node, "TestBtnClick", "OnBtnClick", null));
        this.m_Btn_GiveStar.clickEvents.push(this.CreateCCEventHandler(this.node, "TestBtnClick", "OnBtnClick", null));
    },

    OnBtnClick(eventData) {
        if (eventData.target == this.m_Btn_A.node) {
            cc.log("this.m_Btn_A");
        }
        if (eventData.target == this.m_Btn_B.node) {
            cc.log("this.m_Btn_B");
        }
        if (eventData.target == this.m_Btn_GiveStar.node){
            cc.sys.openURL("https://github.com/NRatel/CCCNestableScrollView"); 
        }
    },

    CreateCCEventHandler(target, component, handlerName, customEventData) {
        let eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handlerName;
        eventHandler.customEventData = customEventData;
        return eventHandler;
    }
});
