/*jshint unused:false */
var require = {
	baseUrl: window.location.protocol + "//" + window.location.host + window.location.pathname.split("/").slice(0, -1).join("/"),
	paths: {
		tpl: "templates/precompiled",
		jquery: "lib/vendor/jquery-1.7.2",
		underscore: "lib/vendor/underscore-1.4.3",
		backbone: "lib/vendor/backbone-0.9.10",
		parseuri: "lib/vendor/parseuri",
		apprise: "lib/vendor/apprise/apprise-1.5.full",
		tiptip: "lib/vendor/tipTip/jquery.tipTip",
		moment: "lib/vendor/moment/moment",
		moment_i18n: "lib/vendor/moment/lang/all",
		scrollintogreatness: "lib/jquery.scrollintogreatness-2.0.0",
		bootstrap: "lib/vendor/bootstrap/bootstrap"
	},
	shim: {
		underscore: {
			exports: "_"
		},
		backbone: {
			deps: ["underscore", "jquery"],
			exports: "Backbone"
		},
		parseuri: {
			exports: "parseUri"
		},
		apprise: {
			exports: "apprise"
		},
		tiptip: {
			deps: ["jquery"]
		},
		scrollintogreatness: {
			deps: ["jquery"]
		},
		moment_i18n: {
			deps: ["moment"]
		},
		bootstrap: {
			deps: ["jquery"]
		}
	},
	waitSeconds: 0
};
