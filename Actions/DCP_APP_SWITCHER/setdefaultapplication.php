<?php

function setdefaultapplication(Action &$action)
{

    $usage = new ActionUsage($action);

    $defaultApplication = $usage->addRequiredParameter("defaultApplication", "default application logical name");

    ApplicationParameterManager::setParameterValue(ApplicationParameterManager::CURRENT_APPLICATION, "DEFAULT_APPLICATION_NAME", $defaultApplication);
}