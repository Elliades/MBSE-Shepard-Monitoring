package com.samares_engineering.omf.omf_public_features.mcp;

import com.nomagic.uml2.ext.magicdraw.classes.mdkernel.Element;
import org.json.JSONArray;
import org.json.JSONObject;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public final class MCPSimulationBridge {

    private static final List<JSONObject> OBSERVED_SIGNALS = new CopyOnWriteArrayList<>();
    private static volatile String activeSessionId;
    private static volatile Object registeredListener;
    private static volatile boolean simulationApiPresent = detectSimulationApi();

    private MCPSimulationBridge() {
    }

    private static boolean detectSimulationApi() {
        try {
            Class.forName("com.nomagic.magicdraw.simulation.SimulationManager");
            return true;
        } catch (ClassNotFoundException e) {
            return false;
        }
    }

    public static boolean isSimulationAvailable() {
        return simulationApiPresent;
    }

    public static void registerPassiveListener() {
        if (!simulationApiPresent || registeredListener != null) {
            return;
        }
        try {
            Class<?> listenerInterface = Class.forName(
                    "com.nomagic.magicdraw.simulation.execution.SimulationExecutionListener");
            Class<?> registryClass = Class.forName(
                    "com.nomagic.magicdraw.simulation.execution.ExecutionListenerRegistry");

            Object listener = Proxy.newProxyInstance(
                    listenerInterface.getClassLoader(),
                    new Class[]{listenerInterface},
                    new SimulationListenerInvocationHandler());

            Method register = registryClass.getMethod("registerSimulationListener", listenerInterface);
            register.invoke(null, listener);
            registeredListener = listener;
        } catch (Exception ignored) {
            simulationApiPresent = false;
        }
    }

    public static void unregisterPassiveListener() {
        if (!simulationApiPresent || registeredListener == null) {
            return;
        }
        try {
            Class<?> listenerInterface = Class.forName(
                    "com.nomagic.magicdraw.simulation.execution.SimulationExecutionListener");
            Class<?> registryClass = Class.forName(
                    "com.nomagic.magicdraw.simulation.execution.ExecutionListenerRegistry");
            Method unregister = registryClass.getMethod("unregisterSimulationListener", listenerInterface);
            unregister.invoke(null, registeredListener);
        } catch (Exception ignored) {
            // best effort
        } finally {
            registeredListener = null;
        }
    }

    public static JSONObject runSimulation(Element element) {
        if (!simulationApiPresent) {
            throw new MCPException("SIMULATION_UNAVAILABLE", "Cameo Simulation Toolkit is not available");
        }
        try {
            Class<?> simulationManagerClass = Class.forName("com.nomagic.magicdraw.simulation.SimulationManager");
            Object manager = simulationManagerClass.getMethod("getInstance").invoke(null);

            Object session = invokeFirstMatching(manager,
                    new String[]{"runSimulation", "execute", "startSimulation", "run"},
                    new Class[]{Element.class},
                    new Object[]{element});

            if (session == null) {
                throw new MCPException("SIMULATION_START_FAILED", "Could not start simulation for element " + element.getID());
            }

            activeSessionId = String.valueOf(session);
            JSONObject json = new JSONObject();
            json.put("ok", true);
            json.put("sessionId", activeSessionId);
            json.put("elementId", element.getID());
            return json;
        } catch (MCPException e) {
            throw e;
        } catch (Exception e) {
            throw new MCPException("SIMULATION_START_FAILED", e.getMessage());
        }
    }

    public static JSONObject simulationInfo() {
        if (!simulationApiPresent) {
            throw new MCPException("SIMULATION_UNAVAILABLE", "Cameo Simulation Toolkit is not available");
        }
        JSONObject json = new JSONObject();
        json.put("ok", true);
        json.put("sessionId", activeSessionId);
        json.put("signals", new JSONArray(OBSERVED_SIGNALS));
        json.put("availableSignals", readAvailableSignals());
        return json;
    }

    private static JSONArray readAvailableSignals() {
        try {
            Class<?> engineClass = Class.forName("com.nomagic.magicdraw.simulation.engine.ExecutionEngine");
            Object engine = engineClass.getMethod("getInstance").invoke(null);
            Object signals = engineClass.getMethod("getAvailableSignals").invoke(engine);
            if (signals instanceof List) {
                return new JSONArray((List<?>) signals);
            }
        } catch (Exception ignored) {
            // optional
        }
        return new JSONArray();
    }

    private static Object invokeFirstMatching(Object target, String[] names, Class<?>[] paramTypes, Object[] args)
            throws Exception {
        for (String name : names) {
            try {
                Method method = target.getClass().getMethod(name, paramTypes);
                return method.invoke(target, args);
            } catch (NoSuchMethodException ignored) {
                // try next
            }
        }
        return null;
    }

    private static final class SimulationListenerInvocationHandler implements InvocationHandler {
        @Override
        public Object invoke(Object proxy, Method method, Object[] args) {
            if ("eventTriggered".equals(method.getName()) && args != null && args.length > 0) {
                JSONObject signalEvent = new JSONObject();
                signalEvent.put("name", extractSignalName(args[0]));
                signalEvent.put("timestamp", System.currentTimeMillis());
                OBSERVED_SIGNALS.add(signalEvent);
            }
            return null;
        }

        private String extractSignalName(Object signalInstance) {
            if (signalInstance == null) {
                return "";
            }
            for (String getter : new String[]{"getName", "getQualifiedName", "toString"}) {
                try {
                    Method method = signalInstance.getClass().getMethod(getter);
                    Object value = method.invoke(signalInstance);
                    if (value != null) {
                        return value.toString();
                    }
                } catch (Exception ignored) {
                    // try next getter
                }
            }
            return signalInstance.toString();
        }
    }
}
