/*******************************************************************************
 * @copyright Copyright (c) 2022-2026 Samares-Engineering
 * @Licence: EPL 2.0
 ******************************************************************************/

package com.samares_engineering.omf.omf_public_features.mcp;

import com.samares_engineering.omf.omf_core_framework.feature.AFeature;
import com.samares_engineering.omf.omf_core_framework.feature.EnvOptionsHelper;
import com.samares_engineering.omf.omf_core_framework.feature.registrables.actions.UIAction;
import com.samares_engineering.omf.omf_core_framework.feature.registrables.hooks.base.Hook;
import com.samares_engineering.omf.omf_core_framework.feature.registrables.liveactions.liveaction_engine.LiveActionEngine;
import com.samares_engineering.omf.omf_core_framework.feature.registrables.options.option.Option;

import java.util.Collections;
import java.util.List;

/**
 * Official OMF feature exposing a local MCP (JSON-RPC) server for model and simulation automation.
 */
public class MCPFeature extends AFeature {

    public static final int DEFAULT_PORT = 9851;

    private MCPEnvOptionsHelper envOptionsHelper;
    private MCPServer mcpServer;

    public MCPFeature() {
        super("MCP Feature");
    }

    @Override
    protected EnvOptionsHelper initEnvOptionsHelper() {
        envOptionsHelper = new MCPEnvOptionsHelper(this);
        return envOptionsHelper;
    }

    @Override
    protected List<UIAction> initFeatureActions() {
        return Collections.emptyList();
    }

    @Override
    protected List<LiveActionEngine> initLiveActions() {
        return Collections.emptyList();
    }

    @Override
    protected List<LiveActionEngine> initProjectOnlyLiveActions() {
        return Collections.emptyList();
    }

    @Override
    protected List<Option> initOptions() {
        return envOptionsHelper.getAllOptions();
    }

    @Override
    protected List<Hook> initLifeCycleHooks() {
        return Collections.emptyList();
    }

    @Override
    public void onRegistering() {
        int port = envOptionsHelper.getServerPort();
        mcpServer = new MCPServer(this);
        mcpServer.start(port);
        MCPSimulationBridge.registerPassiveListener();
    }

    @Override
    public void onUnregistering() {
        MCPSimulationBridge.unregisterPassiveListener();
        if (mcpServer != null) {
            mcpServer.stop();
            mcpServer = null;
        }
    }

    public MCPEnvOptionsHelper getMcpEnvOptionsHelper() {
        return envOptionsHelper;
    }
}
