<?php

function shortcut_application(Action &$action)
{
    $usage = new ActionUsage($action);

    $shortcuts = $usage->addRequiredParameter("shortcuts", "shortcuts");

    ApplicationParameterManager::setParameterValue(ApplicationParameterManager::CURRENT_APPLICATION, "SHORTCUT_APPLICATION", $shortcuts);
}