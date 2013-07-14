var el = document.getElementById('chrome-dl-link');

if (el) {
	el.innerHTML = "✓ Installed";
	el.className += " success";
	el.removeAttribute('onclick');
}

var top_img = document.getElementById('img_dl_top'),
	bottom_img = document.getElementById('img_dl_bottom');

if (top_img && bottom_img) {
	top_img.src = '/images/downloadGhostery1_installed.png';
	bottom_img.src = '/images/downloadGhostery2_blank.png';

	top_img.parentNode.removeAttribute('onclick');
	bottom_img.parentNode.removeAttribute('onclick');
}
