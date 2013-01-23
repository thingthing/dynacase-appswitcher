<?php
/*
 * @author Anakeen
 * @license http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero General Public License
 * @package FDL
*/

$app_desc = array(
    "name" => "DCP_APP_SWITCHER",
    "short_name" => N_("DCP_APP_SWITCHER:DCP_APP_SWITCHER"),
    "description" => N_("DCP_APP_SWITCHER:Default app switcher for DCP"),
    "access_free" => "N",
    "icon" => "dcp_app_switcher.png",
    "displayable" => "N",
    "with_frame" => "N",
    "childof" => ""
);
/* ACLs for this application */
$app_acl = array(
    array(
        "name" => "DCP_APP_SWITCHER_USER",
        "description" => N_("DCP_APP_SWITCHER:DCP_APP_SWITCHER access"),
        "group_default" => "Y"
    )
);
/* Actions for this application */
$action_desc = array(
    array(
        "name" => "DCP_APP_SWITCHER",
        "short_name" => N_("DCP_APP_SWITCHER:Default app switcher for DCP"),
        "script" => "dcp_app_switcher.php",
        "function" => "app_switcher",
        "layout" => "dcp_app_switcher.html",
        "acl" => "DCP_APP_SWITCHER_USER",
        "root" => "Y"
    ),
    array(
        "name" => "SETDEFAULTAPPLICATION",
        "short_name" => N_("DCP_APP_SWITCHER:SETDEFAULTAPPLICATION"),
        "script" => "setdefaultapplication.php",
        "function" => "setdefaultapplication",
        "acl" => "DCP_APP_SWITCHER_USER"
    ),
    array(
        "name" => "SHORTCUT_APPLICATION",
        "short_name" => N_("DCP_APP_SWITCHER:SHORTCUT_APPLICATION"),
        "acl" => "DCP_APP_SWITCHER_USER"
    )
);
