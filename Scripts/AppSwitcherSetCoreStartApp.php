<?php

$actionUsage = new ApiUsage();
$actionUsage->setDefinitionText("Set the value of CORE CORE_START_APP to APP_SWITCHER");
$force = $actionUsage->addOptionalParameter("force", "force modification", array("TRUE", "FALSE"), "FALSE");

$coreStartApp = ApplicationParameterManager::getParameterValue("CORE", "CORE_START_APP");

/**
 * Change if force or core start app default value, or webdesk (for compat with pre 2.0 webdesk packet)
 */
if ($force === "TRUE" || $coreStartApp === "CORE" || $coreStartApp === "WEBDESK" ) {
    ApplicationParameterManager::setParameterValue("CORE", "CORE_START_APP", "APP_SWITCHER");
}