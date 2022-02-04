import computeLayout from 'opentype-layout';

import parseUnit from 'parse-unit';
import toSvg from './glyphToSvgPath';
import convert from './convert';
import { type } from 'os';

let defaultStyles = {
  color: 'black',
  fontSize: '12px',
  textAlign: 'left', // options: left, right, center
  verticalAlign: 'top', // options: top, bottom, middle
  letterSpacing: '0px',
  lineHeight: '12px',
  top: '0px',
  left: '0px',
  offsetX: '0px',
  offsetY: '0px',
  width: '500px', // cannot use percentage
  height: '100px', // cannot use percentage
  boundingBox: false,
  dropshadowColor: 'black',
  dropshadowBlurX: 0,
  dropshadowBlurY: 0,
  dropshadowOffsetX: '0px',
  dropshadowOffsetY: '0px',
  dropshadowOpacity: 0,
  strokeColor: 'black',
  strokeLinecap: 'round', // butt, round, square
  strokeWidth: '0px',
  strokeOpacity: 1,
  maskRows: false
};

export default function (container, font, text, roundDecimal, customStyles) {
  window.font = font;
  let styles = Object.assign(defaultStyles, customStyles);
  let hasDropShadow = (
    customStyles.dropshadowOffsetX ||
    customStyles.dropshadowOffsetY ||
    customStyles.dropshadowBlur ||
    customStyles.dropshadowColor ||
    customStyles.dropshadowOpacity
  );

  let hasStroke = (
    customStyles.strokeColor ||
    customStyles.strokeLinecap ||
    customStyles.strokeWidth
  );

  if (!roundDecimal) roundDecimal = 5;
  // normalize text before using.
  text = text.replace(/\r?\n|\r/g, '\n').split(' ').filter(item => item != '').join(' ').split('\n').map(item => item.trim()).join('\n');
  const fontSizePx = convert.getFontSizePx(font, styles.fontSize);
  let width;

  if (styles.width && styles.width.indexOf('%') > -1 && container) {
    let percentNum = Number(styles.width.replace('%', '')) / 100;
    width = container.offsetWidth * percentNum;
  } else {
    width = styles.width;
  }

  let style = {
    letterSpacing: convert.getEmUnits(font, fontSizePx, styles.letterSpacing),
    lineHeight: convert.getEmUnits(font, fontSizePx, convert.getFontSizePx(font, styles.lineHeight)),
    width: width ? convert.getEmUnits(font, fontSizePx, width) : undefined,
    align: styles.textAlign
  };

  const pxScale = convert.getScale(font, fontSizePx);
  window.pxScale = pxScale;
  var result = computeLayout(font, text, style);

  let wordStarts = [];
  let wordEnds = []

  for (let i = 0; i < text.length; i++) {
    let currentChar = text[i];
    let previousChar = text[i - 1] || ' ';
    if (isSeparator(previousChar) === true && isSeparator(currentChar) === false) {
      wordStarts.push(i);
    }
  }

  for (let i = 0; i < text.length; i++) {
    let currentChar = text[i];
    let previousChar = text[i - 1] || ' ';
    if (isSeparator(previousChar) === false && isSeparator(currentChar) === true) {
      wordEnds.push(i - 1);
    }
  }

  function isSeparator(char) {
    return (char === '\n' || char === '\r' || char === ' ');
  }

  return drawText();

  function drawText() {
    let maskData = styles.maskRows ? generateMasks(result, pxScale, font, fontSizePx, styles) : '';    
    let pathData = generatePaths(result, pxScale, wordStarts, wordEnds, roundDecimal, styles.maskRows, maskData.ids);

    window.result = result;
    // saved incase viewbox is needed: viewbox="0 0 ${result.width*pxScale} ${result.height*pxScale}"
    // TODO: handle 'bottom' and 'right' css values by using the computed height and width.
    let resultHeight = (result.height * pxScale) + (result.baseline * pxScale);
    let resultWidth = result.width * pxScale;
    let svgHeight = Number(String(styles.height).replace('px', '')) || resultHeight;
    let svgWidth = Number(String(styles.width).replace('px', '')) || resultWidth;
    let verticalMiddle = (svgHeight - resultHeight) / 2;
    let verticalBottom = svgHeight - resultHeight;
    let verticalTop = 0;
    let offsetX = Number(String(styles.offsetX).replace('px', ''))
    let offsetY = Number(String(styles.offsetY).replace('px', ''))

    let translateX = offsetX || 0;
    let translateY = offsetY || 0;

    if (styles.verticalAlign) {
      if (styles.verticalAlign === 'middle') translateY = translateY + verticalMiddle;
      if (styles.verticalAlign === 'top') translateY = translateY + verticalTop;
      if (styles.verticalAlign === 'bottom') translateY = translateY + verticalBottom;
    }

    let svgTranslate = `transform="translate(${translateX},${translateY})"`;
    let stylesAttribute = 'style="';
    let containerStyles = 'style="';

    if (styles.top || styles.left) {
      stylesAttribute += 'position:absolute;';
      if (styles.top) stylesAttribute += `top:${styles.top};`;
      if (styles.left) stylesAttribute += `left:${styles.left};`;
    }

    if (styles.boundingBox) {
      if (styles.boundingBox === true) stylesAttribute += 'border:1px dashed red;';
      if (typeof styles.boundingBox === 'string') stylesAttribute += styles.boundingBox;
    }

    let svgDropShadow = ``;
    let svgStroke = ``;

    if (hasDropShadow) {
      // let dropShadowId = 'dropshadow' + getUid() + getTimestamp();
      let dropshadowOffsetX = toFloat(styles.dropshadowOffsetX);
      let dropshadowOffsetY = toFloat(styles.dropshadowOffsetY);
      let dropshadowBlur = 0;
      let dropshadowOpacity = toFloat(styles.dropshadowOpacity);
      let dropshadowColor = styles.dropshadowColor.charAt(0) === '#' ? hexToRgb(styles.dropshadowColor) : {r:0, g: 0, b: 0};
      let color = `rgba(${dropshadowColor.r},${dropshadowColor.g},${dropshadowColor.b},${dropshadowOpacity})`;

      if(styles.dropshadowBlur) dropshadowBlur = toFloat(styles.dropshadowBlur);
      else if(toFloat(styles.dropshadowBlurX) > 0) dropshadowBlur = toFloat(styles.dropshadowBlurX);
      else if(toFloat(styles.dropshadowBlurY) > 0) dropshadowBlur = toFloat(styles.dropshadowBlurY);
      stylesAttribute += svgDropShadow = `filter: drop-shadow(${dropshadowOffsetX}px ${dropshadowOffsetY}px ${dropshadowBlur}px ${color});`
      // svgDropShadow = `
      // <filter id="${dropShadowId}" y="${-styles.dropshadowBlurY}" height="${resultHeight + styles.dropshadowBlurY}" x="${-styles.dropshadowBlurX}" width="${resultWidth + styles.dropshadowBlurX}">
      // <feDropShadow class="dropshadow" dx="${styles.dropshadowOffsetX}" dy="${styles.dropshadowOffsetY}" stdDeviation="${styles.dropshadowBlurX} ${styles.dropshadowBlurY}" flood-color="${styles.dropshadowColor}" flood-opacity="${styles.dropshadowOpacity}"/>
      // </filter>
      // `;

      // containerStyles += `filter:url(#${dropShadowId});`;
    };

    if (hasStroke) {
      styles.strokeWidth = toFloat(styles.strokeWidth);
      svgStroke = `stroke="${styles.strokeColor}" stroke-linecap="round" stroke-width="${styles.strokeWidth}" stroke-opacity="${styles.strokeOpacity}"`;
    }

    stylesAttribute += '"';
    containerStyles += '"';

    let svgData = `
      <svg width="${svgWidth}" height="${svgHeight}" ${stylesAttribute} xmlns="http://www.w3.org/2000/svg">
        <defs>
        ${svgDropShadow}
        </defs>
        <g class="text-container" ${containerStyles} ${svgStroke} fill="${styles.color}" ${svgStroke} ${svgTranslate}>${maskData.data} ${pathData}</g>
        
      </svg>
    `;
    // console.log(svgData);
    if (container) {
      container.innerHTML = svgData;
      let svgElement = container.children[0];
      if (container.id) svgElement.setAttribute('id', container.id);
      if (container.className) svgElement.setAttribute('class', container.className);
      container.parentNode.replaceChild(svgElement, container);
      container = svgElement;
      return svgElement;
    } else {
      return svgData;
    }
  }
};

