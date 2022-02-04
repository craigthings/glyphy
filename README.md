# 🖋 Gylphy
Draw text as graphics using custom fonts

## How to develop and build

```bash
npm run build:prod    # Build library for portable use.
npm run dev    # Run the demo as a live dev server.
```

## Analysis of bundle file weight

```bash
npm run build:dev -- --env.addons bundleanalyzer
npm run build:production -- --env.addons bundleanalyzer
```

## Version History

#### v0.1.10
- Bug fix for strokeWidth issue.

#### v0.1.9
- Bug fix for row masks.

#### v0.1.8
- Fixed row mask issue in Safari.

#### v0.1.7
- Fixed issue where row elements couldn't be moved separate from a row mask.

#### v0.1.6
- Added support for masking rows of text.
- Fixed bug where dropshadow were getting cut off.

#### v0.1.5
- Added more styling support: 
    - Dropshadow: offset, blur, color, and opacity.
    - Stroke: color, linecap, width, and opacity.
- Added "boundingBox" switch for showing the bounding box of the gliphy text element.