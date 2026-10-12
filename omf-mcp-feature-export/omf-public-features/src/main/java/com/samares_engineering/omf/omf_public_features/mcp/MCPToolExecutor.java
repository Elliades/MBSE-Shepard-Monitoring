package com.samares_engineering.omf.omf_public_features.mcp;

import com.samares_engineering.omf.omf_core_framework.errormanagement2.OMFBarrierExecutor;
import com.samares_engineering.omf.omf_core_framework.errormanagement2.exceptions.OMFLogException;
import org.json.JSONObject;

public class MCPToolExecutor {

    private final MCPFeature feature;
    private final MCPModelToolService modelTools = new MCPModelToolService();

    public MCPToolExecutor(MCPFeature feature) {
        this.feature = feature;
    }

    public JSONObject call(JSONObject params) {
        String name = params.getString("name");
        JSONObject arguments = params.optJSONObject("arguments");
        if (arguments == null) {
            arguments = new JSONObject();
        }

        if (MCPToolRegistry.find(name).isEmpty()) {
            throw new MCPException("UNKNOWN_TOOL", "Unknown tool: " + name);
        }

        JSONObject payload = executeTool(name, arguments);
        boolean ok = payload.optBoolean("ok", false);
        return MCPJsonResponses.toolResult(ok, payload);
    }

    private JSONObject executeTool(String name, JSONObject arguments) {
        try {
            return (JSONObject) OMFBarrierExecutor.executeInSessionWithinBarrier(() -> {
                switch (name) {
                    case "get_project":
                        return modelTools.getProject();
                    case "get_element":
                        return modelTools.getElement(arguments);
                    case "find_elements":
                        return modelTools.findElements(arguments);
                    case "factory_create":
                        return modelTools.factoryCreate(arguments);
                    case "connect":
                        return modelTools.connect(arguments);
                    case "display":
                        return modelTools.display(arguments);
                    case "modify_layout":
                        return modelTools.modifyLayout(arguments);
                    case "autolayout":
                        return modelTools.autolayout(arguments);
                    case "undo":
                        return modelTools.undo(arguments);
                    case "redo":
                        return modelTools.redo(arguments);
                    case "run_simulation":
                        return MCPSimulationBridge.runSimulation(
                                MCPElementResolver.requireElement(arguments.getString("elementId")));
                    case "simulation_info":
                        return MCPSimulationBridge.simulationInfo();
                    default:
                        throw new MCPException("UNKNOWN_TOOL", name);
                }
            }, feature);
        } catch (OMFLogException e) {
            JSONObject error = new JSONObject();
            error.put("ok", false);
            error.put("code", "OMF_ERROR");
            error.put("error", e.getMessage());
            return error;
        }
    }
}
