import { uuid } from "@crossfoam/utils";
import * as d3 from "d3";

const modalButtons = (buttons): string => {

  let buttonStr = "";

  buttons.forEach((button, bi) => {
    buttonStr += `<button class='cf--modal-button-${bi}' data-value='${button.value}'>${button.label}</button>`;
  });

  return buttonStr;

};

const isRetinaDisplay = () => {
  if (window.matchMedia && (
    window.matchMedia(`only screen and (min-resolution: 73dpi), \
                       only screen and (min-resolution: 1.1dppx), \
                       only screen and (min-resolution: 48.8dpcm)`).matches
    || window.matchMedia(`only screen and (-webkit-min-device-pixel-ratio: 1.1), \
                          only screen and (-o-min-device-pixel-ratio: 1.1), \
                          only screen and (min--moz-device-pixel-ratio: 1.1), \
                          only screen and (min-device-pixel-ratio: 1.1)`).matches
    || window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), \
                          only screen and (-o-min-device-pixel-ratio: 2.6/2), \
                          only screen and (-webkit-min-device-pixel-ratio: 1.3), \
                          only screen  and (min-device-pixel-ratio: 1.3), \
                          only screen and (min-resolution: 1.3dppx)").matches
  )) {
    return true;
  }

  if (window.devicePixelRatio && window.devicePixelRatio > 1) {
    return true;
  }

  return false;
};

const modal = (content): Promise<any> => {

  if ("uuid" in content && document.querySelector("#cf--modal-container-" + content.uuid) !== null) {
    const el = document.querySelector("#cf--modal-container-" + content.uuid);
    el.parentNode.removeChild(el);
  }

  const modalContainer = document.createElement("div");
  const modalUUID = content.uuid || uuid();

  modalContainer
    .setAttribute("class", "cf--modal-container");

  modalContainer
    .setAttribute("id", "cf--modal-container-" + modalUUID);

  modalContainer
    .innerHTML = `<div class="cf--modal-box">
    <div class="cf--modal-header"
      style="background-image:url(${
        browser.runtime.getURL("assets/images/modal-header" +
        ((isRetinaDisplay) ? "@2x" : "") + ".png")
      });"></div>
    <div class="cf--modal-title">${content.title || ""}</div>
    <div class="cf--modal-message">${content.message || ""}</div>
    <div class="cf--modal-buttons">
      ${modalButtons(content.buttons)}
    </div>
</div>`;

  document.body.appendChild(modalContainer);

  return new Promise((resolve, reject) => {
    content.buttons.forEach((button, bi) => {
      document.querySelector(`#cf--modal-container-${modalUUID} .cf--modal-button-${bi}`)
        .addEventListener("click", (event) => {
          document.querySelector(`#cf--modal-container-${modalUUID}`).remove();
          resolve((event.currentTarget as Element).getAttribute("data-value"));
          event.preventDefault();
        });
    });

    document.querySelector(`#cf--modal-container-${modalUUID}`)
      .addEventListener("click", () => {
        const modalContainerSelect = document.querySelector(`#cf--modal-container-${modalUUID}`);
        if (modalContainerSelect !== null) {
          modalContainerSelect.remove();
          reject();
        }
      });
  });

};

/* ----- ColorPicker ----- */
// credit to https://observablehq.com/@toja/yes-mum-its-a-color-picker
// hiddenId is the hidden input field which receives the resulting color

const createRgb = (x: number, y: number, width: number, height: number, l: number = 0.5) => {
  return hsl2rgb([
    interpolateHue(x / width),
    1 - y / height,
    l,
  ]);
};

const rgb2hsl = (rgb: number[]) => {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  let s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = (l > 0.5) ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h * 360, s * 100, l * 100 ];
};

const hsl2rgb = (hsl: number[]) => {
  const h = hsl[0];
  const s = hsl[1];
  const l = hsl[2];

  const C = (1 - Math.abs(2 * l - 1)) * s;
  const H = h / 60;
  const X = C * (1 - Math.abs(H % 2 - 1));
  const m = l - C / 2;

  let rgb;
  switch (Math.floor(H)) {
    case 0: rgb = [C, X, 0]; break;
    case 1: rgb = [X, C, 0]; break;
    case 2: rgb = [0, C, X]; break;
    case 3: rgb = [0, X, C]; break;
    case 4: rgb = [X, 0, C]; break;
    case 5: rgb = [C, 0, X]; break;
    default: rgb = [0, 0, 0];
  }

  return rgb.map((v) => Math.round((v + m) * 255));
};

