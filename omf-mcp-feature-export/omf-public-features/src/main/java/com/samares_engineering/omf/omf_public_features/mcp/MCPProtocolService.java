package com.samares_engineering.omf.omf_public_features.mcp;

import org.json.JSONArray;
import org.json.JSONObject;

public class MCPProtocolService {

    private final MCPFeature feature;
    private final MCPToolExecutor toolExecutor;

    public MCPProtocolService(MCPFeature feature) {
        this.feature = feature;
        this.toolExecutor = new MCPToolExecutor(feature);
    }

    public JSONObject handle(JSONObject request) {
        Object id = request.has("id") ? request.get("id") : null;
        String method = request.optString("method", "");

        if (method.isEmpty()) {
            return MCPJsonResponses.error(id, -32600, "Missing method");
        }

        JSONObject params = request.optJSONObject("params");
        if (params == null) {
            params = new JSONObject();
        }

        try {
            switch (method) {
                case "initialize":
                    return MCPJsonResponses.success(id, initializeResult());
                case "notifications/initialized":
                    return MCPJsonResponses.success(id, new JSONObject());
                case "tools/list":
                    return MCPJsonResponses.success(id, toolsList());
                case "tools/call":
                    return MCPJsonResponses.success(id, toolExecutor.call(params));
                default:
                    return MCPJsonResponses.error(id, -32601, "Method not found: " + method);
            }
        } catch (MCPException e) {
            JSONObject payload = new JSONObject();
            payload.put("ok", false);
            payload.put("code", e.getCode());
            payload.put("error", e.getMessage());
            return MCPJsonResponses.success(id, MCPJsonResponses.toolResult(false, payload));
        } catch (Exception e) {
            return MCPJsonResponses.error(id, -32603, e.getMessage());
        }
    }

    private JSONObject initializeResult() {
        JSONObject result = new JSONObject();
        result.put("protocolVersion", "2024-11-05");
        JSONObject capabilities = new JSONObject();
        capabilities.put("tools", new JSONObject().put("listChanged", false));
        result.put("capabilities", capabilities);
        result.put("serverInfo", new JSONObject()
                .put("name", "omf-mcp-feature")
                .put("version", "1.0.0"));
        return result;
    }

    private JSONObject toolsList() {
        JSONArray tools = new JSONArray();
        for (MCPToolDefinition definition : MCPToolRegistry.definitions()) {
            tools.put(definition.toListEntry());
        }
        return new JSONObject().put("tools", tools);
    }
}
