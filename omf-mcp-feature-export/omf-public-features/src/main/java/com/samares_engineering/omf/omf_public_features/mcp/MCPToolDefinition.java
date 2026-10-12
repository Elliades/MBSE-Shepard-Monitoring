package com.samares_engineering.omf.omf_public_features.mcp;

import org.json.JSONObject;

public class MCPToolDefinition {

    private final String name;
    private final String description;
    private final JSONObject inputSchema;

    public MCPToolDefinition(String name, String description, JSONObject inputSchema) {
        this.name = name;
        this.description = description;
        this.inputSchema = inputSchema;
    }

    public String getName() {
        return name;
    }

    public JSONObject toListEntry() {
        JSONObject tool = new JSONObject();
        tool.put("name", name);
        tool.put("description", description);
        tool.put("inputSchema", inputSchema);
        return tool;
    }
}