const lerp = (a, b) => {
  return (t) => a * (1 - t) + b * t;
};

const interpolateHue = lerp(0, 360);

const luminance = ([r, g, b]) => {
  let R = r / 255;
  let G = g / 255;
  let B = b / 255;

  if (R <= 0.03928) {
    R = R / 12.92;
  } else {
    R = Math.pow((R + 0.055) / 1.055, 2.4);
  }

  if (G <= 0.03928) {
    G = G / 12.92;
  } else {
    G = Math.pow((G + 0.055) / 1.055, 2.4);
  }

  if (B <= 0.03928) {
    B = B / 12.92;
  } else {
    B = Math.pow((B + 0.055) / 1.055, 2.4);
  }

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

const rgb2hex = ([r, g, b]) => {
  const i = r << 16 | g << 8 | b;
  return "#" + ("000000" + i.toString(16)).slice(-6);
};

const hex2rgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
   ] : null;
};

const isReadable = (_contrastRatio: number): boolean => {
  return _contrastRatio >= 4.5;
};

const contrastRatio = (l1: number, l2: number): number => {
  if (l1 < l2) {
    // nice var swap: https://stackoverflow.com/questions/16201656/how-to-swap-two-variables-in-javascript/20531819
    l2 = [l1, l1 = l2][0];
  }
  return (l1 + 0.05) / (l2 + 0.05);
};

const imageData = (width: number, height: number) => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0, index = -1; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const [r, g, b] = createRgb(x, y, width, height);
      data[++index] = r || 0;
      data[++index] = g || 0;
      data[++index] = b || 0;
      data[++index] = 255;
    }
  }
  return new ImageData(data, width, height);
};

const colorPicker = (containerId: string, hiddenId: string, width: number, color: any) => {

  if (color.toString() !== "[object Array]") {
    color = hex2rgb(color);
  }

  const height = 150;
  const heightBright = 30;

  // default color
  let hsl = rgb2hsl(color);
  let x = hsl[0] / 360 * width;
  let y = height - hsl[1] / 100 * height;
  let xBright = Math.round(hsl[2] / 100 * width);

  d3.select(`#${containerId}`).style("line-height", "0");

  const colorContainer = d3.select(`#${containerId}`).append("div")
    .style("position", "relative")
    .style("height", `${height}px`)
    .style("width", `${width}px`)
    .style("margin-bottom", "5px");

  const canvas = colorContainer.append("canvas")
    .style("position", "relative")
    .style("margin-bottom", `-${height - 5}px`)
    .attr("width", `${width}px`)
    .attr("height", `${height}px`);

  canvas.call(d3.drag().on("drag", () => {
    x = Math.max(0, Math.min(d3.event.x, width));
    y = Math.max(0, Math.min(d3.event.y, height));
    render();
  }));

  const context = canvas.node().getContext("2d");
  context.clearRect(0, 0, width, height);
  context.putImageData(imageData(width, height), 0, 0);

  const svg = colorContainer.append("svg")
    .style("position", "relative")
    .style("left", 0)
    .style("top", `-5px`)
    .attr("width", `${width}px`)
    .attr("height", `${height}px`)
    .style("pointer-events", "none");

  const circle = svg.append("circle")
    .attr("r", 5)
    .style("fill", "transparent")
    .style("stroke", "white");

  const canvasBright = d3.select(`#${containerId}`).append("canvas")
    .style("clear", "both")
    .style("margin-bottom", "5px")
    .attr("width", width)
    .attr("height", heightBright);

  canvasBright.call(d3.drag().on("drag", () => {
    xBright = Math.max(0, Math.min(Math.round(d3.event.x), width));
    render();
  }));

  const contextBright = canvasBright.node().getContext("2d");

  const result = d3.select(`#${containerId}`).append("div")
    .style("clear", "both")
    .style("width", `${width}px`)
    .style("height", `${heightBright}px`);

  const render = () => {

    circle
      .style("stroke", isReadable(contrastRatio(luminance(createRgb(x, y, width, height, 0.5)), 0)) ? "black" : "white")
      .attr("cx", x)
      .attr("cy", y);

    hsl = [interpolateHue(x / width), 1 - y / height, xBright / width];

    contextBright.clearRect(0, 0, width, heightBright);
    for (let l = 0; l < width; ++l) {
      contextBright.fillStyle = (l === xBright)
        ? isReadable(contrastRatio(luminance(createRgb(x, y, width, height, l / width)), 0)) ? "black" : "white"
        : `hsl(${hsl[0]}, ${hsl[1] * 100}%, ${l / width * 100}%)`;
      contextBright.fillRect(l, 0, 1, heightBright);
    }

    const rgb = hsl2rgb(hsl);
    const hex = rgb2hex(rgb);

    d3.select(`#${hiddenId}`)
      .property("value", hex);

    result.style("background-color", hex);
  };

  render();

};

