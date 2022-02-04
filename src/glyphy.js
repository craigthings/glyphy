import opentype from "opentype.js";
import generateSVG from './generateSvg';
import 'babel-polyfill';
import { type } from "os";

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
	svgData: function(text, fontURL, styles, decimalRound){
		return new Promise((resolve, reject) => {
			opentype.load(fontURL, function (err, font) {
				if (err) reject(err);		
				
				let svgData = generateSVG(null, font, text, decimalRound, styles);
				resolve(svgData);
			});
		});
	}
}

window.glyphy = glyphy;

export default glyphy;