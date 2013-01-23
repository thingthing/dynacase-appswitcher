(function ($, document, window) {
    "use strict";
    var resizeIframe, getApplicationIFrame, loadApplication, loadSearchApplication, displaySubMenu, hideSubMenu,
        reloadApplication, hideMainMenu, updateDefaultApplication, displayShortcut, updateShortcuts;

    window.dcp_app_switcher = window.dcp_app_switcher || {};

    /**
     * Resize iframe with content size
     */
    resizeIframe = function resizeIframe() {
        var iframeHeight, $content;
        $content = $("#content");
        iframeHeight = $(window).height()
            - $content.offset().top
            - parseInt($content.css("padding-top"), 10)
            - parseInt($content.css("padding-bottom"), 10);
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
            applicationIframe = $('<iframe class="css-iframe-content" id="' + iframeId + '" src="' + appUrl + '"></iframe>')
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
        appName = $app.data('appname');
        appurl = $app.data('appurl');
        loadedMenuApp = $("#menu-" + appName);
        applicationIframe = getApplicationIFrame(appName, appurl);
        applicationIframe.siblings()
            .hide();
        applicationIframe.show();
        window.setTimeout(resizeIframe, 0);
        /* Change the state of the page (selected application, #)*/
        window.location.hash = appName;
        window.dcp_app_switcher.selectedApp = appName;
        document.title = $("#title-" + appName).text() + " - " + $("body").data("clientname");
        $selectedContent.empty().append(loadedMenuApp.find(".js-menu-element-content").clone());
        loadedMenuApp.addClass("ui-state-highlight").siblings().removeClass("ui-state-highlight");
        hideMainMenu();
        hideSubMenu();
        return applicationIframe;
    };

    reloadApplication = function ($app) {
        var iframe = loadApplication($app);
        if (iframe[0].contentDocument.location.href !== "about:blank") {
            iframe[0].contentDocument.location.reload();
        }
    };

    /**
     * Init/Update the search zone
     *
     * @param $searchElement the search input
     */
    loadSearchApplication = function ($searchElement) {
        var $searchApplication, appurl;
        appurl = $searchElement.data('appurl');
        $searchElement.data('appurl', 'about:blank');
        $searchApplication = loadApplication($searchElement);
        $searchApplication.attr("src", appurl);
    };

    displaySubMenu = function displaySubMenu($rootElement) {
        var top, left, rootPosition, $contextualMenu = $(".js-contextualMenu-content"), timeoutid = $contextualMenu.data("timeoutid");

        if (timeoutid) {
            window.clearInterval(timeoutid);
        }
        rootPosition = $rootElement.offset();
        top = rootPosition.top - 2;
        left = rootPosition.left + $rootElement.outerWidth(true);
        $contextualMenu.find(".js-description").text($rootElement.data("description"));
        $contextualMenu.find("li").data({"appurl" : $rootElement.data("appurl"), "appname" : $rootElement.data("appname")});
        $contextualMenu.css({ top : top, left : left}).removeClass("css-menu-content-hidden").data("timeoutid", "");
    };

    hideSubMenu = function hideSubMenu() {
        var $contextualMenu = $(".js-contextualMenu-content"), timeoutid = $contextualMenu.data("timeoutid");
        if (timeoutid) {
            window.clearInterval(timeoutid);
        }
        $contextualMenu.addClass("css-menu-content-hidden").data("timeoutid", "").css("left", "");
    };

    hideMainMenu = function () {
        $(".js-fold-menu").addClass("ui-icon-triangle-1-e").removeClass("ui-icon-triangle-1-s");
        $(".js-menu-content").addClass("css-menu-content-hidden");
    };

    updateDefaultApplication = function (applicationName) {
        $.get("?app=DCP_APP_SWITCHER&action=SETDEFAULTAPPLICATION", {defaultApplication : applicationName});
    };

    displayShortcut = function () {
        window.dcp_app_switcher.shortcuts = window.dcp_app_switcher.shortcuts || {};
        $.each(window.dcp_app_switcher.shortcuts, function (key, value) {
            if (value) {
                $("#shortcut-" + key).removeClass("css-shortcut-element-hidden");
            }
        });
    };

    updateShortcuts = function () {
        window.dcp_app_switcher.shortcuts = window.dcp_app_switcher.shortcuts || {};
        $.post("?app=DCP_APP_SWITCHER&action=SHORTCUT_APPLICATION", {shortcuts : JSON.stringify(window.dcp_app_switcher.shortcuts)});
    };

    $(document).ready(function () {
        /* Configure menu */
        $(".js-menu").on("click", function () {
            $(".js-menu-content").toggleClass("css-menu-content-hidden");
            $(".js-fold-menu").toggleClass("ui-icon-triangle-1-e ui-icon-triangle-1-s");
            hideSubMenu();
        });
        $(".js-menu-element").on("click", function () {
            loadApplication($(this));
        });
        $(".js-menu-open-submenu").on("mouseenter", function () {
            var timeOutId, $this = $(this);
            hideSubMenu();
            timeOutId = window.setTimeout(function () {
                displaySubMenu($this);
            }, 200);
            $this.data("timeoutid", timeOutId);
        }).on("mouseleave", function () {
            var $this = $(this), timeOutId = $this.data("timeoutid");
            if (timeOutId) {
                window.clearInterval(timeOutId);
            }
            $this.data("timeoutid", "");
        });
        $(".css-menu-element").on("mouseenter", function () {
            $(this).addClass("ui-state-focus");
        }).on("mouseleave", function () {
            $(this).removeClass("ui-state-focus");
        });
        $(".js-contextualMenu-content").on("mouseleave", function () {
            var timeOutId, $this = $(this);
            timeOutId = window.setTimeout(function () {
                hideSubMenu();
            }, 1000);
            $this.data("timeoutid", timeOutId);
        }).on("mouseenter", function () {
            var timeOutId = $(this).data("timeoutid");
            if (timeOutId) {
                window.clearInterval(timeOutId);
            }
        });
        $(".js-menu-reload").on("click", function () {
            reloadApplication($(this));
        });
        $(".js-menu-open").on("click", function () {
            window.open($(this).data("appurl"));
            hideMainMenu();
            hideSubMenu();
        });
        $(".js-menu-default-application").on("click", function () {
            updateDefaultApplication($(this).data("appname"));
            hideMainMenu();
            hideSubMenu();
        });
        $(".js-menu-shortcut").on("click", function () {
            window.dcp_app_switcher.shortcuts = window.dcp_app_switcher.shortcuts || {};
            window.dcp_app_switcher.shortcuts[$(this).data("appname")] = !(window.dcp_app_switcher.shortcuts[$(this).data("appname")]);
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
        /* Init default application */
        window.setTimeout(function () {
            var defaultApplication;
            if (window.location.hash) {
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
        /* resize*/
        $(window).on("resize", resizeIframe).on("hashchange", function () {
            var hash = window.location.hash.slice(1);
            if (hash !== window.dcp_app_switcher.selectedApp) {
                $("#menu-" + hash).trigger("click");
            }
        });
    });
}($, document, window));