function generateMasks(result, pxScale, font, fontSize, styles) {
  let maskData = ``;
  let maskUID = '';
  let containerWidth = result.width * pxScale;
  let maxWidth = result.maxLineWidth * pxScale;
  let lineHeight = result.lineHeight * pxScale;
  let descenderHeight = -font.descender * pxScale;
  let fontHeight = descenderHeight + fontSize;
  let rowNum = -1;
  let charNum = -1;
  let wordCharNum = 0;
  let wordNum = 0;
  let strokeWidth = 0;
  // TODO: Find out why styles.strokeWidth is sometimes a number on Mac Chrome.
  if(styles.strokeWidth && typeof styles.strokeWidth === 'number') strokeWidth = styles.strokeWidth; 
  else if(styles.strokeWidth && typeof styles.strokeWidth === 'string') strokeWidth = Number(styles.strokeWidth.replace('px', ''));// get width from center of path
  let lineHeightDiff = fontHeight - lineHeight;
  let maskHeight = Math.ceil(lineHeight + lineHeightDiff) + (strokeWidth * 2);
  let maskIDs = [];

  result.glyphs.forEach(glyph => {
    charNum++;

    let position = {
      x: glyph.position[0] * pxScale,
      y: ((-glyph.position[1] * pxScale) - fontHeight + descenderHeight) - strokeWidth
    };


    if (glyph.row > rowNum) {
      let maskID = getUID(16);
      maskIDs.push(maskID);
      maskData += `<clipPath id="rowmask${maskID}"><rect class="rm${maskID} rowmask" x="${0}" y="${position.y}" width="${containerWidth}" height="${maskHeight}" /></clipPath>`;
      rowNum = glyph.row;
    }
  });

  return {
    data: maskData,
    ids: maskIDs
  }
}

