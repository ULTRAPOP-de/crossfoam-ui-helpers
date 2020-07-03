"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@crossfoam/utils");
var d3_1 = require("d3");
var modalButtons = function (buttons) {
    var buttonStr = "";
    buttons.forEach(function (button, bi) {
        buttonStr += "<button class='cf--modal-button-" + bi + "' data-value='" + button.value + "'>" + button.label + "</button>";
    });
    return buttonStr;
};
var isRetinaDisplay = function () {
    if (window.matchMedia && (window.matchMedia("only screen and (min-resolution: 73dpi),                        only screen and (min-resolution: 1.1dppx),                        only screen and (min-resolution: 48.8dpcm)").matches
        || window.matchMedia("only screen and (-webkit-min-device-pixel-ratio: 1.1),                           only screen and (-o-min-device-pixel-ratio: 1.1),                           only screen and (min--moz-device-pixel-ratio: 1.1),                           only screen and (min-device-pixel-ratio: 1.1)").matches
        || window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), \
                          only screen and (-o-min-device-pixel-ratio: 2.6/2), \
                          only screen and (-webkit-min-device-pixel-ratio: 1.3), \
                          only screen  and (min-device-pixel-ratio: 1.3), \
                          only screen and (min-resolution: 1.3dppx)").matches)) {
        return true;
    }
    if (window.devicePixelRatio && window.devicePixelRatio > 1) {
        return true;
    }
    return false;
};
exports.isRetinaDisplay = isRetinaDisplay;
var modal = function (content) {
    if ("uuid" in content && document.querySelector("#cf--modal-container-" + content.uuid) !== null) {
        var el = document.querySelector("#cf--modal-container-" + content.uuid);
        el.parentNode.removeChild(el);
    }
    var modalContainer = document.createElement("div");
    var modalUUID = content.uuid || utils_1.uuid();
    modalContainer
        .setAttribute("class", "cf--modal-container");
    modalContainer
        .setAttribute("id", "cf--modal-container-" + modalUUID);
    addHTML(modalContainer, "<div class=\"cf--modal-box\">\n    <div class=\"cf--modal-header\"\n      style=\"background-image:url(" + browser.runtime.getURL("assets/images/modal-header" +
        ((isRetinaDisplay) ? "@2x" : "") + ".png") + ");\"></div>\n    <div class=\"cf--modal-title\">" + (content.title || "") + "</div>\n    <div class=\"cf--modal-message\">" + (content.message || "") + "</div>\n    <div class=\"cf--modal-buttons\">\n      " + modalButtons(content.buttons) + "\n    </div>\n</div>");
    document.body.appendChild(modalContainer);
    return new Promise(function (resolve, reject) {
        content.buttons.forEach(function (button, bi) {
            document.querySelector("#cf--modal-container-" + modalUUID + " .cf--modal-button-" + bi)
                .addEventListener("click", function (event) {
                document.querySelector("#cf--modal-container-" + modalUUID).remove();
                resolve(event.currentTarget.getAttribute("data-value"));
                event.preventDefault();
            });
        });
        document.querySelector("#cf--modal-container-" + modalUUID)
            .addEventListener("click", function () {
            var modalContainerSelect = document.querySelector("#cf--modal-container-" + modalUUID);
            if (modalContainerSelect !== null) {
                modalContainerSelect.remove();
                reject();
            }
        });
    });
};
exports.modal = modal;
/* ----- ColorPicker ----- */
// credit to https://observablehq.com/@toja/yes-mum-its-a-color-picker
// hiddenId is the hidden input field which receives the resulting color
var createRgb = function (x, y, width, height, l) {
    if (l === void 0) { l = 0.5; }
    return hsl2rgb([
        interpolateHue(x / width),
        1 - y / height,
        l,
    ]);
};
var rgb2hsl = function (rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h;
    var s;
    var l = (max + min) / 2;
    if (max === min) {
        h = s = 0; // achromatic
    }
    else {
        var d = max - min;
        s = (l > 0.5) ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
};
var hsl2rgb = function (hsl) {
    var h = hsl[0];
    var s = hsl[1];
    var l = hsl[2];
    var C = (1 - Math.abs(2 * l - 1)) * s;
    var H = h / 60;
    var X = C * (1 - Math.abs(H % 2 - 1));
    var m = l - C / 2;
    var rgb;
    switch (Math.floor(H)) {
        case 0:
            rgb = [C, X, 0];
            break;
        case 1:
            rgb = [X, C, 0];
            break;
        case 2:
            rgb = [0, C, X];
            break;
        case 3:
            rgb = [0, X, C];
            break;
        case 4:
            rgb = [X, 0, C];
            break;
        case 5:
            rgb = [C, 0, X];
            break;
        default: rgb = [0, 0, 0];
    }
    return rgb.map(function (v) { return Math.round((v + m) * 255); });
};
var lerp = function (a, b) {
    return function (t) { return a * (1 - t) + b * t; };
};
var interpolateHue = lerp(0, 360);
var luminance = function (_a) {
    var r = _a[0], g = _a[1], b = _a[2];
    var R = r / 255;
    var G = g / 255;
    var B = b / 255;
    if (R <= 0.03928) {
        R = R / 12.92;
    }
    else {
        R = Math.pow((R + 0.055) / 1.055, 2.4);
    }
    if (G <= 0.03928) {
        G = G / 12.92;
    }
    else {
        G = Math.pow((G + 0.055) / 1.055, 2.4);
    }
    if (B <= 0.03928) {
        B = B / 12.92;
    }
    else {
        B = Math.pow((B + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};
var rgb2hex = function (_a) {
    var r = _a[0], g = _a[1], b = _a[2];
    var i = r << 16 | g << 8 | b;
    return "#" + ("000000" + i.toString(16)).slice(-6);
};
var hex2rgb = function (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
    ] : null;
};
var isReadable = function (_contrastRatio) {
    return _contrastRatio >= 4.5;
};
var contrastRatio = function (l1, l2) {
    if (l1 < l2) {
        // nice var swap: https://stackoverflow.com/questions/16201656/how-to-swap-two-variables-in-javascript/20531819
        l2 = [l1, l1 = l2][0];
    }
    return (l1 + 0.05) / (l2 + 0.05);
};
var imageData = function (width, height) {
    var data = new Uint8ClampedArray(width * height * 4);
    for (var y = 0, index = -1; y < height; ++y) {
        for (var x = 0; x < width; ++x) {
            var _a = createRgb(x, y, width, height), r = _a[0], g = _a[1], b = _a[2];
            data[++index] = r || 0;
            data[++index] = g || 0;
            data[++index] = b || 0;
            data[++index] = 255;
        }
    }
    return new ImageData(data, width, height);
};
var colorPicker = function (containerId, hiddenId, width, color) {
    if (color.toString() !== "[object Array]") {
        color = hex2rgb(color);
    }
    var height = 150;
    var heightBright = 30;
    // default color
    var hsl = rgb2hsl(color);
    var x = hsl[0] / 360 * width;
    var y = height - hsl[1] / 100 * height;
    var xBright = Math.round(hsl[2] / 100 * width);
    d3_1.select("#" + containerId).style("line-height", "0");
    var colorContainer = d3_1.select("#" + containerId).append("div")
        .style("position", "relative")
        .style("height", height + "px")
        .style("width", width + "px")
        .style("margin-bottom", "5px");
    var canvas = colorContainer.append("canvas")
        .style("position", "relative")
        .style("margin-bottom", "-" + (height - 5) + "px")
        .attr("width", width + "px")
        .attr("height", height + "px");
    canvas.call(d3_1.drag().on("drag", function () {
        x = Math.max(0, Math.min(d3_1.event.x, width));
        y = Math.max(0, Math.min(d3_1.event.y, height));
        render();
    }));
    var context = canvas.node().getContext("2d");
    context.clearRect(0, 0, width, height);
    context.putImageData(imageData(width, height), 0, 0);
    var svg = colorContainer.append("svg")
        .style("position", "relative")
        .style("left", 0)
        .style("top", "-5px")
        .attr("width", width + "px")
        .attr("height", height + "px")
        .style("pointer-events", "none");
    var circle = svg.append("circle")
        .attr("r", 5)
        .style("fill", "transparent")
        .style("stroke", "white");
    var canvasBright = d3_1.select("#" + containerId).append("canvas")
        .style("clear", "both")
        .style("margin-bottom", "5px")
        .attr("width", width)
        .attr("height", heightBright);
    canvasBright.call(d3_1.drag().on("drag", function () {
        xBright = Math.max(0, Math.min(Math.round(d3_1.event.x), width));
        render();
    }));
    var contextBright = canvasBright.node().getContext("2d");
    var result = d3_1.select("#" + containerId).append("div")
        .style("clear", "both")
        .style("width", width + "px")
        .style("height", heightBright + "px");
    var render = function () {
        circle
            .style("stroke", isReadable(contrastRatio(luminance(createRgb(x, y, width, height, 0.5)), 0)) ? "black" : "white")
            .attr("cx", x)
            .attr("cy", y);
        hsl = [interpolateHue(x / width), 1 - y / height, xBright / width];
        contextBright.clearRect(0, 0, width, heightBright);
        for (var l = 0; l < width; ++l) {
            contextBright.fillStyle = (l === xBright)
                ? isReadable(contrastRatio(luminance(createRgb(x, y, width, height, l / width)), 0)) ? "black" : "white"
                : "hsl(" + hsl[0] + ", " + hsl[1] * 100 + "%, " + l / width * 100 + "%)";
            contextBright.fillRect(l, 0, 1, heightBright);
        }
        var rgb = hsl2rgb(hsl);
        var hex = rgb2hex(rgb);
        d3_1.select("#" + hiddenId)
            .property("value", hex);
        result.style("background-color", hex);
    };
    render();
};
exports.colorPicker = colorPicker;
var logoSpinner = function (target, size, color) {
    if (color === void 0) { color = "#338498"; }
    var width = size;
    var height = size;
    var radius = size / 4;
    var nUuid = "spinner" + utils_1.uuid();
    var strokeScale = d3_1.scaleLinear().domain([40, 100]).range([2, 5]);
    var svg = d3_1.select(target).append("svg")
        .attr("id", nUuid)
        .attr("class", "logoSpinner")
        .style("stroke-width", strokeScale(size) + "px")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
    var mask = svg.append("defs")
        .append("mask")
        .attr("id", "hole");
    mask.selectAll("circle").data([0, 1]).enter().append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", function (d) { return (d === 0) ? size * 5 : (radius + strokeScale(size) * 2); })
        .style("fill", function (d) { return (d === 0) ? "white" : "black"; });
    var g = svg.append("g")
        .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")");
    var pX = function (r, theta) {
        return r * Math.cos(theta);
    };
    var pY = function (r, theta) {
        return r * Math.sin(theta);
    };
    var data = [];
    var rotation = 0;
    var sphereCount = 3;
    for (var i = 0; i < sphereCount; i += 1) {
        data.push({
            offset: Math.PI * 2 / sphereCount * i,
            radius: radius,
            size: -5,
        });
    }
    var circles = g.append("g").selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("mask", "url(#hole)")
        .style("stroke", color);
    var update = function () {
        if (d3_1.selectAll("#" + nUuid).size() === 0) {
            clearInterval(inter);
        }
        else {
            rotation += 0.1;
            if (rotation >= Math.PI * 2) {
                rotation = 0;
            }
            circles
                .data(data)
                .attr("cy", function (d) { return pY(radius + d.radius * Math.abs(Math.sin(rotation)) / 2, d.offset + rotation); })
                .attr("cx", function (d) { return pX(radius + d.radius * Math.abs(Math.sin(rotation)) / 2, d.offset + rotation); })
                .attr("r", function (d) { return d.size * Math.abs(Math.sin((rotation) * 2)) / 2 + radius; });
        }
    };
    var inter = setInterval(update, 30);
    g.append("circle")
        .attr("r", radius)
        .style("stroke", color);
    g.append("circle")
        .attr("r", radius / 2)
        .style("fill", color)
        .style("stroke", "transparent");
    return function () {
        clearInterval(inter);
        d3_1.selectAll("#" + nUuid).remove();
    };
};
exports.logoSpinner = logoSpinner;
var blockSplash = function (message) {
    var modalContainer = document.createElement("div");
    var modalUUID = utils_1.uuid();
    modalContainer
        .setAttribute("class", "cf--modal-container");
    modalContainer
        .setAttribute("id", "cf--modal-container-" + modalUUID);
    addHTML(modalContainer, "<div class=\"cf--modal-box cf--modal-box-transparent\">\n    <div class=\"cf--modal-spinner\"></div>\n    <div class=\"cf--modal-message\">v3 " + (message || "") + "</div>\n</div>");
    document.body.appendChild(modalContainer);
    var destroySpinner = logoSpinner("#cf--modal-container-" + modalUUID + " .cf--modal-spinner", 50, "#ffffff");
    return function () {
        destroySpinner();
        d3_1.selectAll("#cf--modal-container-" + modalUUID).remove();
    };
};
exports.blockSplash = blockSplash;
var formatNumber = function (n, lang) {
    var parts = n.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, (lang === "de") ? "." : ",");
    return parts.join((lang === "de") ? "," : ".");
};
exports.formatNumber = formatNumber;
var setHTML = function (selector, html) {
    var node = document.querySelector(selector);
    addHTML(node, html);
};
exports.setHTML = setHTML;
var addHTML = function (node, html) {
    node.textContent = "";
    var parser = new DOMParser();
    var parsed = parser.parseFromString(html, "text/html");
    var tags = Array.from(parsed.getElementsByTagName("body")[0].childNodes);
    tags.forEach(function (tag) {
        node.append(tag);
    });
};
exports.addHTML = addHTML;
//# sourceMappingURL=index.js.map