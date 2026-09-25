package com.samares_engineering.omf.omf_public_features.mcp;

import org.json.JSONObject;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public final class MCPToolRegistry {

    private MCPToolRegistry() {
    }

    public static List<MCPToolDefinition> definitions() {
        return Arrays.asList(
                tool("get_project", "Return the active MagicDraw project summary.", objectSchema()),
                tool("get_element", "Return one model element by id.", requiredProps("elementId")),
                tool("find_elements", "Find elements by optional name and metaclass name.", optionalProps("name", "type")),
                tool("factory_create", "Create a SysML/UML element (Block, Package, ProxyPort, PartProperty, Requirement, InterfaceBlock, ConstraintBlock, Signal, StateMachine).",
                        requiredProps("type", "name").put("ownerId", stringProperty("Optional owner element id"))),
                tool("connect", "Connect two model ends with a connector or dependency.", requiredProps("fromId", "toId")
                        .put("kind", stringProperty("connector or dependency (default connector)"))),
                tool("display", "Show an element on a diagram (active diagram if diagramId omitted).",
                        requiredProps("elementId").put("diagramId", stringProperty("Optional diagram id"))),
                tool("modify_layout", "Set bounds for shapes on a diagram.",
                        requiredProps("diagramId", "shapes")),
                tool("autolayout", "Run MagicDraw auto-layout on a diagram.", requiredProps("diagramId")),
                tool("undo", "Undo command history steps.", optionalProps("steps")),
                tool("redo", "Redo command history steps.", optionalProps("steps")),
                tool("run_simulation", "Start Cameo simulation for a model element.", requiredProps("elementId")),
                tool("simulation_info", "Read simulation session status and observed signals.", objectSchema())
        );
    }

    public static Optional<MCPToolDefinition> find(String name) {
        return definitions().stream().filter(d -> d.getName().equals(name)).findFirst();
    }

    private static MCPToolDefinition tool(String name, String description, JSONObject schema) {
        return new MCPToolDefinition(name, description, schema);
    }

    private static JSONObject objectSchema() {
        return new JSONObject().put("type", "object").put("properties", new JSONObject());
    }

    private static JSONObject requiredProps(String... required) {
        JSONObject schema = objectSchema();
        JSONObject properties = new JSONObject();
        for (String key : required) {
            properties.put(key, stringProperty(key));
        }
        schema.put("properties", properties);
        schema.put("required", required);
        return schema;
    }

    private static JSONObject optionalProps(String... keys) {
        JSONObject schema = objectSchema();
        JSONObject properties = new JSONObject();
        for (String key : keys) {
            properties.put(key, stringProperty(key));
        }
        schema.put("properties", properties);
        return schema;
    }

    private static JSONObject stringProperty(String description) {
        return new JSONObject().put("type", "string").put("description", description);
    }
}
