/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2013 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

define([
	'jquery',
	'underscore',
	'lib/utils'
], function ($, _, utils) {

	this.db = {};

	var UpdatableMixin = {

		_localFetcher: function () {
			var memory = utils.prefs(this.type);

			// nothing in storage, or it's so old it doesn't have a version
			if (!memory || !memory[this.type + 'Version']) {
				// return what's on disk
				utils.log('fetching ' + this.type + ' from disk');
				return JSON.parse(utils.syncGet('data/' + this.type + '.json'));
			}

			// on upgrades, see if bugs.json shipped w/ the extension is more recent
			if (this.just_upgraded) {
				var disk = JSON.parse(utils.syncGet('data/' + this.type + '.json'));
				// TODO should be doing > instead of != once we convert all versions to timestamps
				// TODO keeping this logic until a post 5.0 update to work
				// around users with a hash-based version in memory (shouldn't
				// have any more hash-based versions after 5.0)
				if (disk[this.type + 'Version'] != memory[this.type + 'Version']) {
					utils.log('fetching ' + this.type + ' from disk');
					return disk;
				}
			}

			utils.log('fetching ' + this.type + ' from memory');
			return memory;
		},

		_downloadList: function (callback) {
			var UPDATE_URL = 'https://www.ghostery.com/update/' + this.type + '?format=json';

			$.ajax({
				cache: false,
				dataType: 'json',
				url: UPDATE_URL,
				complete: function (xhr, status) {
					var list;

					if (status == 'success') {
						try {
							list = JSON.parse(xhr.responseText);
						} catch (e) {}
					}

					if (list) { // success
						callback(true, list);
					} else { // error
						callback(false);
					}
				}
			});
		},

		// asynchronous
		_remoteFetcher: function (version, callback) {
			// TODO handle the nothing changed case
			// TODO should be doing > instead of != once we convert all versions to timestamps
			if (!this.db.version || !version || version != this.db.version) {
				utils.log('fetching ' + this.type + ' from remote');
				this._downloadList(callback);
			} else {
				// already up-to-date
				callback(true);
			}
		},

		// both fetchers return a bugs object to be processed
		// TODO strategy pattern?
		_loadList: function (options) {
			options = options || {};

			// synchronous
			// TODO make async for consistency w/ remote fetching
			if (!options.remote) {
				return this.processList(
					this._localFetcher()
				);
			}

			// asynchronous
			this._remoteFetcher(options.version, _.bind(function (result, list) {
				if (result && list) {
					result = this.processList(list);
				}

				if (result) {
					// note: only when fetching from ghostery.com
					utils.prefs(this.type + '_last_updated', (new Date()).getTime());
				}

				if (options.callback) {
					// TODO notify the user in the nothing changed case
					// TODO if we stop updating bugs_last_updated in the nothing changed case,
					// TODO let's make sure to fix the autoupdate logic
					options.callback(result);
				}
			}, this));
		},

		update: function (version, callback) {
			var opts = {
				remote: true,
				version: version,
				callback: callback
			};

			if (_.isFunction(version)) {
				opts.callback = version;
				delete opts.version;
			}

			this._loadList(opts);
		},

		init: function (just_upgraded) {
			this.just_upgraded = just_upgraded;
			return this._loadList();
		}
	};

	return UpdatableMixin;

});
