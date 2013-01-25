<?php

/**
 * Save the shortcut user preferences in SHORTCUT_APPLICATION parameter
 *
 * @param Action $action
 */
function shortcut_application(Action &$action)
{
    $return = array(
        "success" => true,
        "error" => array(),
        "data" => array()
    );

    try {

        $usage = new ActionUsage($action);

        $shortcuts = $usage->addRequiredParameter("shortcuts", "shortcuts");

        $usage->setStrictMode(false);
        $usage->verify(true);

        ApplicationParameterManager::setParameterValue(ApplicationParameterManager::CURRENT_APPLICATION, "SHORTCUT_APPLICATION", $shortcuts);

    } catch (Exception $e) {
        $return["success"] = false;
        $return["error"][] = $e->getMessage();
        unset($return["data"]);
    }

    $action->lay->template = json_encode($return);
    $action->lay->noparse = true;
    header('Content-type: application/json');
}