function generatePaths(result, pxScale, wordStarts, wordEnds, roundDecimal, maskRows, maskIDs) {
  let maskUID = maskRows ? maskIDs[0] : '';
  let maskLink = maskRows ? `clip-path="url(#rowmask${maskUID})"` : '';
  var pathData = `<g class="rc rc1" ${maskLink}><g class="row r1">`;
  // var pathData = '';
  let rowNum = 0;
  let charNum = -1;
  let wordCharNum = 0;
  let wordNum = 0;

  result.glyphs.forEach(glyph => {
    charNum++;

    let position = {
      x: glyph.position[0] * pxScale,
      y: -glyph.position[1] * pxScale
    };


    if (glyph.row > rowNum) {
      pathData += '</g></g>';
      maskUID = maskRows ? maskIDs[glyph.row] : '';
      maskLink = maskRows ? `clip-path="url(#rowmask${maskUID})"` : '';
      if (glyph.row < result.lines.length) pathData += `<g class="rc rc${glyph.row + 1}" ${maskLink}><g class="row r${glyph.row + 1}">`;
      rowNum = glyph.row;
      charNum++;
    }

    let wordStart = wordStarts.includes(charNum);
    let wordEnd = wordEnds.includes(charNum);

    if (wordStart) {
      wordNum++;
      pathData += `<g class="word w${wordNum}">`;
    }

    if (wordStart || wordCharNum) wordCharNum++;

    if (glyph.data.name !== 'space') pathData += `<path class="letter l${wordCharNum}" d="${toSvg(glyph.data.path, pxScale, position, roundDecimal)}" />`;

    if (wordEnd) {
      pathData += '</g>\n';
      wordCharNum = 0;
    }

  });

  pathData += '</g></g>';

  return pathData;
}

function toFloat(string) {
  if (typeof string === "string") {
    return Number(string.replace(/[^\d.-]/g, ''))
  } else if (typeof string === "number") {
    return string;
  } else {
    return NaN
  }
}

function hexToRgb(hex) {
  let rgb = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
             ,(m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16));

  return { r: rgb[0], g: rgb[1], b: rgb[2] };
}

function getTimestamp() {
  return new Date().getTime()
}

function getUID(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getPx(value) {
  value = typeof value === 'string' ? parseUnit(value) : [value, 'px'];
  if (value[1] !== 'px') throw new TypeError('Expected px unit!');
  return value[0];
}
