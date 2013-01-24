<?php

$actionUsage = new ApiUsage();
$actionUsage->setDefinitionText("Set the value of CORE CORE_START_APP to DCP_APP_SWITCHER");
$force = $actionUsage->addOptionalParameter("force", "force modification", array("TRUE", "FALSE"), "FALSE");

$coreStartApp = ApplicationParameterManager::getParameterValue("CORE", "CORE_START_APP");

if ($coreStartApp === "CORE" || $force === "TRUE") {
    ApplicationParameterManager::setParameterValue("CORE", "CORE_START_APP", "DCP_APP_SWITCHER");
}