const logoSpinner = (target: string, size: number, color: string = "#338498"): () => void => {
  const width = size;
  const height = size;
  const radius = size / 4;
  const nUuid = "spinner" + uuid();

  const strokeScale = d3.scaleLinear().domain([40, 100]).range([1, 5]);

  const svg = d3.select(target).append("svg")
    .attr("id", nUuid)
    .attr("class", "logoSpinner")
    .style("stroke-width", strokeScale(size) + "px")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  const mask = svg.append("defs")
    .append("mask")
      .attr("id", "hole");

  mask.selectAll("circle").data([0, 1]).enter().append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", (d) => (d === 0) ? size * 5 : (radius + strokeScale(size) * 2))
    .style("fill", (d) => (d === 0) ? "white" : "black");

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const pX = (r, theta) => {
    return r * Math.cos(theta);
  };

  const pY = (r, theta) => {
    return r * Math.sin(theta);
  };

  const data = [];
  let rotation = 0;
  const sphereCount = 3;

  for (let i = 0; i < sphereCount; i += 1) {
    data.push({
      offset: Math.PI * 2 / sphereCount * i,
      radius,
      size: -5,
    });
  }

  const circles = g.append("g").selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("mask", "url(#hole)")
      .style("stroke", color);

  const update = () => {
    if (d3.selectAll("#" + nUuid).size() === 0) {
      clearInterval(inter);
    } else {
      rotation += 0.1;
      if (rotation >= Math.PI * 2) {
        rotation = 0;
      }

      circles
        .data(data)
        .attr("cy", (d) => pY(radius + d.radius * (1 + Math.sin(rotation * 2)) / 2, d.offset + rotation))
        .attr("cx", (d) => pX(radius + d.radius * (1 + Math.sin(rotation * 2)) / 2, d.offset + rotation))
        .attr("r", (d) => d.size * (1 + Math.sin(rotation * 2)) / 2 + radius);
    }
  };

  const inter = setInterval(update, 30);

  g.append("circle")
    .attr("r", radius)
    .style("stroke", color);

  g.append("circle")
    .attr("r", radius / 2)
    .style("fill", color)
    .style("stroke", "transparent");

  return () => {
    clearInterval(inter);
    d3.selectAll("#" + nUuid).remove();
  };
};

const blockSplash = (message: string): () => void => {
  const modalContainer = document.createElement("div");
  const modalUUID = uuid();

  modalContainer
    .setAttribute("class", "cf--modal-container");

  modalContainer
    .setAttribute("id", "cf--modal-container-" + modalUUID);

  modalContainer
    .innerHTML = `<div class="cf--modal-box cf--modal-box-transparent">
    <div class="cf--modal-spinner"></div>
    <div class="cf--modal-message">${message || ""}</div>
</div>`;

  document.body.appendChild(modalContainer);

  const destroySpinner = logoSpinner("#cf--modal-container-" + modalUUID + " .cf--modal-spinner", 100, "#ffffff");

  return () => {
    destroySpinner();
    d3.selectAll("#cf--modal-container-" + modalUUID).remove();
  };
};

const formatNumber = (n: number, lang: string): string => {
  const parts = n.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, (lang === "de") ? "." : ",");
  return parts.join((lang === "de") ? "," : ".");
};

export { blockSplash, colorPicker, formatNumber, isRetinaDisplay, logoSpinner, modal };
