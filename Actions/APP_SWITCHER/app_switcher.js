(function ($, document, window) {
    "use strict";
    var resizeIframe, getApplicationIFrame, loadApplication, loadSearchApplication,
        mainMenuDisplay, toogleMainMenu, hideMainMenu, showMainMenu, setMainMenuAutoHideTimeOut, autoHideMainMenuTime,
        displaySubMenu, setSubMenuAutoHideTimeOut, hideSubMenu, autoDisplayMenuTime, autoHideSubMenuTime,
        reloadApplication, updateDefaultApplication,
        displayShortcut, updateShortcuts, handleAjaxRequest,
        logError, generateID, modeHash;

    mainMenuDisplay = false;
    //noinspection JSUnresolvedVariable
    modeHash = window.onhashchange !== undefined;

    window.app_switcher = window.app_switcher || {};

    window.dcp = window.dcp || {};

    autoDisplayMenuTime = 850;
    autoHideMainMenuTime = autoHideSubMenuTime = 1000;

    generateID = function generateID() {
        return 'xxxxxxxx'.replace(/[xy]/g, function (c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
    };

    /**
     * Wrap ajax request
     *
     * @param requestObject
     * @param success
     * @param fail
     * @private
     */
    handleAjaxRequest = function handleAjaxRequest(requestObject, success, fail) {
        requestObject.pipe(
            function (response) {
                if (response.success) {
                    return (response);
                }
                return ($.Deferred().reject(response));
            },
            function (response) {
                return ({
                    success : false,
                    result :  null,
                    error :   "Unexpected error: " + response.status + " " + response.statusText
                });
            }
        ).then(success, fail);
    };

    logError = function logError(err) {
        err = err.error || err;
        if (window.console && $.isFunction(window.console.log)) {
            window.console.log(err);
        }
        $('<div><div class="ui-state-error"><p>' +
            '<span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>' +
            err + '</p></div></div>').dialog({title : window.app_switcher.errorTitle, modal : true});
    };

    window.dcp.displayWarningMessage = function displayWarningMessage(message) {
        var i, messages, length,
            $wrapper = $('<p></p>');
        messages = message.split("\n");
        for (i = 0 , length = messages.length ; i < length; i+=1) {
            $wrapper.append($("<span></span>").text(messages[i]));
            if (i < length -1) {
                $wrapper.append("<br/>");
            }
        }

        $wrapper = $('<div class="ui-state-highlight"></div>').append($wrapper);

        $('<div></div>').append($wrapper)
            .dialog({
                    modal:true,
                    title:'<span class="ui-icon ui-icon-info" style="float: left; margin-right: .3em;"></span>' + window.app_switcher.infoTitle
                });
    };

    /**
     * Resize iframe with content size
     */
    resizeIframe = function resizeIframe() {
        var iframeHeight, $content;
        $content = $("#content");
        iframeHeight = $(window).height() -
            $content.offset().top -
            parseInt($content.css("padding-top"), 10) -
            parseInt($content.css("padding-bottom"), 10);
        $("iframe", $('#content')).height(iframeHeight - 5);
    };
    /**
     * get or generate application iframe
     *
     * @param appName
     * @param appUrl
     * @return {jQuery|HTMLElement}
     */
    getApplicationIFrame = function getApplicationIFrame(appName, appUrl) {
        var iframeId, applicationIframe;
        iframeId = 'app-iframe-' + appName;
        applicationIframe = $('#' + iframeId);
        if (!applicationIframe.length) {
            applicationIframe = $('<iframe class="css-iframe-content" name="' +
                appName + '_' + generateID() + '" id="' + iframeId + '" src="' + appUrl + '"></iframe>')
                .hide()
                .appendTo('#content');
        }
        return applicationIframe;
    };

    /**
     * Init/Update show the selected application
     *
     * @param $app
     *
     * @return {jQuery}
     */
    loadApplication = function loadApplication($app) {
        var appName, applicationIframe, appurl, $selectedContent = $("#selected-application"), loadedMenuApp;
        hideMainMenu();
        hideSubMenu();
        appName = $app.data('appname');
        appurl = $app.data('appurl');
        loadedMenuApp = $("#menu-" + appName);
        applicationIframe = getApplicationIFrame(appName, appurl);
        applicationIframe.siblings()
            .hide();
        applicationIframe.show();
        window.setTimeout(resizeIframe, 0);
        /* Change the state of the page (selected application, #)*/
        if (modeHash) {
            window.location.hash = appName;
        }
        window.app_switcher.selectedApp = appName;
        document.title = $("#title-" + appName).text() + " - " + $("body").data("clientname");
        $selectedContent.empty().append(loadedMenuApp.find(".js-menu-element-content").clone());
        loadedMenuApp.addClass("ui-state-highlight").siblings().removeClass("ui-state-highlight");
        return applicationIframe;
    };

    /**
     * Reload/Init and show the selected application
     *
     * @param $app
     * @return {jQuery}
     */
    reloadApplication = function reloadApplication($app) {
        var iframe = loadApplication($app), contentDocument = iframe[0].contentDocument || iframe[0].contentWindow.document;
        if (contentDocument.location.href !== "about:blank") {
            contentDocument.location.href = $app.data('appurl');
        }
        return iframe;
    };

    /**
     * Init/Update the search zone
     *
     * @param $searchElement the search input
     */
    loadSearchApplication = function loadSearchApplication($searchElement) {
        var $searchApplication, appurl;
        appurl = $searchElement.data('appurl');
        $searchElement.data('appurl', 'about:blank');
        $searchApplication = loadApplication($searchElement);
        $searchApplication.attr("src", appurl);
    };

    /**
     * Display the sub menu
     *
     * Reinit the hide timer
     *
     * @param $rootElement
     */
    displaySubMenu = function displaySubMenu($rootElement) {
        var top, left, rootPosition, $contextualMenu = $(".js-contextualMenu-content"), timeOutId = $contextualMenu.data("timeoutid");

        if (timeOutId) {
            window.clearInterval(timeOutId);
        }

        rootPosition = $rootElement.offset();
        top = rootPosition.top - 2;
        left = rootPosition.left + $rootElement.outerWidth(true);
        $contextualMenu.find(".js-description").text($rootElement.data("description"));
        $contextualMenu.find("li").data({"appurl" : $rootElement.data("appurl"), "appname" : $rootElement.data("appname")});
        $contextualMenu.css({ top : top, left : left}).removeClass("css-menu-content-hidden").data("timeoutid", "");
    };

    /**
     * Set a timeout to autohide submenu
     *
     * @param $contextualMenu
     */
    setSubMenuAutoHideTimeOut = function setSubMenuAutoHideTimeOut($contextualMenu) {
        var timeOutId = $contextualMenu.data("timeoutid");

        if (timeOutId) {
            window.clearInterval(timeOutId);
        }
        timeOutId = window.setTimeout(function () {
            hideSubMenu();
        }, autoHideSubMenuTime);
        $contextualMenu.data("timeoutid", timeOutId);
    };

    /**
     * Hide the sub menu
     *
     * Reinit the hide timer
     */
    hideSubMenu = function hideSubMenu() {
        var $contextualMenu = $(".js-contextualMenu-content"), timeoutid = $contextualMenu.data("timeoutid");
        if (timeoutid) {
            window.clearInterval(timeoutid);
        }
        $contextualMenu.addClass("css-menu-content-hidden").data("timeoutid", "").css("left", "");
    };

    toogleMainMenu = function toogleMainMenu() {
        mainMenuDisplay = !mainMenuDisplay;
        if (mainMenuDisplay) {
            showMainMenu();
        } else {
            hideMainMenu();
        }
    };

    showMainMenu = function showMainMenu() {
        var mainMenu = $(".js-menu-content");
        mainMenuDisplay = true;
        $(".js-fold-menu").removeClass("ui-icon-triangle-1-e").addClass("ui-icon-triangle-1-s");
        mainMenu.removeClass("css-menu-content-hidden");
    };

    /**
     * Hide the main menu
     */
    hideMainMenu = function hideMainMenu() {
        mainMenuDisplay = false;
        $(".js-fold-menu").addClass("ui-icon-triangle-1-e").removeClass("ui-icon-triangle-1-s");
        $(".js-menu-content").addClass("css-menu-content-hidden");
    };

    /**
     * Set a timeout to autohide mainmenu
     *
     * @param $mainMenu
     * @param onlyDesactivate if true only desactivate
     */
    setMainMenuAutoHideTimeOut = function setMainMenuAutoHideTimeOut($mainMenu, onlyDesactivate) {
        var timeOutId = $mainMenu.data("main-menu-timeoutid");

        if (timeOutId) {
            window.clearInterval(timeOutId);
        }
        if (onlyDesactivate) {
            timeOutId = "";
        } else {
            timeOutId = window.setTimeout(function () {
                hideMainMenu();
            }, autoHideMainMenuTime);
        }
        $mainMenu.data("main-menu-timeoutid", timeOutId);
    };

    /**
     * Display the activated shortcut (hide the other)
     */
    displayShortcut = function displayShortcut() {
        var shortcuts = "";
        window.app_switcher.shortcuts = window.app_switcher.shortcuts || "";
        shortcuts = window.app_switcher.shortcuts.split("|");
        $.each($(".js-shortcut-element"), function () {
            var $curentShortcut = $(this);
            if ($.inArray($curentShortcut.data("appname"), shortcuts) > -1) {
                $curentShortcut.removeClass("css-shortcut-element-hidden");
            } else {
                $curentShortcut.addClass("css-shortcut-element-hidden");
            }
        });
    };

    /**
     * Save the selected shortcut in a user param
     */
    updateShortcuts = function updateShortcuts() {
        window.app_switcher.shortcuts = window.app_switcher.shortcuts || {};
        handleAjaxRequest($.post("?app=APP_SWITCHER&action=SHORTCUT_APPLICATION", {shortcuts : window.app_switcher.shortcuts}),
            $.noop,
            logError);
    };

    /**
     * Save the default application in a user param
     *
     * @param applicationName
     */
    updateDefaultApplication = function updateDefaultApplication(applicationName) {
        handleAjaxRequest($.get("?app=APP_SWITCHER&action=SET_DEFAULT_APPLICATION", {defaultApplication : applicationName}),
            $.noop,
            logError);
    };

    $(document).ready(function () {
        /* Display main menu event */
        $(".js-menu").on("click", function () {
            toogleMainMenu();
            hideSubMenu();
        }).on("mouseenter", function () {
            $(this).addClass("ui-state-focus");
            setMainMenuAutoHideTimeOut($(".js-menu-content"), true);
        }).on("mouseleave", function () {
            $(this).removeClass("ui-state-focus");
            setMainMenuAutoHideTimeOut($(".js-menu-content"), false);
        });
        /* Main menu display application on click*/
        $(".js-menu-element").on("click", function () {
            loadApplication($(this));
        });
        $(".js-menu-content").on("mouseenter", function () {
            setMainMenuAutoHideTimeOut($(this), true);
        }).on("mouseleave", function () {
            setMainMenuAutoHideTimeOut($(this), false);
        });
        /* Main menu display submenu timeout */
        $(".js-menu-open-submenu").on("mouseenter", function () {
            var autoDisplayTimeOutId, $this = $(this);
            hideSubMenu();
            autoDisplayTimeOutId = window.setTimeout(function () {
                displaySubMenu($this);
            }, autoDisplayMenuTime);
            $this.data("auto-display-timeoutid", autoDisplayTimeOutId);
        }).on("mouseleave", function () {
            var $this = $(this), timeOutId = $this.data("auto-display-timeoutid");
            if (timeOutId) {
                window.clearInterval(timeOutId);
            }
            $this.data("auto-display-timeoutid", "");
            setSubMenuAutoHideTimeOut($(".js-contextualMenu-content"));
        });
        /* Menu element state-focus */
        $(".css-menu-element").on("mouseenter", function () {
            $(this).addClass("ui-state-focus");
        }).on("mouseleave", function () {
            $(this).removeClass("ui-state-focus");
        });
        /* Contextual menu display hide event */
        $(".js-contextualMenu-content").on("mouseleave", function () {
            setSubMenuAutoHideTimeOut($(this));
            setMainMenuAutoHideTimeOut($(".js-menu-content"), false);
        }).on("mouseenter", function () {
            var timeOutId = $(this).data("timeoutid");
            setMainMenuAutoHideTimeOut($(".js-menu-content"), true);
            if (timeOutId) {
                window.clearInterval(timeOutId);
            }
        });
        /* Sub menu event */
        /* Reload current element */
        $(".js-menu-reload").on("click", function () {
            reloadApplication($(this));
        });
        /* Open in a window/tab the current app*/
        $(".js-menu-open").on("click", function () {
            window.open($(this).data("appurl"));
            hideMainMenu();
            hideSubMenu();
        });
        /* Set as default application the current application */
        $(".js-menu-default-application").on("click", function () {
            updateDefaultApplication($(this).data("appname"));
            hideMainMenu();
            hideSubMenu();
        });
        /* Toggle menu shortcut state */
        $(".js-menu-shortcut").on("click", function () {
            var shortcuts = [], currentApp = $(this).data("appname"), index;
            window.app_switcher.shortcuts = window.app_switcher.shortcuts || "";
            if (window.app_switcher.shortcuts) {
                shortcuts =  window.app_switcher.shortcuts.split("|");
            }
            index = $.inArray(currentApp, shortcuts);
            if (index < 0) {
                shortcuts.push(currentApp);
            } else {
                shortcuts.splice(index, 1);
            }
            window.app_switcher.shortcuts = shortcuts.join("|");
            displayShortcut();
            updateShortcuts();
            hideMainMenu();
            hideSubMenu();
        });
        /*Configure text search zone*/
        $(".css-text-search").on("focusin", function () {
            $(this).addClass("css-text-search-activate");
        }).on("focusout", function () {
            $(this).removeClass("css-text-search-activate");
        }).on("change", function () {
            var $this = $(this), url = "?sole=A&app=FGSEARCH&keyword=" + encodeURIComponent($this.val());
            $this.data("appname", "FGSEARCH").data("appurl", url);
            loadSearchApplication($this);
            $this.val("");
        });
        /* Disconnect button */
        $("#disconnect").button({
            icons : {
                primary : "ui-icon-power"
            },
            text :  false
        }).on("click", function () {
            $("#authent").trigger("submit");
        });
        /* Admin button */
        $("#admin").button({
            icons : {
                primary : "ui-icon-gear"
            },
            text :  false
        }).on("click", function () {
	    window.open('admin.php');
	});
        /* Init default application */
        window.setTimeout(function () {
            var defaultApplication;
            if (modeHash && window.location.hash) {
                /*Suppress the hash*/
                defaultApplication = window.location.hash.substr(1);
            } else {
                defaultApplication = $("body").data("defaultapplication");
            }
            if (defaultApplication) {
                $("#menu-" + defaultApplication).trigger("click");
            }
        }, 0);
        /*shortcut*/
        $(".js-shortcut-element").on("click", function () {
            loadApplication($(this));
        });
        window.setTimeout(function () {
            displayShortcut();
        }, 0);
        /* Password */
        $(".js-user-button").on("mouseenter", function () {
            $(this).addClass("ui-state-hover");
        }).on("mouseleave", function () {
            $(this).removeClass("ui-state-hover");
        });
        /* Init password modifier */
        window.setTimeout(function () {
            $(".js-user-button").passwordModifier();
        }, 0);
        /* resize*/
        if (modeHash) {
            $(window).on("resize", resizeIframe).on("hashchange", function () {
                var hash = window.location.hash.slice(1);
                if (hash !== window.app_switcher.selectedApp) {
                    $("#menu-" + hash).trigger("click");
                }
            });
        }
    });
}($, document, window));