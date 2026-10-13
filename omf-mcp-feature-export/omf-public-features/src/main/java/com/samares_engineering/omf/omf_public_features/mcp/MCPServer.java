package com.samares_engineering.omf.omf_public_features.mcp;

import com.samares_engineering.omf.omf_core_framework.errormanagement2.exceptions.OMFCriticalException;
import com.samares_engineering.omf.omf_core_framework.errormanagement2.logging.log.OMFLog;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

import java.net.BindException;

import static com.samares_engineering.omf.omf_core_framework.errormanagement2.logging.log.OMFLogLevel.INFO;

public class MCPServer {

    private final MCPFeature feature;
    private Server server;

    public MCPServer(MCPFeature feature) {
        this.feature = feature;
    }

    public void start(int port) {
        try {
            server = new Server();
            ServerConnector connector = new ServerConnector(server);
            connector.setHost("127.0.0.1");
            connector.setPort(port);
            server.addConnector(connector);

            ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
            context.setContextPath("/");
            context.addServlet(new ServletHolder(new MCPJsonRpcServlet(feature)), "/*");
            server.setHandler(context);

            server.start();
            new OMFLog().info("MCP server started on http://127.0.0.1:" + port)
                    .logToUiConsole(INFO)
                    .logToSystemConsole(INFO);
        } catch (BindException bindException) {
            throw new OMFCriticalException(
                    "MCP server port " + port + " is already in use. Change MCP Server Port in environment options.",
                    bindException);
        } catch (Exception e) {
            throw new OMFCriticalException("Failed to start MCP server on port " + port, e);
        }
    }

    public void stop() {
        if (server == null) {
            return;
        }
        try {
            server.stop();
        } catch (Exception e) {
            throw new OMFCriticalException("Failed to stop MCP server", e);
        }
    }
}
