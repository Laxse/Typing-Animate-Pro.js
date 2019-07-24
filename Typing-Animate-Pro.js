(function () {
    'use strict';
    var HEAD_CLASS = "T_A_P_HEAD", CONTAINER_CLASS = "T_A_P_MAIN", FOOT_CLASS = "T_A_P_FOOT", CURSOR_CLASS = "T_A_P_CURSOR";
    var ALL_MODE = "ALL",LINE_MODE = "LINE",NUM_MODE = "NUM",DIFF_MODE = "DIFF"; //所有内容 // 当前行 // 指定数量 // 直到非文本（待定）
    function Typing(className, object) {
        this.stringName = "";
        this.typingSpeed = 50;
        this.cursorSpeed = 50;
        this.taskQueue = [];
        this.cursorChar = "█";
        this.loop = false;
        this.cursorInfinity = false;
        this.cursorInterval = null;
        this.fade = false;
        this.className = className;
        this.el = document.querySelector("." + this.className);
        this.head = "";
        this.foot = "";
        for (var val in object) {
            this[val] = object[val]; //输出如:name 
        }
        this.init();
    }
    window['Typing'] = Typing;//如有需要，修改，防止冲突
    Typing.prototype.init = function () {
        if (!!this.head) {
            typeAppend(this.el, "<span class='" + HEAD_CLASS + "'>" + this.head + "</span>");
        }
        typeAppend(this.el, "<span class='" + CONTAINER_CLASS + "'></span>");
        typeAppend(this.el, "<span class='" + CURSOR_CLASS + "'>" + this.cursorChar + "</span>");
        if (!!this.foot) {
            typeAppend(this.el, "<span class='" + FOOT_CLASS + "'>" + this.foot + "</span>");
        }
        if (this.el.fade == true) {
            document.querySelector("." + CURSOR_CLASS).style.transition = "opacity " + this.cursorSpeed / 2000 + "s";
        }
        var show = true;
        var This = this;
        this.cursorInterval = setInterval(function () {
            if (show) {
                This.el.querySelector("." + CURSOR_CLASS).style.opacity = 1;
                show = false;
            } else {
                This.el.querySelector("." + CURSOR_CLASS).style.opacity = 0;
                show = true;
            }
        }, this.cursorSpeed);
        return this;
    };

    Typing.prototype.add = function (stringName) {
        this.taskQueue.push({
            "add": stringName
        });
        return this;
    }
    Typing.prototype.br = function (bool) {
        this.taskQueue.push({
            "br": bool
        });
        return this;
    }
    Typing.prototype.delete = function (obj) {
        this.taskQueue.push({
            "delete": obj
        });
        return this;
    }

    Typing.prototype.sleep = function (number) {
        this.taskQueue.push({
            "sleep": number
        });
        return this;
    }

    Typing.prototype.callback = function (callback) {
        this.taskQueue.push({
            "callback": callback
        });
        return this;
    }

    Typing.prototype.setting = function (object) {
        this.taskQueue.push({
            "setting": object
        });
        return this;
    };

    Typing.prototype.execute = function () {

        if (!!this.taskQueue[0] == true) {
            var a = this.taskQueue.shift()
            if (this.loop == true) {
                this.taskQueue.push(a);
            }
            for (name in a) {
                if (name == "add") {
                    this.addTask(a[name]);
                } else if (name == "delete") {
                    this.deleteTask(a[name]);
                } else if (name == "sleep") {
                    this.sleepTask(a[name]);
                } else if (name == "br") {
                    this.addBr(a[name]);
                } else if (name == "setting") {
                    this.settingTask(a[name]);
                } else if (name == "callback") {
                    a[name]();
                    this.execute();
                }
            }
        } else {
            if (this.cursorInfinity == false) {
                this.el.querySelector("." + CURSOR_CLASS).remove();
                clearInterval(this.cursorInterval);
            } else {
                console.log('??');
            }
        }
    };

    Typing.prototype.addTask = function (val) {
        this.stringName = val;
        var This = this;
        var count = 0;
        var length = this.stringName.length;
        var charInterval = setInterval(function () {
            typeAppend(This.el.querySelector("." + CONTAINER_CLASS), "<span>" + This.stringName.charAt(count) + "</span>");
            count++;
            if (count == length) {
                clearInterval(charInterval);
                This.execute();
            }
        }, this.typingSpeed);
    }
    Typing.prototype.addBr = function (val) {
        var This = this;
        var brScript = "<span><br></span>";
        if (val) {
            brScript = "<span class='" + FOOT_CLASS + "'>" + This.foot + "</span>" + "<br>" + "<span class='" + HEAD_CLASS + "'>" + This.head + "</span>";
        }
        var charInterval = setInterval(function () {
            typeAppend(This.el.querySelector("." + CONTAINER_CLASS), brScript);
            clearInterval(charInterval);
            This.execute();
        }, this.typingSpeed);
    }
    /**
     * val 不传 -> 删除所有
     *     数值 按数量删除
     *     {
     *      mode : "LINE","ALL","DIFF","NUM",
     *      num : 10
     *      } 
     */
    Typing.prototype.deleteTask = function (val) {
        if(!val){
            val={};val.mode = ALL_MODE;
        }else if(typeof(val) == "number"){
            var t = val;
            val={};
            val.mode = LINE_MODE;
            val.num = t;
        }else if(!val.num){
            val.num = 0;
        }
        var This = this;
        var allChildCount = This.el.querySelector("." + CONTAINER_CLASS).children.length;
        if(!val || val.mode == ALL_MODE){
            var count = 0;
            var charInterval = setInterval(function () {
                if (count == allChildCount) {
                    clearInterval(charInterval);
                    This.execute();
                }else{
                    var lastChild = This.el.querySelector("." + CONTAINER_CLASS).lastChild;
                    lastChild.remove();
                    count++;
                }
            }, this.typingSpeed);
        }else if(val.mode == LINE_MODE){
            var charInterval = setInterval(function () {
                var lastChild = This.el.querySelector("." + CONTAINER_CLASS).lastChild;
                if (lastChild.nodeName == "BR" || (lastChild.nodeName == "SPAN" && lastChild.className == HEAD_CLASS)) {
                    clearInterval(charInterval);
                    This.execute();
                } else {
                    lastChild.remove();
                }
            }, this.typingSpeed);
        }else if(val.mode ==  NUM_MODE){
            var count = 0;
            var charInterval = setInterval(function () {
                if (count==val.num ||count==allChildCount) {
                    clearInterval(charInterval);
                    This.execute();
                } else {
                    var lastChild = This.el.querySelector("." + CONTAINER_CLASS).lastChild;
                    lastChild.remove();
                    count++;
                }
            }, this.typingSpeed);
        }else if(val.mode == DIFF_MODE){
            var charInterval = setInterval(function () {
                var lastChild = This.el.querySelector("." + CONTAINER_CLASS).lastChild;
                if (lastChild.nodeName != "SPAN" || (lastChild.nodeName == "SPAN" && lastChild.className == HEAD_CLASS)) {
                    clearInterval(charInterval);
                    This.execute();
                } else {
                    lastChild.remove();
                }
            }, this.typingSpeed);
        }
    }

    Typing.prototype.sleepTask = function (val) {
        var This = this;
        setTimeout(function () {
            This.execute();
        }, val);
    }

    Typing.prototype.settingTask = function (object) {
        for (var val in object) {
            this[val] = object[val];
        }
        this.execute();
    };
    /**
     * 增加后续主节点
     */
    Typing.prototype.addNextTyping = function (val) {
        var This = this;
        This.el.insertAdjacentHTML('afterend', '<div class="' + val + '"></div>')
    }
    //原生append
    function typeAppend(parent, text) {
        var temp = document.createElement('div');
        temp.innerHTML = text;
        // 防止元素太多 进行提速
        var frag = document.createDocumentFragment();
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }
        parent.appendChild(frag);
    }
})();