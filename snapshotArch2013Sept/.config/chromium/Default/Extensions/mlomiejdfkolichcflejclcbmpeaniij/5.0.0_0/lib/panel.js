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
	'backbone',
	'lib/i18n',
	'tpl/panel',
	'tpl/_panel_app',
	// modules below this line do not return useful values
	'bootstrap' // jQuery Chrome
], function ($, _, Backbone, i18n, panel_tpl, panel_app_tpl) {
	var t = i18n.t;

	var Models = {
		Panel: Backbone.Model.extend({
			defaults: {
				language: 'en'
			}
		}),
		Tracker: Backbone.Model.extend({
			defaults: {
				language: 'en'
			}
		})
	},

	Collections = {
		Trackers: Backbone.Collection.extend({
			model: Models.Tracker,
			comparator: function (tracker) {
				return tracker.get('name').toLowerCase();
			}
		})
	},

	Views = {
		Panel: Backbone.View.extend({
			tagName: 'div',
			template: panel_tpl,
			initialize: function () {
				this.model.on('change:trackers change:conf', this.renderTrackers, this);
				this.model.on('change:trackers change:pauseBlocking', this.updatePauseBlocking, this);
				this.model.on('change:whitelisted change:validProtocol', this.updateWhitelistSite, this);
				this.model.on('change:trackers change:page change:pauseBlocking change:validProtocol', this.updateGhosteryFindingsText, this);
				this.model.on('change:needsReload', this.updateNeedsReload, this);
				this.model.on('change:showTutorial', this.updateTutorial, this);
				this.model.on('change:language', this.updateLanguage, this);

				this.model.set('tutorialArrowBlinkTimeout', 0);
				this.model.set('tutorialArrowBlinkInterval', 0);
				this.model.set('tooltipTimer', null);

				i18n.init(this.model.get('language'));
			},
			events: {
				'click #settings-button': 'toggleSettings',
				'click #pause-blocking-button': 'setPauseBlocking',
				'click #whitelisting-button': 'setWhitelistSite',
				'click #reload-close': 'setHideReload',
				'click #reload span': 'reloadTab',

// TODO: implement when we figure out a way to do this
/*
				'click .zero-clip': function (e) {
					var clip_link = $(e.target),
						clip_message = clip_link.siblings('.blocking-message').first(),
						source = clip_link.attr('title');

					self.port.emit('copyToClipboard', {
						text: source
					});

					clip_message.fadeIn({
						duration: 'fast',
						complete: function () {
							window.setTimeout(function () {
								clip_message.fadeOut({
									duration: 'fast'
								});
							}, 500);
						}
					});

					clip_link.bind('mouseout', function (e) {
						clip_link.unbind('mouseout');
						clip_message.hide();
						e.preventDefault();
					});

					e.preventDefault();
				},
*/

				'click #help-button, #tutorial-close': 'toggleTutorial',
				'click #tutorial-arrow-right': function (e) {
					this.tutorialNavigation('next');
					e.preventDefault();
				},
				'click #tutorial-arrow-left': function (e) {
					this.tutorialNavigation('prev');
					e.preventDefault();
				},
				'click .tutorial-control': function (e) {
					panel.tutorialNavigation(e.target);
					e.preventDefault();
				},

				'click #tutorial-support': 'handleLink',
				'click #tutorial-youtube': 'handleLink',
				'click #tutorial-email': 'handleLink',

				'click #options-button': function () {
					openTab(chrome.extension.getURL('options.html'));
					this.hidePanel();
				},
				'click #feedback-button': function () {
					openTab('http://www.ghostery.com/feedback');
					this.hidePanel();
				},
				'click #support-button': function () {
					openTab(chrome.extension.getURL('options.html#about'));
					this.hidePanel();
				},
				'click #share-button': function () {
					openTab('http://www.ghostery.com/share');
					this.hidePanel();
				}
			},

			// Render functions
			render: function () {
				this.el.innerHTML = this.template(this.model.toJSON());
				return this;
			},
			renderTrackers: function () {
				var Trackers,
					appsMap = [],
					trackers = this.model.get('trackers'),
					conf = this.model.get('conf'),
					/*page = this.model.get('page'),*/
					frag = document.createDocumentFragment(),
					validProtocol = this.model.get('validProtocol');

				if (!trackers || trackers.length === 0) {
					// Set apps div text
					this.$('#apps-div').empty();
					this.$('#apps-div')
						.append($('<div class="no-trackers"><div class="vertical-center">' +
							t(validProtocol ? 'panel_no_trackers_found' : 'panel_not_scanned') +
							'</div></div>'));
				} else {
					var page = this.model.get('page');

					this.$('#apps-div').empty().scrollTop(0);

					trackers.forEach(function (app) {
						appsMap.push({
							id: app.id,
							name: app.name,
							category: app.cat,
							sources: app.sources,
							hasCompatibilityIssue: app.hasCompatibilityIssue,
							blocked: app.blocked,
							siteSpecificUnblocked: (conf.site_specific_unblocks.hasOwnProperty(page.host) && conf.site_specific_unblocks[page.host].indexOf(+app.id) >= 0),
							globalBlocked: conf.selected_app_ids.hasOwnProperty(app.id),
							// TODO panel-wide stuff inside each model, yucky
							expand_sources: this.model.get('conf').expand_sources,
							whitelisted: this.model.get('whitelisted'),
							pauseBlocking: this.model.get('pauseBlocking'),
							page_host: page.host
						});
					}, this);

					Trackers = new Collections.Trackers(appsMap);
					Trackers.each(function (tracker) {
						frag.appendChild((new Views.Tracker({
							model: tracker
						})).render().el);
					});

					this.$('#apps-div').append(frag);
				}
			},

			// Set functions
			setPauseBlocking: function () {
				var paused = this.model.get('pauseBlocking');

				sendMessage('panelPauseToggle');
				this.model.set('pauseBlocking', !paused);
				this.setNeedsReload();
			},
			setWhitelistSite: function () {
				if (!this.model.get('validProtocol')) { return; }

				var whitelisted = this.model.get('whitelisted');

				sendMessage('panelSiteWhitelistToggle');
				this.model.set('whitelisted', !whitelisted);
				this.setNeedsReload();
			},
			setNeedsReload: function () {
				var needsReload = this.model.get('needsReload'),
					newValue;

				if (needsReload === 0) { // Reload has never been shown. Show.
					newValue = 1;
				} else if (needsReload == 1) { // Reload should be shown. Show.
					newValue = 1;
				} else { // Reload has been shown and closed. Do not show.
					newValue = -1;
				}

				sendMessage('needsReload', {
					needsReload: newValue
				});
				this.model.set('needsReload', newValue);
			},
			setHideReload: function (e) {
				sendMessage('needsReload', {
					needsReload: -1
				});

				this.model.set('needsReload', -1);
				e.stopPropagation();
				e.preventDefault();
			},

			// Update functions
			updateLanguage: function () {
				i18n.init(this.model.get('language'));
				this.render();
				this.updateGhosteryFindingsText();
			},
			updatePauseBlocking: function () {
				if (this.model.get('pauseBlocking')) {
					this.$('#pause-blocking-button').addClass('selected');
					this.$('.app-global-blocking').addClass('paused');
				} else {
					this.$('#pause-blocking-button').removeClass('selected');
					this.$('.app-global-blocking').removeClass('paused');
				}
			},
			updateWhitelistSite: function () {
				if (!this.model.get('validProtocol')) {
					this.$('#whitelisting-button').addClass('disabled');
					this.$('#website-whitelisted').hide();
					this.$('#website-url').css('color', '');
					return;
				}

				this.$('#whitelisting-button').removeClass('disabled');

				if (this.model.get('whitelisted')) {
					this.$('#website-whitelisted').show();
					this.$('#website-url').css('color', '#fff');
					this.$('#website-url').css('max-width', '115px');
					this.$('#whitelisting-button').addClass('selected');
					this.$('.app-global-blocking').addClass('whitelisted');
				} else {
					this.$('#website-whitelisted').hide();
					this.$('#website-url').css('color', '');
					this.$('#website-url').css('max-width', '');
					this.$('#whitelisting-button').removeClass('selected');
					this.$('.app-global-blocking').removeClass('whitelisted');
				}
			},
			updateGhosteryFindingsText: function () {
				var $panelTitle = this.$('#ghostery-findings-text'),
					$website_url = this.$('#website-url'),
					num_apps = (this.model.get('trackers') ? this.model.get('trackers').length : 0),
					validProtocol = this.model.get('validProtocol'),
					blocking_paused = this.model.get('pauseBlocking'),
					page = this.model.get('page');

				// Set findings panel host
				$website_url.text((validProtocol) ? page.host : '');

				// Set findings panel title
				if (blocking_paused) {
					$panelTitle.html(t('panel_title_paused'));
				} else if (!validProtocol) {
					$panelTitle.html(t('panel_title_not_scanned'));
				} else {
					$panelTitle.html(t('panel_title_' + (num_apps == 1 ? 'singular' : 'plural'), num_apps));
				}
			},
			updateNeedsReload: function () {
				if (this.model.get('needsReload') === 1) {
					this.$('#reload').animate({ height: '25px', padding: '3px' },
					{
						duration: 'fast'
					});
					this.$('#apps-div').animate({ bottom: '85px' },
					{
						duration: 'fast'
					});
				} else {
					this.$('#reload').animate({ height: '0px', padding: '0px' },
					{
						duration: 'fast'
					});
					this.$('#apps-div').animate({ bottom: '55px' },
					{
						duration: 'fast'
					});
				}
			},
			updateTutorial: function () {
				var tutorial = this.$('#tutorial-container'),
					help_button = this.$('#help-button'),
					showTutorial = this.model.get('showTutorial');

				if (showTutorial) {
					this.tutorialNavigation();
					tutorial.show();
					help_button.addClass('down');
					$(window).bind('keydown', _.bind(function (e) {
						if (e.keyCode == 39 || e.keyCode == 37) {
							this.tutorialNavigation(e.keyCode);
						}
					}, this));
				}
			},

			// Toggle functions
			toggleSettings: function () {
				this.$('#apps-div').animate({ top: (this.$('#settings').is(':visible') ? '55px' : '105px') }, {
					duration: 'fast'
				});
				this.$('#settings-button').toggleClass('selected', this.$('#settings').is(':hidden'));
				this.$('#settings').slideToggle({
					duration: 'fast',
					complete: _.bind(function () {
						this.$('#settings-button').toggleClass('selected', !this.$('#settings').is(':hidden'));
					}, this)
				});
			},
			toggleTutorial: function () {
				var tutorial = this.$('#tutorial-container'),
					help_button = this.$('#help-button');

				tutorial.toggle();

				if (tutorial.is(":visible")) {
					this.tutorialNavigation();
					help_button.addClass('down');
					$(window).bind('keydown', _.bind(function (e) {
						if (e.keyCode == 39 || e.keyCode == 37) {
							this.tutorialNavigation(e.keyCode);
						}
					}, this));
				} else {
					help_button.removeClass('down');
					$(window).unbind('keydown');
					sendMessage('panelShowTutorialSeen');
					this.model.set('showTutorial', false, { silent: true });
				}
			},

			// Helper functions
			reloadTab: function (e) {
				sendMessage('reloadTab');
				this.hidePanel();
				e.preventDefault();
			},

			hidePanel: function () {
				if (this.$('#settings').is(':visible')) {
					this.toggleSettings();
				}
				sendMessage('panelClose');
			},

			handleLink: function (e) {
				openTab(e.target.href);
				this.hidePanel();
				e.preventDefault();
			},

			tooltip: function (element) {
				var $tooltip = this.$('#tooltip');

				// Reset timer
				this.model.set('tooltipTimer', null);

				function determineLocation(windowWidth, windowHeight, mouseX, mouseY) {
					var top,
						right,
						bottom,
						left;

					if (mouseX > windowWidth / 2) {
						left = 'auto';
						right = (windowWidth - mouseX) + 'px';
					} else {
						left = mouseX + 'px';
						right = 'auto';
					}

					if (mouseY > windowHeight / 2) {
						top = 'auto';
						bottom = (windowHeight - mouseY) + 'px';
					} else {
						top = mouseY + 'px';
						bottom = 'auto';
					}

					return {
						top: top,
						right: right,
						bottom: bottom,
						left: left
					};
				}

				$(element)
					.unbind('mouseenter mouseout')
					.bind({
						mouseenter: _.bind(function (e) {
							var tooltipTimer = this.model.get('tooltipTimer');

							if (tooltipTimer !== null) {
								window.clearTimeout(tooltipTimer);
								$tooltip.text(element.getAttribute('title'));
								$tooltip.css(determineLocation($(window).width(), $(window).height(), e.pageX, e.pageY));
								$tooltip.show();
							} else {
								this.model.set('tooltipTimer', window.setTimeout(function () {
									$tooltip.text(element.getAttribute('title'));
									$tooltip.css(determineLocation($(window).width(), $(window).height(), e.pageX, e.pageY));
									$tooltip.show();
								}, 1500));
							}
						}, this),
						mouseout: _.bind(function () {
							var tooltipTimer = this.model.get('tooltipTimer');

							if (tooltipTimer !== null) {
								window.clearTimeout(tooltipTimer);
							}

							this.model.set('tooltipTimer', window.setTimeout(_.bind(function () {
								this.model.set('tooltipTimer', null);
								$tooltip.fadeOut({
									duration: 'fast'
								});
							}, this), 10));
						}, this)
					});
			},

			// Tutorial helper functions
			tutorialNavigation: function (newPosition) {
				var i,
					currScreenIndex,
					nextScreenIndex,
					$screens = this.$('.tutorial-screen'),
					$controls = this.$('.tutorial-control'),
					$arrowLeft = this.$('#tutorial-arrow-left'),
					$arrowRight = this.$('#tutorial-arrow-right');
				
				// Find current screen index
				for (i = 0; i < $screens.length; i++) {
					if ($screens.eq(i).is(':visible')) {
						currScreenIndex = i;
						break;
					}
				}

				if (!newPosition) { // Reset tutorial to first screen
					for (i = 0; i < $screens.length; i++) {
						if (i === 0) {
							$screens.eq(i).css('display', 'table');
							continue;
						}

						$screens.eq(i).hide();
					}

					nextScreenIndex = 0;
					this.blinkTutorialArrow('right', true);
					this.model.set('tutorialArrowBlinkTimeout', window.setTimeout(_.bind(function () {
						this.blinkTutorialArrow('right');
					}, this), 3000));
				} else if (newPosition == 'next' || newPosition == 39) { // Left arrow or left-arrow key
					nextScreenIndex = i + 1;
					if (nextScreenIndex > $screens.length - 1) {
						return;
					}

					this.blinkTutorialArrow('right', true);
				} else if (newPosition == 'prev' || newPosition == 37) { // Right arrow or right-arrow key
					nextScreenIndex = i - 1;
					if (nextScreenIndex < 0) {
						return;
					}

					this.blinkTutorialArrow('right', true);
				} else { // Bottom nav controls
					nextScreenIndex = parseInt(newPosition.id.replace('tutorial-control-', ''), 10) - 1;
					this.blinkTutorialArrow('right', true);
				}

				// Slide screens
				$screens.eq(currScreenIndex).hide();
				$screens.eq(nextScreenIndex).css('display', 'table');

				// Update bottom controls
				$controls.eq(currScreenIndex).removeClass('on');
				$controls.eq(nextScreenIndex).addClass('on');

				// Update arrows
				if (nextScreenIndex === 0) {
					$arrowLeft.addClass('off');
					$arrowRight.removeClass('off');
				} else if (nextScreenIndex == $screens.length - 1) {
					sendMessage('panelShowTutorialSeen');
					$arrowRight.addClass('off');
					$arrowLeft.removeClass('off');
				} else {
					$arrowLeft.removeClass('off');
					$arrowRight.removeClass('off');
				}
			},
			blinkTutorialArrow: function (direction, stop) {
				var $arrow = this.$('#tutorial-arrow-' + direction),
					count = 0;

				if (stop) {
					$arrow.removeClass('blink');
					window.clearInterval(this.model.get('tutorialArrowBlinkInterval'));
					window.clearTimeout(this.model.get('tutorialArrowBlinkTimeout'));
					return;
				}

				this.model.set('tutorialArrowBlinkInterval', window.setInterval(_.bind(function () {
					if ($arrow.hasClass('blink')) {
						$arrow.removeClass('blink');
						if (count > 6) {
							window.clearInterval(this.model.get('tutorialArrowBlinkInterval'));
							return;
						}
					} else {
						$arrow.addClass('blink');
					}
					count++;
				}, this), 500));
			}
		}),

		Tracker: Backbone.View.extend({
			tagName: 'div',
			className: 'app-div',
			template: panel_app_tpl,
			initialize: function () {
				this.model.on('change:globalBlocked', this.updateGlobalBlock, this);
				this.model.on('change:siteSpecificUnblocked', this.updateSiteSelectiveUnblock, this);
			},
			events: {
				'click .app-info-container': 'toggleSources',
				'mousedown .app-global-blocking': 'setGlobalBlock',
				'click .app-site-blocking': 'setSiteSpecificUnblock',
				'click .app-moreinfo-link': 'handleLink',
				'click .app-src-link': 'handleLink'
			},

			// Render functions
			render: function () {
				this.el.innerHTML = this.template(this.model.toJSON());

				this.$('.tracker-alert').tooltip({
					placement: function (tooltip, ele) {
						var $container = $('#apps-div'),
							containerHeight = $container.height(),
							tooltipHeight = 48,
							tooltipOffsetTop = $(ele).offset().top;

						return tooltipOffsetTop > containerHeight - tooltipHeight ? 'top' : 'bottom';
					}
				});

				return this;
			},

			// Set functions
			setGlobalBlock: function () {
				var blocked = this.model.get('globalBlocked');
				sendMessage('panelSelectedAppsUpdate', {
					app_id: this.model.get('id'),
					app_selected: !blocked
				});

				this.model.set('globalBlocked', !blocked);
				panel.setNeedsReload();
			},

			setSiteSpecificUnblock: function () {
				var unblocked = this.model.get('siteSpecificUnblocked');
				sendMessage('panelSiteSpecificUnblockUpdate', {
					app_id: this.model.get('id'),
					siteSpecificUnblocked: !unblocked
				});

				this.model.set('siteSpecificUnblocked', !unblocked);
				panel.setNeedsReload();
			},

			// Update functions
			updateGlobalBlock: function () {
				var blocked = this.model.get('globalBlocked');

				this.$('.blocking-controls')
					.tooltip('destroy')
					.tooltip({
						trigger: 'manual',
						title: t('panel_tracker_global_block_message_' + (blocked ? 'blocked' : 'unblocked')),
						placement: 'left'
					})
					.tooltip('show');

				window.clearTimeout(this.model.get('tooltipTimer'));
				this.model.set('tooltipTimer', window.setTimeout(_.bind(function () {
					this.$('.blocking-controls').tooltip('destroy');
				}, this), 1400));

				if (!blocked) {
					this.$('.app-global-blocking').animate({ 'background-position-x': '-17px' }, {
						duration: 'fast',
						complete: function () {
							$(this).removeClass('blocked').addClass('unblocked');
							$(this).parent().removeClass('blocked').addClass('unblocked');
						}
					});
				} else {
					this.$('.app-global-blocking').animate({ 'background-position-x': '3px' }, {
						duration: 'fast',
						complete: function () {
							$(this).removeClass('unblocked').addClass('blocked');
							$(this).parent().removeClass('unblocked').addClass('blocked');
						}
					});
				}
			},
			updateSiteSelectiveUnblock: function () {
				var siteSpecificUnblocked = this.model.get('siteSpecificUnblocked'),
					host = panel.model.get('page').host;

				if (siteSpecificUnblocked) {
					this.$('.blocking-controls')
						.tooltip('destroy')
						.tooltip({
							trigger: 'manual',
							html: true,
							title: t('panel_tracker_site_specific_unblock_message', host),
							placement: 'left'
						})
						.tooltip('show');

					window.clearTimeout(this.model.get('tooltipTimer'));
					this.model.set('tooltipTimer', window.setTimeout(_.bind(function () {
						this.$('.blocking-controls').tooltip('destroy');
					}, this), 1400));
				}

				if (siteSpecificUnblocked) {
					this.$('.app-site-blocking')
						.removeClass('off').addClass('on')
						.attr('title', t('panel_tracker_site_specific_unblock_tooltip_on', this.model.get('name'), host));
				} else {
					this.$('.app-site-blocking')
						.removeClass('on').addClass('off')
						.attr('title', t('panel_tracker_site_specific_unblock_tooltip_off', this.model.get('name'), host));
				}
			},

			// Toggle functions
			toggleSources: function () {
				this.$('.app-arrow').toggleClass('down', !this.$('.app-srcs-container').is(':visible'));

				this.$('.app-moreinfo').slideToggle({
					duration: 'fast'
				});

				this.$('.app-srcs-container').slideToggle({
					duration: 'fast',
					complete: _.bind(function () {
						this.$('.app-arrow').toggleClass('down', this.$('.app-srcs-container').is(':visible'));
					}, this)
				});
			},

			handleLink: function (e) {
				openTab(e.target.href);
				panel.hidePanel();
				e.preventDefault();
			}
		})
	};

	function openTab(url) {
		chrome.tabs.create({ url: url });
		window.close();
	}

	// hack to keep the above identical to safari
	// TODO standardize on messaging (lowest common denominator)
	function sendMessage(name, message) {
		if (name == 'panelClose') {
			window.close();
		} else {
			var bg = chrome.extension.getBackgroundPage();
			bg.dispatcher.trigger(name, message);
		}
	}

	var panel = new Views.Panel({
		model: new Models.Panel({})
	});

	return panel;

});
