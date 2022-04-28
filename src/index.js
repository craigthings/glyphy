const opentype = require("opentype.js");
const generateSVG = require('./generateSvg');

let glyphy = {
	makeSVG: function(container, text, fontURL, styles, decimalRound){
		return new Promise((resolve, reject) => {
			opentype.load(fontURL, function (err, font) {
				if (err) reject(err);		
				
				let newContainer = generateSVG(container, font, text, decimalRound, styles);

				resolve(newContainer);
			});
		});
	},
	svgData: function(text, fontRef, styles, decimalRound){
		return new Promise((resolve, reject) => {
			if(typeof fontRef === 'string') {
				opentype.load(fontRef, function (err, font) {
					if (err) reject(err);		
					
					let svgData = generateSVG(null, font, text, decimalRound, styles);
					resolve(svgData);
				});
			} else {
				let font = opentype.parse(fontRef);
				let svgData = generateSVG(null, font, text, decimalRound, styles);
				resolve(svgData);
			}
		});
	},
	svgDataSync: function(text, fontRef, styles, decimalRound){
		let font = opentype.parse(fontRef);
		let svgData = generateSVG(null, font, text, decimalRound, styles);
		return svgData;
	}

}

module.exports = glyphy;