import './index.html';
import glyphy from '../src/index';


let text = "Brawny gods! ^Jim's  bird \nflocked up to\n quiz and\nget him.";
let font = "https://fonts.gstatic.com/s/shadowsintolight/v9/UqyNK9UOIntux_czAvDQx_ZcHqZXBNQzdcD_.woff";
let roundToDecimal = 1;
let styles = {
	color: 'orange',
	fontSize: '30px',
	textAlign: 'center', // options: left, right, center
	verticalAlign: 'middle', // options: top, bottom, middle
	letterSpacing: '0px',
	lineHeight: '40px',
	top: '50px',
	left: '20px',
	offsetX: '0px',
	offsetY: '0px',
	width: '800px', // cannot use percentage
	height: '800px', // cannot use percentage
	boundingBox: true,
	dropshadowColor: 'black',
	dropshadowBlurX: 3,
	dropshadowBlurY: 3,
	dropshadowOffsetX: '20px',
	dropshadowOffsetY: '20px',
	dropshadowOpacity: 0.2,
	strokeColor: 'blue',
	strokeWidth: '2px',
	strokeOpacity: 0.5,
	maskRows: true,
};

function main() {
	nodeForEachPolyfill();

	glyphy.makeSVG(
		document.querySelector('#demo-text'),
		text,
		font,
		styles,
		roundToDecimal
	).then((container) => {
		// gsap.set('.letter', {rotation:0.001});
		gsap.from('.word', { stagger: 0.15, duration: 1.5, y: 70, fill: 'blue', autoAlpha: 0, transformOrigin: '50% 50%', ease: 'power3.out' });
		// gsap.to('.w6', { yoyo: true, repeat: 1, delay: 1.5, duration: 0.5, scale: 1.7, transformOrigin: '50% 50%', ease: 'power3.inOut' });
		// document.querySelectorAll('.w6 .letter').forEach(elem => {
			// gsap.to(elem, { yoyo: true, repeat: 1, stagger: 0.3, delay: 1.6, duration: 0.5, fill: 'red', rotation: (Math.random() * 120) - 60, transformOrigin: '50% 50%', ease: 'power3.inOut' });
		// });
		// gsap.to('.r5', { duration: 1, delay: 2, yoyo: true, repeat: 1, scale: 1.5, transformOrigin: '50% 50%', ease: 'power3.inOut' });
		// gsap.to('.letter', { stagger: 0.01, delay: 2.5, duration: 1.75, x: 25, y: 20, rotation: 20, scale: 0.7, fill: 'teal', transformOrigin: '50% 50%', ease: 'power3.inOut' });
		// gsap.to('#demo-text .dropshadow', { delay: 2.5, duration: 2.25, attr: { dx: 0, dy: 0, stdDeviation: 0 }, ease: 'power3.inOut' });
	});

	glyphy.svgData(
		text,
		font,
		styles,
		roundToDecimal
	).then((svgData) => {
		console.log(svgData);
	});
}

function nodeForEachPolyfill() {
	// ie11 polyfill
	if ('NodeList' in window && !NodeList.prototype.forEach) {
		NodeList.prototype.forEach = function (callback, thisArg) {
			thisArg = thisArg || window;
			for (var i = 0; i < this.length; i++) {
				callback.call(thisArg, this[i], i, this);
			}
		};
	}
}


window.onload = main;






