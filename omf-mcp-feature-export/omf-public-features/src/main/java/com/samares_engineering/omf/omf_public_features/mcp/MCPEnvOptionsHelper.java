package com.samares_engineering.omf.omf_public_features.mcp;

import com.nomagic.magicdraw.properties.IntegerProperty;
import com.samares_engineering.omf.omf_core_framework.feature.EnvOptionsHelper;
import com.samares_engineering.omf.omf_core_framework.feature.OMFFeature;
import com.samares_engineering.omf.omf_core_framework.feature.registrables.options.option.Option;
import com.samares_engineering.omf.omf_core_framework.feature.registrables.options.option.OptionImpl;
import com.samares_engineering.omf.omf_core_framework.feature.registrables.options.option.OptionKind;

import java.util.List;

public class MCPEnvOptionsHelper extends EnvOptionsHelper {

    public static final String MCP_CONFIGURATION_GROUP = "MCP Server configuration";
    public static final String MCP_SERVER_PORT = "MCP Server Port (default 9851)";

    public MCPEnvOptionsHelper(OMFFeature feature) {
        super(feature);
    }

    public List<Option> getAllOptions() {
        OptionImpl portOption = new OptionImpl(
                new IntegerProperty(MCP_SERVER_PORT, MCPFeature.DEFAULT_PORT),
                MCP_CONFIGURATION_GROUP,
                getFeature().getPlugin().getEnvironmentOptionsGroup()
                        .orElseThrow(() -> new IllegalStateException("No environment options group for plugin")),
                OptionKind.Environment
        );
        return List.of(portOption);
    }

    public int getServerPort() {
        Object value = getPropertyByName(MCP_SERVER_PORT).getValue();
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return MCPFeature.DEFAULT_PORT;
    }
}
