(function () {
    'use strict';

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
    window['Typing'] = Typing;
    Typing.prototype.init = function () {
        if (!!this.head) {
            typeAppend(this.el, "<span class='typing-head'>" + this.head + "</span>");
        }
        typeAppend(this.el, "<span class='typing-container'></span>");
        typeAppend(this.el, "<span class='cursor'>" + this.cursorChar + "</span>");
        if (!!this.foot) {
            typeAppend(this.el, "<span class='typing-foot'>" + this.foot + "</span>");
        }
        if (this.el.fade == true) {
            document.querySelector(".cursor").style.transition = "opacity " + this.cursorSpeed / 2000 + "s";
        }
        var show = true;
        var This = this;
        this.cursorInterval = setInterval(function () {
            if (show) {
                This.el.querySelector(" .cursor").style.opacity = 1;
                show = false;
            } else {
                This.el.querySelector(" .cursor").style.opacity = 0;
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
    Typing.prototype.br = function () {
        this.taskQueue.push({
            "br": true
        });
        return this;
    }
    Typing.prototype.delete = function (number) {
        this.taskQueue.push({
            "delete": number
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
                } else if(name == "br"){
                    this.addBr();
                } else if (name == "setting") {
                    this.settingTask(a[name]);
                } else if (name == "callback") {
                    a[name]();
                    this.execute();
                }
            }
        } else {
            if (this.cursorInfinity == false) {
                typeRemove(this.el.querySelector(".cursor"));
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
            typeAppend(This.el.querySelector(".typing-container"), "<span>" + This.stringName.charAt(count) + "</span>");
            count++;
            if (count == length) {
                clearInterval(charInterval);
                This.execute();
            }
        }, this.typingSpeed);
    }
    Typing.prototype.addBr = function (val) {
        var This = this;
        var charInterval = setInterval(function () {
            typeAppend(This.el.querySelector(".typing-container"), "<span><br></span>");
            clearInterval(charInterval);
            This.execute();
        }, this.typingSpeed);
    }
    Typing.prototype.deleteTask = function (val) {
        var This = this;
        var count = 0;
        var show = true;
        var allCharLength = This.el.querySelector(".typing-container").children.length;
        if (!val == true) {
            val = allCharLength;
        }
        if (val > allCharLength) {
            console.error("The delete function's param must less than String's length");
        } else {
            var charInterval = setInterval(function () {
                typeRemove(This.el.querySelector(" .typing-container").lastChild);
                count++;
                if (count == val) {
                    clearInterval(charInterval);
                    This.execute();
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
    Typing.prototype.addNext = function(val){
        var This = this;
        This.el.insertAdjacentHTML('afterend',  '<div class="'+val+'"></div>')
    }
    function typeAppend(parent, text) {
        if (typeof text === 'string') {
            var temp = document.createElement('div');
            temp.innerHTML = text;
            // 防止元素太多 进行提速
            var frag = document.createDocumentFragment();
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }
            parent.appendChild(frag);
        } else {
            parent.appendChild(text);
        }
    }

    function typeRemove(selectors) {
        selectors.removeNode = [];
        if (selectors.length != undefined) {
            var len = selectors.length;
            for (var i = 0; i < len; i++) {
                selectors.removeNode.push({
                    parent: selectors[i].parentNode,
                    inner: selectors[i].outerHTML,
                    next: selectors[i].nextSibling
                });
            }
            for (var i = 0; i < len; i++)
                selectors[0].parentNode.removeChild(selectors[0]);
        } else {
            selectors.removeNode.push({
                parent: selectors.parentNode,
                inner: selectors.outerHTML,
                next: selectors.nextSibling
            });
            selectors.parentNode.removeChild(selectors);
        }
    }
})();