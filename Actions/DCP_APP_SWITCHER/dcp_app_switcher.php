<?php
/*
 * @author Anakeen
 * @license http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero General Public License
 * @package FDL
*/

include_once "FDL/freedom_util.php";

/**
 * Generate basic app switcher
 *
 * @param Action $action
 *
 */
function app_switcher(Action & $action)
{
    $user = new_Doc('', $action->user->fid);
    $action->lay->set("NAME", $user->getTitle());

    /** For authent mecanism */
    $action->lay->set("PHP_AUTH_USER", $_SERVER['PHP_AUTH_USER']);

    /**
     * Add widget code
     */
    $action->lay->set("WIDGET_PASSWORD", $action->parent->getJsLink("CORE:dcpui.changepassword.js.xml", true));

    /**
     * Test if can change password
     */

    $canExecuteChangePassword = $action->canExecute('FDL', 'CHANGE_USER_PASSWORD');
    $action->lay->set('DISPLAY_CHANGE_BUTTON', ("" == $canExecuteChangePassword));

    $displayableApplication = getDisplayableApplication($action);

    if (isset($displayableApplication["FGSEARCH"])) {
        $action->lay->set("DISPLAY_SEARCH_ZONE", true);
    }else {
        $action->lay->set("DISPLAY_SEARCH_ZONE", false);
    }

    $action->lay->setBlockData('MENU_APPLICATIONS', $displayableApplication);
}

/**
 * Check if an application need to be display
 *
 * @param Action $action current action
 *
 * @return array
 */
function getDisplayableApplication(Action $action)
{
    $applications = array();
    $query = <<< 'SQL'
SELECT
    application.name,
    application.id,
    application.icon,
    application.short_name,
    application.description,
    application.access_free,
    application.with_frame,
    action.acl
FROM application
LEFT JOIN action
ON application.id = action.id_application
WHERE
    (application.tag is null
    OR application.tag !~* E'\\yadmin\\y' )
    AND application.displayable='Y'
    AND application.available = 'Y'
    AND application.name != 'DCP_APP_SWITCHER'
    AND action.root = 'Y';
SQL;

    simpleQuery('', $query, $applications, false, false, true);

    $displayableApplications = array();

    foreach ($applications as $currentApplication) {
        if ($currentApplication["access_free"] !== "Y") {
            if ($action->user->id != 1) { // no control for user Admin
                if (!$action->hasPermission($currentApplication["acl"], $currentApplication["id"])) {
                    continue;
                }
            }
        }
        $appUrl = "?app=" . $currentApplication["name"];
        if ($currentApplication["with_frame"] !== 'Y') {
            $appUrl .= "&sole=A";
        }
        $displayableApplications[$currentApplication["name"]] = array(
            "NAME" => $currentApplication["name"],
            "URL" => $appUrl,
            "ICON_SRC" => $action->parent->getImageLink($currentApplication["icon"], false, 24),
            "ICON_ALT" => $currentApplication["name"],
            "TITLE" => _($currentApplication["short_name"]),
            "DESCRIPTION" => _($currentApplication["description"])
        );
    }

    $sortFunction = function ($value1, $value2) {
        return strnatcasecmp($value1["TITLE"], $value2["TITLE"]);
    };

    uasort($displayableApplications, $sortFunction);

    return $displayableApplications;
}

