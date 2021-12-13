"use strict";
/**
 * @module ui/menubar
 */
/** */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var MenuBar = /** @class */ (function () {
    function MenuBar() {
        this.roundNext = true;
        this.lastAdded = null;
        this.div = document.createElement("div");
        this.div.classList.add("menu-bar");
    }
    MenuBar.prototype.addItem = function (item) {
        this.div.append(item.div);
        if (this.lastAdded) {
            this.lastAdded.div.style.borderBottomRightRadius = "0px";
            this.lastAdded.div.style.borderTopRightRadius = "0px";
        }
        if (this.roundNext) {
            item.div.style.borderBottomLeftRadius = "4px";
            item.div.style.borderTopLeftRadius = "4px";
            this.roundNext = false;
        }
        item.div.style.borderBottomRightRadius = "4px";
        item.div.style.borderTopRightRadius = "4px";
        this.lastAdded = item;
    };
    MenuBar.prototype.addDivider = function () {
        var divider = document.createElement("div");
        divider.classList.add("menu-divider");
        this.div.appendChild(divider);
        this.roundNext = true;
        this.lastAdded = null;
    };
    return MenuBar;
}());
exports.MenuBar = MenuBar;
var MenuItem = /** @class */ (function () {
    function MenuItem(tooltip, icon) {
        this.selected = false;
        this.div = document.createElement("div");
        this.div.classList.add("menu-item");
        this.div.title = tooltip;
        this.div.style.backgroundImage = "url('image/" + icon + "')";
        this.div.addEventListener("click", this.click.bind(this));
    }
    MenuItem.prototype.setSelected = function (selected) {
        if (selected) {
            this.div.classList.add("selected");
        }
        else {
            this.div.classList.remove("selected");
        }
        this.selected = selected;
    };
    return MenuItem;
}());
exports.MenuItem = MenuItem;
var ActionMenuItem = /** @class */ (function (_super) {
    __extends(ActionMenuItem, _super);
    function ActionMenuItem(action, tooltip, icon) {
        var _this = _super.call(this, tooltip, icon) || this;
        _this.action = action;
        return _this;
    }
    ActionMenuItem.prototype.click = function () {
        this.action.use();
    };
    return ActionMenuItem;
}(MenuItem));
exports.ActionMenuItem = ActionMenuItem;
var ToolMenuItem = /** @class */ (function (_super) {
    __extends(ToolMenuItem, _super);
    function ToolMenuItem(toolGroup, tool, tooltip, icon) {
        var _this = _super.call(this, tooltip, icon) || this;
        _this.toolGroup = toolGroup;
        _this.tool = tool;
        _this.toolGroup.addTool(_this);
        return _this;
    }
    ToolMenuItem.prototype.click = function () {
        this.toolGroup.selectTool(this);
    };
    return ToolMenuItem;
}(MenuItem));
exports.ToolMenuItem = ToolMenuItem;
var ToolGroup = /** @class */ (function () {
    function ToolGroup() {
        this.selectedTool = null;
        this.toolMenuItems = [];
    }
    ToolGroup.prototype.addTool = function (toolMenuItem) {
        this.toolMenuItems.push(toolMenuItem);
        if (this.selectedTool == null)
            this.selectTool(toolMenuItem);
    };
    ToolGroup.prototype.selectTool = function (toolMenuItem) {
        this.selectedTool = toolMenuItem.tool;
        for (var _i = 0, _a = this.toolMenuItems; _i < _a.length; _i++) {
            var tool = _a[_i];
            tool.setSelected(tool == toolMenuItem);
        }
    };
    return ToolGroup;
}());
exports.ToolGroup = ToolGroup;
//# sourceMappingURL=menubar.js.map