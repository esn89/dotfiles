function mark(el) {
	if (el) {
		el.innerHTML = "✓ Installed";
		el.className += " success";
		// don't want to inline install (like for Chrome)
		el.removeAttribute('onclick');
	}
}

var old_top_img = document.getElementById('img_dl_top'),
	old_bottom_img = document.getElementById('img_dl_bottom');

// old front page
if (old_top_img && old_bottom_img) {
	old_top_img.src = '/images/downloadGhostery1_installed.png';
	old_bottom_img.src = '/images/downloadGhostery2_blank.png';

	// don't want to inline install (like for Chrome)
	old_top_img.parentNode.removeAttribute('onclick');
	old_bottom_img.parentNode.removeAttribute('onclick');

} else {
	// new nav bar
	// note that ghostery_download_top is on both new and old sites (on the front page of the old site)
	var download_header = document.getElementById('ghostery_download_top');
	if (download_header) {
		mark(download_header.getElementsByTagName('button')[0]);
	}

	// new front page
	var new_front_page = document.getElementById('ghostery_download_button');
	if (new_front_page) {
		mark(new_front_page.getElementsByTagName('button')[0]);
	}

	// both new and old download pages
	mark(document.getElementById('chrome-dl-link'));
}
