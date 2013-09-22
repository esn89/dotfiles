/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2013 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

// TODO kick off ghostery_core with this

define([
	'jquery',
	'underscore',
	'backbone',
	'lib/i18n',
	'tpl/_app',
	'tpl/_app_info',
	'tpl/_category',
	// modules below this line do not return useful values
	'scrollintogreatness',
	'tiptip'
], function ($, _, Backbone, i18n, app_tpl, app_info_tpl, category_tpl) {

	function t_blocking_summary(num_selected, num_total, small) {
		if (num_selected === 0) {
			if (small) {
				return i18n.t('blocking_summary_none_small');
			} else {
				return i18n.t('blocking_summary_none');
			}
		} else if (num_selected === num_total) {
			if (small) {
				return i18n.t('blocking_summary_all_small');
			} else {
				return i18n.t('blocking_summary_all');
			}
		} else {
			if (small) {
				return i18n.t('blocking_summary_small', num_selected, num_total);
			} else {
				return i18n.t('blocking_summary', num_selected, num_total);
			}
		}
	}

	var dispatcher = _.clone(Backbone.Events);

	var AppInfo = Backbone.Model.extend({
		defaults: {
			hidden: true,
			loading: true,
			success: false
		},
		sync: function (method, model, opts) {
			$.ajax({
				dataType: 'json',
				url: 'https://www.ghostery.com/apps/' + encodeURIComponent(model.get('name').replace(/\s+/g, '_').toLowerCase()) + '?format=json',
				success: function (data) {
					data.success = true;
					data.loading = false;
					opts.success(model, data);
				},
				error: function () {
					model.set('loading', false);
				}
			});
		}
	});

	var AppInfoView = Backbone.View.extend({
		tagName: 'tr',
		template: app_info_tpl,

		initialize: function () {
			this.model.on('change:hidden', this.toggleContents, this);

			this.model.on('change:loading', function () {
				if (this.model.get('hidden')) {
					this.render();
				} else {
					this.model.set('hidden', true, { silent: true });
					this.render();
					this.model.set('hidden', false);
				}
			}, this);

			this.model.fetch();
		},

		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		toggleContents: function () {
			var $el = this.$el;

			if (this.model.get('hidden')) {
				this.$el.find('div').slideUp(null, function () {
					$el.hide();
				});
			} else {
				this.$el.show().find('div').slideDown(null, function () {
					$el.scrollIntoGreatness();
				});
			}
		}
	});

	var App = Backbone.Model.extend({
		defaults: {
			hidden: false
		}
	});

	var AppView = Backbone.View.extend({
		tagName: 'tr',
		className: 'app-row',
		attributes: {
			role: 'row'
		},
		template: app_tpl,

		initialize: function () {
			this.model.on('change:hidden', this.toggleVisibility, this);
			this.model.on('change:selected', this.updateCheckbox, this);
		},

		events: {
			'click .app-checkbox': function (e) {
				this.model.set('selected', e.target.checked);
			},
			'click a': function (e) {
				e.preventDefault();

				if (!this.appInfo) {
					// create the app info model
					this.appInfo = new AppInfo({
						name: this.model.get('name')
					});

					// render it
					this.$el.after((new AppInfoView({
						model: this.appInfo
					})).render().el);

					// listen to app info open events
					dispatcher.on('app:info:open', function (app_id) {
						if (app_id != this.model.get('id')) {
							// close our app info
							this.appInfo.set('hidden', true);
						}
					}, this);
				}

				this.toggleAppInfo();
			}
		},

		render: function () {
			// TODO better idiom for toggling this.$el's visiblity?
			this.$el.toggleClass('hidden', this.model.get('hidden'));

			this.el.innerHTML = this.template(this.model.toJSON());

			return this;
		},

		toggleAppInfo: function () {
			this.appInfo.set('hidden', !this.appInfo.get('hidden'));

			if (!this.appInfo.get('hidden')) {
				dispatcher.trigger('app:info:open', this.model.get('id'));
			}
		},

		updateCheckbox: function () {
			this.$el.find('input[type=checkbox]').prop('checked', this.model.get('selected'));
		},

		toggleVisibility: function () {
			// TODO better idiom for toggling this.$el's visiblity?
			this.$el.toggleClass('hidden', this.model.get('hidden'));

			if (this.appInfo) {
				if (this.model.get('hidden')) {
					this.appInfo.set('hidden', true);
				}
			}
		}
	});

	var Apps = Backbone.Collection.extend({
		model: App,
		comparator: function (app) {
			return app.get('name').toLowerCase();
		}
	});

	var Category = Backbone.Model.extend({
		defaults: {
			collapsed: true,
			hidden: false
		},
		getAppStats: function () {
			var apps = this.get('apps'),
				visible_apps = apps.where({
					hidden: false
				});
			return {
				// TODO https://github.com/documentcloud/underscore/issues/648
				num_selected: _.filter(visible_apps, function (app) {
					return app.get('selected');
				}).length,
				num_total: apps.length,
				num_visible: visible_apps.length
			};
		}
	});

	var Categories = Backbone.Collection.extend({
		model: Category,
		comparator: function (cat) {
			return cat.get('name').toLowerCase();
		}
	});

	var CategoryView = Backbone.View.extend({
		tagName: 'tr',
		template: category_tpl,

		initialize: function () {
			this.model.on('change:collapsed', this.toggleContents, this);

			this.model.on('change:hidden', this.toggleVisibility, this);

			// re-render the category header row to update its checkbox and stats
			this.model.get('apps').on('change',
				_.debounce(this.renderHeader, 100), this);

			this.model.get('apps').on('change:hidden',
				_.debounce(function () {
					this.hideAndOrCollapse();
					this.stripeAppRows();
				}, 100), this);

			// Remove hover in response to keyboard-based app filtering.
			// Necessary since this lets you shift (and hide) categories
			// w/o moving the mouse, which can lead to stale hover styling.
			dispatcher.on('browser:filter:keyboard', function () {
				this.$categoryEl.removeClass('hover');
			}, this);
		},

		events: {
			// toggle selection for all apps in this category
			'click .cat-checkbox': function (e) {
				this.model.get('apps').each(function (app) {
					if (!app.get('hidden')) {
						app.set('selected', e.target.checked);
					}
				});
			},
			'click .category-row': function (e) {
				if (e.target.className != 'cat-checkbox') {
					var collapse = !this.model.get('collapsed');
					this.model.set('collapsed', collapse);
					if (!collapse) {
						$("html,body").animate({
							scrollTop: this.$categoryEl.offset().top - 50
						});
					}
				}
			},
			'mouseenter .apps-row': 'hover',
			'mouseleave .apps-row': 'hover'
		},

		render: function () {
			//console.log('rendering %s category ...', this.model.get('id').toUpperCase());

			this.$el.html('<td colspan="4"><table class="category-row"></table><div class="apps-row-container" style="display: block;">' +
			'<table class="apps-row" style="display: table;"></table></div></td>');

			this.$categoryEl = this.$('table').first();
			this.$appsEl = this.$('table').last();
			this.$appsContainer = this.$('.apps-row-container');

			//this.$appsEl.toggle(!this.model.get('collapsed'));
			this.$appsContainer.toggle(!this.model.get('collapsed'));

			return this.renderHeader();
		},

		renderHeader: function () {
			//console.log('rendering %s category header ...', this.model.get('id').toUpperCase());

			var stats = this.model.getAppStats();

			this.model.set('all_selected', stats.num_visible == stats.num_selected);

			this.$categoryEl.html(this.template(
				_.extend({}, this.model.toJSON(), { t_blocking_summary: t_blocking_summary })
			));

			// setting indeterminate in the HTML template doesn't seem to work
			this.$categoryEl.find('.cat-checkbox').prop('indeterminate',
				stats.num_visible != stats.num_selected && !!stats.num_selected);

			this.$('.category-name').tipTip({
				defaultPosition: 'right',
				maxWidth: '300px'
			});

			return this;
		},

		renderApps: function () {
			if (this.$appsEl.children().length === 0) {
				//console.log('rendering %s category apps ...', this.model.get('id').toUpperCase());

				this.model.get('apps').each(function (app) {
					this.$appsEl[0].appendChild((new AppView({
						model: app
					})).render().el);
				}, this);

				this.stripeAppRows();
			}

			this.$appsContainer.slideDown();

			return this;
		},

		hover: function (e) {
			this.$categoryEl.toggleClass('hover', e.type == 'mouseenter');
		},

		toggleContents: function () {
			this.renderHeader();

			if (this.model.get('collapsed')) {
				this.$appsContainer.slideUp();
			} else {
				this.renderApps();
			}
		},

		toggleVisibility: function () {
			if (this.model.get('hidden')) {
				this.model.set('collapsed', true);
				this.$el.hide();
			} else {
				this.renderHeader();
				this.$el.show();
			}
		},

		stripeAppRows: function () {
			//console.log('striping %s category ...', this.model.get('id').toUpperCase());

			this.$appsEl.find('.app-row').not('.hidden')
				.removeClass('alt-row')
				.filter(':even').addClass('alt-row');
		},

		hideAndOrCollapse: function () {
			var stats = this.model.getAppStats(),
				all_apps_hidden = stats.num_visible === 0,
				all_apps_shown = stats.num_total == stats.num_visible;

			this.model.set('hidden', all_apps_hidden);
			this.model.set('collapsed', all_apps_hidden || all_apps_shown);
		}
	});

	var AppBrowser = Backbone.View.extend({
		initialize: function (opts) {
			// TODO this.categories vs. this.get('categories')
			this.categories = opts.categories;

			this.new_app_ids = opts.new_app_ids;

			this.categories.on('reset', function () {
				this.$('#trackers').empty();
				this.addAllCategories();
			}, this);

			this.addAllCategories();

			this.$type_filter = $('#app-list-filter-type');
			this.$name_filter = $('#app-list-filter-name');
		},

		getVisible: function () {
			return this.categories.where({ hidden: false });
		},

		events: function () {
			var events = {
				'click #app-list-reset-search': function (e) {
					e.preventDefault();
					// TODO why doesn't changing the select box trigger its change event?
					this.$type_filter.val('all');
					this.$name_filter.val('');
					this.filter();
				},
				'click #expand-all': function (e) {
					e.preventDefault();
					this.getVisible().forEach(function (category) {
						category.set('collapsed', false);
					});
				},
				'click #collapse-all': function (e) {
					e.preventDefault();
					this.getVisible().forEach(function (category) {
						category.set('collapsed', true);
					});
				},
				'click #select-all': function (e) {
					e.preventDefault();
					this.getVisible().forEach(function (category) {
						category.get('apps').each(function (app) {
							if (!app.get('hidden')) {
								app.set('selected', true);
							}
						});
					});
				},
				'click #select-none': function (e) {
					e.preventDefault();
					this.getVisible().forEach(function (category) {
						category.get('apps').each(function (app) {
							if (!app.get('hidden')) {
								app.set('selected', false);
							}
						});
					});
				}
			};

			events['change #' + this.$type_filter[0].id] = this.filter;
			events['keyup #' + this.$name_filter[0].id] = _.debounce(function () {
				dispatcher.trigger('browser:filter:keyboard');
				this.filter();
			}, 300);

			return events;
		},

		// TODO show a spinner when searching?
		filter: function () {
			var hide,
				type = this.$type_filter.val(),
				name = this.$name_filter.val(),
				new_app_ids = this.new_app_ids;

			this.categories.each(function (category) {
				category.get('apps').each(function (app) {
					hide = false;

					if (!hide && type != 'all') {
						if (type == 'unblocked' && app.get('selected')) {
							hide = true;
						} else if (type == 'blocked' && !app.get('selected')) {
							hide = true;
						} else if (type == 'new' && new_app_ids && new_app_ids.indexOf(app.get('id')) == -1) {
							hide = true;
						}
					}

					if (!hide && name !== '' && app.get('name').toLowerCase().indexOf(name.toLowerCase()) == -1) {
						hide = true;
					}

					app.set('hidden', hide);
				});
			});
		},

		addCategory: function (category) {
			this.$('#trackers').append(
				(new CategoryView({
					model: category
				})).render().el
			);

			// re-render on app selection changes to update stats
			category.get('apps').on('change:selected', _.debounce(this.render, 100), this);

			// show "no results" when all categories are hidden; hide it otherwise
			category.on('change:hidden', function () {
				var visible = !!this.getVisible().length;
				// TODO link to http://www.ghostery.com/database/changelog maybe when filtering for "new" trackers and there is nothing to show
				// TODO https://getsatisfaction.com/ghostery/topics/update_notices_but_no_new_trackers
				$('#no-results').toggle(!visible);
				$('#app-toggles').toggle(visible);
			}, this);
		},

		addAllCategories: function () {
			this.categories.each(function (cat) {
				this.addCategory(cat);
			}, this);

			// TODO should this be triggered by an event instead?
			this.render();
		},

		render: function () {
			var num_selected = 0,
				num_total = 0;

			this.categories.each(function (category) {
				var apps = category.get('apps');
				num_selected += apps.where({ selected: true }).length;
				num_total += apps.length;
			});

			$('#block-status').html(t_blocking_summary(num_selected, num_total));
		},

		getSelectedAppIds: function () {
			return this.categories.chain()
				// get all the selected app IDs for each category
				.map(function (cat) {
					// TODO https://github.com/documentcloud/underscore/issues/648
					return cat.get('apps').chain().filter(function (app) {
						return app.get('selected');
					}).pluck('id').value();
				})
				// into a single array
				.flatten()
				// convert the array to a hash
				.reduce(function (memo, app_id) {
					memo[app_id] = 1;
					return memo;
				}, {})
				.value();
		}
	});

	function getCategories(bugdb, selected_app_ids) {
		return _.map(bugdb.cats, function (apps, category) {
			return {
				id: category,
				name: i18n.t("category_" + category),
				apps: new Apps(
					_.map(apps, function (dummy, app_id) {
						var app = bugdb.apps[app_id];
						return {
							id: +app_id,
							name: app.name,
							category: app.cat,
							selected: selected_app_ids.hasOwnProperty(app_id)
						};
					})
				)
			};
		});
	}

	return {
		AppBrowser: AppBrowser,
		// TODO these two are awkward, refactor
		Categories: Categories,
		getCategories: getCategories,
		init: function (lang) {
			i18n.init(lang);
		}
	};

});
