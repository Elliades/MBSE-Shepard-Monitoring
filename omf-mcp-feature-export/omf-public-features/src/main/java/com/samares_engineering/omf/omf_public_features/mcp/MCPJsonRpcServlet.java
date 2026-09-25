package com.samares_engineering.omf.omf_public_features.mcp;

import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

public class MCPJsonRpcServlet extends HttpServlet {

    private final MCPProtocolService protocolService;

    public MCPJsonRpcServlet(MCPFeature feature) {
        this.protocolService = new MCPProtocolService(feature);
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        addCors(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        addCors(resp);
        resp.setContentType("application/json;charset=utf-8");
        resp.setCharacterEncoding(StandardCharsets.UTF_8.name());

        String body;
        try (BufferedReader reader = req.getReader()) {
            body = reader.lines().collect(Collectors.joining());
        }

        JSONObject responseJson;
        try {
            JSONObject requestJson = body.isBlank() ? new JSONObject() : new JSONObject(body);
            responseJson = protocolService.handle(requestJson);
        } catch (Exception e) {
            responseJson = MCPJsonResponses.error(null, -32603, e.getMessage());
        }

        try (PrintWriter writer = resp.getWriter()) {
            writer.write(responseJson.toString());
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        addCors(resp);
        resp.setContentType("application/json;charset=utf-8");
        JSONObject info = new JSONObject();
        info.put("name", "OMF MCP Feature");
        info.put("transport", "http+json-rpc");
        info.put("endpoint", "POST /");
        JSONArray tools = new JSONArray();
        for (MCPToolDefinition tool : MCPToolRegistry.definitions()) {
            tools.put(tool.toListEntry());
        }
        info.put("tools", tools);
        try (PrintWriter writer = resp.getWriter()) {
            writer.write(info.toString());
        }
    }

    private static void addCors(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
}
