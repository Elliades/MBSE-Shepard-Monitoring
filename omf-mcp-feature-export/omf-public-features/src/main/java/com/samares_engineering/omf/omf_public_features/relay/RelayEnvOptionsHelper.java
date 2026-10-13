package com.samares_engineering.omf.omf_public_features.relay;

import com.nomagic.magicdraw.properties.StringProperty;
import com.samares_engineering.omf.omf_core_framework.feature.EnvOptionsHelper;
import com.samares_engineering.omf.omf_core_framework.feature.OMFFeature;
import com.samares_engineering.omf.omf_core_framework.feature.registrables.options.option.Option;
import com.samares_engineering.omf.omf_core_framework.feature.registrables.options.option.OptionImpl;
import com.samares_engineering.omf.omf_core_framework.feature.registrables.options.option.OptionKind;

import java.util.List;

public class RelayEnvOptionsHelper extends EnvOptionsHelper {

    public static final String RELAY_CONFIGURATION_GROUP = "Shepard relay configuration";
    public static final String RELAY_MD_WEBSOCKET_URL = "Relay WebSocket URL (MagicDraw endpoint)";
    public static final String RELAY_FRONT_BASE_URL = "Front base URL (share link)";

    public static final String DEFAULT_RELAY_MD_URL = "wss://shepherd.chaos-art.fr/relay/md";
    public static final String DEFAULT_FRONT_BASE_URL = "https://shepherd.chaos-art.fr/";

    public RelayEnvOptionsHelper(OMFFeature feature) {
        super(feature);
    }

    public List<Option> getAllOptions() {
        OptionImpl relayUrl = new OptionImpl(
                new StringProperty(RELAY_MD_WEBSOCKET_URL, DEFAULT_RELAY_MD_URL),
                RELAY_CONFIGURATION_GROUP,
                getFeature().getPlugin().getEnvironmentOptionsGroup()
                        .orElseThrow(() -> new IllegalStateException("No environment options group for plugin")),
                OptionKind.Environment
        );
        OptionImpl frontUrl = new OptionImpl(
                new StringProperty(RELAY_FRONT_BASE_URL, DEFAULT_FRONT_BASE_URL),
                RELAY_CONFIGURATION_GROUP,
                getFeature().getPlugin().getEnvironmentOptionsGroup()
                        .orElseThrow(() -> new IllegalStateException("No environment options group for plugin")),
                OptionKind.Environment
        );
        return List.of(relayUrl, frontUrl);
    }

    public String getRelayMdWebSocketUrl() {
        Object value = getPropertyByName(RELAY_MD_WEBSOCKET_URL).getValue();
        if (value instanceof String && !((String) value).isBlank()) {
            return ((String) value).trim();
        }
        return DEFAULT_RELAY_MD_URL;
    }

    public String getFrontBaseUrl() {
        Object value = getPropertyByName(RELAY_FRONT_BASE_URL).getValue();
        if (value instanceof String && !((String) value).isBlank()) {
            return ((String) value).trim();
        }
        return DEFAULT_FRONT_BASE_URL;
    }
}
