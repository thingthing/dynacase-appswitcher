<?php

/**
 * Save the default application logical name preferences in DEFAULT_APPLICATION_NAME parameter
 *
 * @param Action $action
 */
function set_default_application(Action &$action)
{
    $return = array(
        "success" => true,
        "error" => array(),
        "data" => array()
    );

    try {

        $usage = new ActionUsage($action);
        $defaultApplication = $usage->addRequiredParameter("defaultApplication", "default application logical name");

        $usage->setStrictMode(false);
        $usage->verify(true);

        ApplicationParameterManager::setParameterValue(ApplicationParameterManager::CURRENT_APPLICATION, "DEFAULT_APPLICATION_NAME", $defaultApplication);

    } catch (Exception $e) {
        $return["success"] = false;
        $return["error"][] = $e->getMessage();
        unset($return["data"]);
    }

    $action->lay->template = json_encode($return);
    $action->lay->noparse = true;
    header('Content-type: application/json');
}