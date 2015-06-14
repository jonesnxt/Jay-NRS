/******************************************************************************
 * Copyright © 2013-2015 The Nxt Core Developers.                             *
 *                                                                            *
 * See the AUTHORS.txt, DEVELOPER-AGREEMENT.txt and LICENSE.txt files at      *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Nxt software, including this file, may be copied, modified, propagated,    *
 * or distributed except according to the terms contained in the LICENSE.txt  *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

/**
 * @depends {nrs.js}
 */
var NRS = (function(NRS, $, undefined) {
	NRS.newlyCreatedAccount = false;

	NRS.allowLoginViaEnter = function () {
	    $("#login_account_other").keypress(function (e) {
	        if (e.which == '13') {
	            e.preventDefault();
	            var account = $("#login_account_other").val();
	            NRS.login(account);
	        }
	    });

		$("#login_alias").keypress(function (e) {
		    if (e.which == '13') {
		        e.preventDefault();
		        NRS.checkAliasAccountBeforeLogin($('#login_alias').val());
		    }
		});
	}

	NRS.showLoginOrWelcomeScreen = function() {
		if (NRS.hasLocalStorage && localStorage.getItem("logged_in")) {
			NRS.showLoginScreen();
		} else {
		    NRS.showLoginScreen();
		}
	}

	NRS.showLoginScreen = function() {
		$("#account_phrase_custom_panel, #account_phrase_generator_panel, #welcome_panel, #custom_passphrase_link").hide();
		$("#account_phrase_custom_panel :input:not(:button):not([type=submit])").val("");
		$("#account_phrase_generator_panel :input:not(:button):not([type=submit])").val("");
        $("#login_account_other").mask("NXT-****-****-****-*****");
        
		$("#login_panel").show();
		setTimeout(function() {
		    $("#login_account_other").focus()
		}, 10);
	}

	NRS.showWelcomeScreen = function() {
		$("#login_panel, #account_phrase_generator_panel, #account_phrase_custom_panel, #welcome_panel, #custom_passphrase_link").hide();
		$("#welcome_panel").show();
	}

	NRS.registerUserDefinedAccount = function() {
		$("#account_phrase_generator_panel, #login_panel, #welcome_panel, #custom_passphrase_link").hide();
		$("#account_phrase_custom_panel :input:not(:button):not([type=submit])").val("");
		$("#account_phrase_generator_panel :input:not(:button):not([type=submit])").val("");
		$("#account_phrase_custom_panel").show();
		$("#registration_password").focus();
	}

	NRS.registerAccount = function() {
		$("#login_panel, #welcome_panel").hide();
		$("#account_phrase_generator_panel").show();
		$("#account_phrase_generator_panel .step_3 .callout").hide();

		var $loading = $("#account_phrase_generator_loading");
		var $loaded = $("#account_phrase_generator_loaded");

		if (window.crypto || window.msCrypto) {
			$loading.find("span.loading_text").html($.t("generating_passphrase_wait"));
		}

		$loading.show();
		$loaded.hide();

		if (typeof PassPhraseGenerator == "undefined") {
			$.when(
				$.getScript("js/crypto/3rdparty/seedrandom.js"),
				$.getScript("js/crypto/passphrasegenerator.js")
			).done(function() {
				$loading.hide();
				$loaded.show();

				PassPhraseGenerator.generatePassPhrase("#account_phrase_generator_panel");
			}).fail(function(jqxhr, settings, exception) {
				alert($.t("error_word_list"));
			});
		} else {
			$loading.hide();
			$loaded.show();

			PassPhraseGenerator.generatePassPhrase("#account_phrase_generator_panel");
		}
	}

	NRS.verifyGeneratedPassphrase = function() {
		var password = $.trim($("#account_phrase_generator_panel .step_3 textarea").val());

		if (password != PassPhraseGenerator.passPhrase) {
			$("#account_phrase_generator_panel .step_3 .callout").show();
		} else {
			NRS.newlyCreatedAccount = true;
			NRS.login(true,password);
			PassPhraseGenerator.reset();
			$("#account_phrase_generator_panel textarea").val("");
			$("#account_phrase_generator_panel .step_3 .callout").hide();
		}
	}

	$("#account_phrase_custom_panel form").submit(function(event) {
		event.preventDefault()

		var password = $("#registration_password").val();
		var repeat = $("#registration_password_repeat").val();

		var error = "";

		if (password.length < 35) {
			error = $.t("error_passphrase_length");
		} else if (password.length < 50 && (!password.match(/[A-Z]/) || !password.match(/[0-9]/))) {
			error = $.t("error_passphrase_strength");
		} else if (password != repeat) {
			error = $.t("error_passphrase_match");
		}

		if (error) {
			$("#account_phrase_custom_panel .callout").first().removeClass("callout-info").addClass("callout-danger").html(error);
		} else {
			$("#registration_password, #registration_password_repeat").val("");
			NRS.login(true, password);
		}
	});

	NRS.listAccounts = function (type) {
	    //type 1=account,2=alias
	    $('#login_account').empty();
	    switch (type) {
	        case 1:
	            $('#login_alias_container').hide();
	            if (NRS.getCookie("savedNxtAccounts") && NRS.getCookie("savedNxtAccounts") != "") {
	                $('#login_account_list').show();
	                $('#login_account_container').hide();
	                var accounts = NRS.getCookie("savedNxtAccounts").split(";");
	                $.each(accounts, function (index, account) {
	                    if (account != '') {
	                        $('#login_account')
                            .append($("<li></li>")
                                .append($("<a></a>")
                                    .attr("href", "#")
                                    .attr("style", "display: inline-block;width: 360px;")
                                    .attr("onClick", "NRS.login('" + account + "')")
                                    .text(account))
                                .append($('<button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>')
                                    .attr("onClick", "NRS.removeAccount(1,'" + account + "')")
                                    .attr("style", "margin-right:5px"))
                            );
	                    }
	                });
	                $('#login_account')
                    .append($("<li></li>")
                        .append($("<a></a>")
                            .attr("href", "#")
                            .attr("style", "display: inline-block;width: 380px;")
                            .attr("onClick", "$('#login_account_list').hide();$('#login_account_container').css('display','table');")
                            .text("Other"))
                    );
	            } else {
	                $('#login_account_list').hide();
	                $("#login_account_container").css("display", "table");
                }
	            break;
	        case 2:
	            $('#login_account_container').hide();
	            if (NRS.getCookie("savedNxtAlias") && NRS.getCookie("savedNxtAlias") != "") {
	                $('#login_account_list').show();
	                $('#login_alias_container').hide();
	                var accounts = NRS.getCookie("savedNxtAlias").split(";");
	                $.each(accounts, function (index, account) {
	                    if (account != '') {
	                        $('#login_account')
                            .append($("<li></li>")
                                .append($("<a></a>")
                                    .attr("href", "#")
                                    .attr("style", "display: inline-block;width: 360px;")
                                    .attr("onClick", "NRS.checkAliasAccountBeforeLogin('" + account + "')")
                                    .text(account))
                                .append($('<button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>')
                                    .attr("onClick", "NRS.removeAccount(2,'" + account + "')")
                                    .attr("style", "margin-right:5px"))
                            );
	                    }
	                });
	                $('#login_account')
                    .append($("<li></li>")
                        .append($("<a></a>")
                            .attr("href", "#")
                            .attr("style", "display: inline-block;width: 380px;")
                            .attr("onClick", "$('#login_account_list').hide();$('#login_alias_container').css('display','table');")
                            .text("Other"))
                    );
	            } else {
	                $('#login_account_list').hide();
	                $("#login_alias_container").css("display", "table");
	            }
	            break;
	    }
	}

	NRS.switchAccount = function (account) {
	    NRS.setDecryptionPassword("");
	    NRS.setPassword("");
	    var url = window.location.pathname;
	    url += '?account=' + account;
	    window.location.href = url;
	}

	$("#loginButtons").on('click', function (e) {
	    e.preventDefault();
	    if ($(this).data("login-type") == "account") {
	        NRS.listAccounts(1);
	        $("#remember_account_container").show();
	        $("#remember_alias_container").hide();
	        $("#login_account_list_label").text("Select an Account to Login with");
	        $(this).html('<input type="hidden" name="loginType" id="accountLogin" value="account" autocomplete="off" /><i class="fa fa-male"></i>');
	        $(this).data("login-type", "alias");
	        setTimeout(function () {
	            $("#login_account_other").focus()
	        }, 10);
	    }
	    else {
	        NRS.listAccounts(2);
	        $("#remember_account_container").hide();
	        $("#remember_alias_container").show();
	        $("#login_account_list_label").text("Select an Alias to Login with");
	        $(this).html('<input type="hidden" name="loginType" id="accountLogin" value="passwordLogin" autocomplete="off" /><i class="fa fa-bookmark"></i>');
	        $(this).data("login-type", "account");
	        setTimeout(function () {
	            $("#login_alias").focus()
	        }, 10);
	    }
	});

	NRS.removeAccount = function (type, account) {
	    //type 1=account,2=alias
	    var cookies;
	    if (type == 1) {
	        cookies = "savedNxtAccounts";
	    } else {
	        cookies = "savedNxtAlias";
	    }

	    var accounts = NRS.getCookie(cookies).replace(account + ';', '');
	    if (accounts == '')
	        NRS.deleteCookie(cookies);
	    else
	        NRS.setCookie(cookies, accounts, 30);
	    NRS.listAccounts(type);
	}

	NRS.login = function (account, callback) {
	    //type 1=account,2=alias
	    NRS.sendRequest("getBlockchainStatus", {}, function(response) {
			if (response.errorCode) {
				$.growl($.t("error_server_connect"), {
					"type": "danger",
					"offset": 10
				});

				return;
			}
			
			NRS.state = response;
			var accountRequest = "rsConvert";
			var requestVariable = { account: account };

			NRS.sendRequest(accountRequest, requestVariable, function (response) {
				if (!response.errorCode) {
					NRS.account = String(response.account).escapeHTML();
					NRS.accountRS = String(response.accountRS).escapeHTML();
					//NRS.publicKey = String(response.publicKey).escapeHTML();
				}
				
				if (!NRS.account) {
					$.growl($.t("error_find_account_id"), {
						"type": "danger",
						"offset": 10
					});
					return;
				} else if (!NRS.accountRS) {
					$.growl($.t("error_generate_account_id"), {
						"type": "danger",
						"offset": 10
					});
					return;
				}

				NRS.sendRequest("getAccountPublicKey", {
					"account": NRS.account
				}, function(response) {
				    if (!response.errorCode) {
				        NRS.publicKey = String(response.publicKey).escapeHTML();
				    }
				    else {
				        NRS.publicKey = "<Please refer to your Jay Client>";
				    }

				    if ($("#disable_all_plugins").length == 1 && !($("#disable_all_plugins").is(":checked"))) {
						NRS.disablePluginsDuringSession = false;
					} else {
						NRS.disablePluginsDuringSession = true;
					}

					$("#account_id").html(String(NRS.accountRS).escapeHTML()).css("font-size", "12px");

					if (NRS.state) {
						NRS.checkBlockHeight();
					}

					NRS.getAccountInfo(true, function() {
						if (NRS.accountInfo.currentLeasingHeightFrom) {
							NRS.isLeased = (NRS.lastBlockHeight >= NRS.accountInfo.currentLeasingHeightFrom && NRS.lastBlockHeight <= NRS.accountInfo.currentLeasingHeightTo);
						} else {
							NRS.isLeased = false;
						}
					});

					//NRS.getAccountAliases();


NRS.rememberPassword = true;
$("#remember_password").prop("checked", false);
NRS.setPassword("jay");
$(".secret_phrase, .show_secret_phrase").hide();
$(".hide_secret_phrase").show();

					NRS.unlock();

					if (NRS.isOutdated) {
						$.growl($.t("nrs_update_available"), {
							"type": "danger"
						});
					}

					if (!NRS.downloadingBlockchain) {
						NRS.checkIfOnAFork();
					}
					if(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
						// Don't use account based DB in Safari due to a buggy indexedDB implementation (2015-02-24)
						NRS.createDatabase("NRS_USER_DB");
						$.growl($.t("nrs_safari_no_account_based_db"), {
							"type": "danger"
						});
					} else {
						NRS.createDatabase("NRS_USER_DB_" + String(NRS.account));
					}

					NRS.setupClipboardFunctionality();

					if (callback) {
						callback();
					}
					
					$.each(NRS.pages, function(key, value) {
						if(key in NRS.setup) {
							NRS.setup[key]();
						}
					});
					
					setTimeout(function () { NRS.loadPlugins(); }, 1500);
					
					$(".sidebar .treeview").tree();
					$('#dashboard_link a').addClass("ignore").click();

					if ($("#remember_account").is(":checked")) {
						var accountExists = 0;
						if (NRS.getCookie("savedNxtAccounts")){
							var accounts = NRS.getCookie("savedNxtAccounts").split(";");
							$.each(accounts, function(index, account) {
								if (account == NRS.accountRS)
									accountExists = 1;
							});
						}
						if (!accountExists){
							if (NRS.getCookie("savedNxtAccounts") && NRS.getCookie("savedNxtAccounts")!=""){
								var accounts=NRS.getCookie("savedNxtAccounts") + NRS.accountRS + ";";
								NRS.setCookie("savedNxtAccounts",accounts,30);
							}
							else
								NRS.setCookie("savedNxtAccounts",NRS.accountRS + ";",30);
						}
					}

					$("[data-i18n]").i18n();
					
					/* Add accounts to dropdown for quick switching */
					$("#account_id_dropdown .dropdown-menu .switchAccount").remove();
					if (NRS.getCookie("savedNxtAccounts") && NRS.getCookie("savedNxtAccounts")!=""){
						$("#account_id_dropdown .dropdown-menu").append("<li class='switchAccount' style='padding-left:2px;'><b>Switch Account to</b></li>")
						var accounts = NRS.getCookie("savedNxtAccounts").split(";");
						$.each(accounts, function(index, account) {
							if (account != ''){
								$('#account_id_dropdown .dropdown-menu')
								.append($("<li class='switchAccount'></li>")
									.append($("<a></a>")
										.attr("href","#")
										.attr("style","font-size: 85%;")
										.attr("onClick","NRS.switchAccount('"+account+"')")
										.text(account))
								);
							}
						});
					}

					NRS.getInitialTransactions();
					NRS.updateApprovalRequests();
				});
			});
		});
	}

	$("#logout_button_container").on("show.bs.dropdown", function(e) {
		
		if (!NRS.isForging) {
			//e.preventDefault();
			$(this).find("[data-i18n='logout_stop_forging']").hide();
		}
	});

	NRS.initPluginWarning = function() {
		if (NRS.activePlugins) {
			var html = "";
			html += "<div style='font-size:13px;'>";
			html += "<div style='background-color:#e6e6e6;padding:12px;'>";
			html += "<span data-i18n='following_plugins_detected'>";
			html += "The following active plugins have been detected:</span>";
			html += "</div>";
			html += "<ul class='list-unstyled' style='padding:11px;border:1px solid #e0e0e0;margin-top:8px;'>";
			$.each(NRS.plugins, function(pluginId, pluginDict) {
				if (pluginDict["launch_status"] == NRS.constants.PL_PAUSED) {
					html += "<li style='font-weight:bold;'>" + pluginDict["manifest"]["name"] + "</li>";
				}
			});
			html += "</ul>";
			html += "</div>";

			$('#lockscreen_active_plugins_overview').popover({
				"html": true,
				"content": html,
				"trigger": "hover"
			});

			html = "";
			html += "<div style='font-size:13px;padding:5px;'>";
			html += "<p data-i18n='plugin_security_notice_full_access'>";
			html += "Plugins are not sandboxed or restricted in any way and have full accesss to your client system including your Nxt passphrase.";
			html += "</p>";
			html += "<p data-i18n='plugin_security_notice_trusted_sources'>";
			html += "Make sure to only run plugins downloaded from trusted sources, otherwise ";
			html += "you can loose your NXT! In doubt don't run plugins with accounts ";
			html += "used to store larger amounts of NXT now or in the future.";
			html += "</p>";
			html += "</div>";

			$('#lockscreen_active_plugins_security').popover({
				"html": true,
				"content": html,
				"trigger": "hover"
			});

			$("#lockscreen_active_plugins_warning").show();
		} else {
			$("#lockscreen_active_plugins_warning").hide();
		}
	}

	NRS.showLockscreen = function() {
		NRS.toggleLoginType();
		if (NRS.hasLocalStorage && localStorage.getItem("logged_in")) {
			NRS.showLoginScreen();
		} else {
			NRS.showLoginScreen();
		}

	    $("#center").show();
	}

	NRS.unlock = function() {
		if (NRS.hasLocalStorage && !localStorage.getItem("logged_in")) {
			localStorage.setItem("logged_in", true);
		}

		var userStyles = ["header", "sidebar", "boxes"];

		for (var i = 0; i < userStyles.length; i++) {
			var color = NRS.settings[userStyles[i] + "_color"];
			if (color) {
				NRS.updateStyle(userStyles[i], color);
			}
		}

		var contentHeaderHeight = $(".content-header").height();
		var navBarHeight = $("nav.navbar").height();

		//	$(".content-splitter-right").css("bottom", (contentHeaderHeight + navBarHeight + 10) + "px");

		$("#lockscreen").hide();
		$("body, html").removeClass("lockscreen");

		$("#login_error").html("").hide();

		$(document.documentElement).scrollTop(0);
	}

	/*$("#logout_button").click(function(e) {
		if (!NRS.isForging) {
			e.preventDefault();
			NRS.logout();
		}
	});*/

	NRS.logout = function(stopForging) {
		if (stopForging && NRS.isForging) {
			$("#stop_forging_modal .show_logout").show();
			$("#stop_forging_modal").modal("show");
		} else {
			NRS.setDecryptionPassword("");
			NRS.setPassword("");
			//window.location.reload();
			window.location.href = window.location.pathname;    
		}
	}

	$("#logout_clear_user_data_confirm_btn").click(function(e) {
		e.preventDefault();
		if (NRS.database) {
			indexedDB.deleteDatabase(NRS.database.name);
		}
		if (NRS.legacyDatabase) {
			indexedDB.deleteDatabase(NRS.legacyDatabase.name);
		}
		if (NRS.hasLocalStorage) {
			localStorage.removeItem("logged_in");
			localStorage.removeItem("settings")
		}
		var cookies = document.cookie.split(";");
		for (var i = 0; i < cookies.length; i++) {
			NRS.deleteCookie(cookies[i].split("=")[0]);
		}

		NRS.logout();
	})

	NRS.setPassword = function(password) {
		NRS.setEncryptionPassword(password);
		NRS.setServerPassword(password);
	}

	NRS.checkAliasAccountBeforeLogin = function (alias) {
	    //check if valid RS addr
	    if (!alias) {
	        $.growl($.t("error_find_account_id"), {
	            "type": "danger",
	            "offset": 10
	        });
	        return;
	    }
	    
	    NRS.sendRequest("getAlias", {
	        "aliasName": alias
	    }, function (response) {
	        if (response.errorCode) {
	            $.growl($.t("error_alias_not_found"), {
	                "type": "danger",
	                "offset": 10
	            });
	            return;
	        }

	        if (response.aliasURI) {
	            var match = response.aliasURI.match(/acct:(.*)@nxt/i);

	            if (match && match[1]) {
	                if ($("#remember_alias").is(":checked")) {
	                    var accountExists = 0;
	                    if (NRS.getCookie("savedNxtAlias")) {
	                        var accounts = NRS.getCookie("savedNxtAlias").split(";");
	                        $.each(accounts, function (index, account) {
	                            if (account == alias)
	                                accountExists = 1;
	                        });
	                    }
	                    if (!accountExists) {
	                        if (NRS.getCookie("savedNxtAlias") && NRS.getCookie("savedNxtAlias") != "") {
	                            var accounts = NRS.getCookie("savedNxtAlias") + alias + ";";
	                            NRS.setCookie("savedNxtAlias", accounts, 30);
	                        }
	                        else
	                            NRS.setCookie("savedNxtAlias", alias + ";", 30);
	                    }
	                }
	                $("#remember_account").prop('checked', false);
	                NRS.login(match[1]);
	            }
	            else {
	               $.growl("Logging in with alias owner account.", {
	                "type": "info",
	                "offset": 10
	            });
			var match = response.accountRS;
			if ($("#remember_alias").is(":checked")) {
	                    var accountExists = 0;
	                    if (NRS.getCookie("savedNxtAlias")) {
	                        var accounts = NRS.getCookie("savedNxtAlias").split(";");
	                        $.each(accounts, function (index, account) {
	                            if (account == alias)
	                                accountExists = 1;
	                        });
	                    }
	                    if (!accountExists) {
	                        if (NRS.getCookie("savedNxtAlias") && NRS.getCookie("savedNxtAlias") != "") {
	                            var accounts = NRS.getCookie("savedNxtAlias") + alias + ";";
	                            NRS.setCookie("savedNxtAlias", accounts, 30);
	                        }
	                        else
	                            NRS.setCookie("savedNxtAlias", alias + ";", 30);
	                    }
	                }
	                $("#remember_account").prop('checked', false);
	                NRS.login(match);
	            }
	        }
	        else {
	            $.growl("Logging in with alias owner account", {
	                "type": "info",
	                "offset": 10
	            });
			var match = response.accountRS;
			if ($("#remember_alias").is(":checked")) {
	                    var accountExists = 0;
	                    if (NRS.getCookie("savedNxtAlias")) {
	                        var accounts = NRS.getCookie("savedNxtAlias").split(";");
	                        $.each(accounts, function (index, account) {
	                            if (account == alias)
	                                accountExists = 1;
	                        });
	                    }
	                    if (!accountExists) {
	                        if (NRS.getCookie("savedNxtAlias") && NRS.getCookie("savedNxtAlias") != "") {
	                            var accounts = NRS.getCookie("savedNxtAlias") + alias + ";";
	                            NRS.setCookie("savedNxtAlias", accounts, 30);
	                        }
	                        else
	                            NRS.setCookie("savedNxtAlias", alias + ";", 30);
	                    }
	                }
	                $("#remember_account").prop('checked', false);
	                NRS.login(match[1]);
	        }
	    });
	}
	NRS.toggleLoginType = function () {
	    //if found saved alias, set login via alias as default
	    if (NRS.getCookie("savedNxtAlias") && NRS.getCookie("savedNxtAlias") != "") {
	        NRS.listAccounts(2);
	        $("#remember_account_container").hide();
	        $("#remember_alias_container").show();
	        $("#login_account_list_label").text("Select an Alias to Login with");
	        $("#loginIcons").removeClass("fa-male").addClass("fa-bookmark");
	        $("#loginButtons").data("login-type", "account");
	        setTimeout(function () {
	            $("#login_alias").focus()
	        }, 10);
	    }
	    else {
	        NRS.listAccounts(1);
	    }
	}
	return NRS;
}(NRS || {}, jQuery));