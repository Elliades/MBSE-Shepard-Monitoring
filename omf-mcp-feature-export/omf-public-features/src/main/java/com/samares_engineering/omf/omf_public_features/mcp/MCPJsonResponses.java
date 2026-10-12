package com.samares_engineering.omf.omf_public_features.mcp;

import org.json.JSONObject;

public final class MCPJsonResponses {

    private MCPJsonResponses() {
    }

    public static JSONObject success(Object id, JSONObject result) {
        JSONObject response = new JSONObject();
        if (id != null && id != JSONObject.NULL) {
            response.put("jsonrpc", "2.0");
            response.put("id", id);
        }
        response.put("result", result);
        return response;
    }

    public static JSONObject error(Object id, int code, String message) {
        JSONObject response = new JSONObject();
        response.put("jsonrpc", "2.0");
        if (id != null && id != JSONObject.NULL) {
            response.put("id", id);
        }
        JSONObject error = new JSONObject();
        error.put("code", code);
        error.put("message", message);
        response.put("error", error);
        return response;
    }

    public static JSONObject toolResult(boolean ok, JSONObject payload) {
        JSONObject result = new JSONObject();
        result.put("content", new org.json.JSONArray().put(new JSONObject()
                .put("type", "text")
                .put("text", payload.toString())));
        result.put("isError", !ok);
        return result;
    }
}
