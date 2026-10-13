package com.samares_engineering.omf.omf_public_features.mcp;

import com.nomagic.magicdraw.core.Application;
import com.nomagic.magicdraw.core.Project;
import com.nomagic.magicdraw.openapi.uml.PresentationElementsManager;
import com.nomagic.magicdraw.openapi.uml.ReadOnlyElementException;
import com.nomagic.magicdraw.openapi.uml.SessionManager;
import com.nomagic.magicdraw.uml.symbols.DiagramPresentationElement;
import com.nomagic.magicdraw.uml.symbols.PresentationElement;
import com.nomagic.uml2.ext.magicdraw.classes.mdkernel.*;
import com.nomagic.uml2.ext.magicdraw.commonbehaviors.mdcommunications.Signal;
import com.nomagic.uml2.ext.magicdraw.compositestructures.mdinternalstructures.Connector;
import com.nomagic.uml2.ext.magicdraw.compositestructures.mdports.Port;
import com.nomagic.uml2.ext.magicdraw.statemachines.mdbehaviorstatemachines.StateMachine;
import com.samares_engineering.omf.omf_core_framework.errors.cancelsession.UndoManager;
import com.samares_engineering.omf.omf_core_framework.factory.SysMLFactory;
import com.samares_engineering.omf.omf_core_framework.utils.utils.diagrams.DiagramUtils;
import com.samares_engineering.omf.omf_core_framework.utils.utils.diagrams.LayoutManager;
import org.json.JSONArray;
import org.json.JSONObject;

import java.awt.*;
import java.util.Arrays;
import java.util.List;

public class MCPModelToolService {

    private static final List<String> FACTORY_TYPES = Arrays.asList(
            "Block", "Package", "ProxyPort", "PartProperty", "Requirement",
            "InterfaceBlock", "ConstraintBlock", "Signal", "StateMachine"
    );

    public JSONObject getProject() {
        Project project = MCPElementResolver.requireProject();
        JSONObject json = new JSONObject();
        json.put("ok", true);
        json.put("name", project.getName());
        json.put("file", project.getFileName());
        json.put("dirty", project.isDirty());
        return json;
    }

    public JSONObject getElement(JSONObject args) {
        Element element = MCPElementResolver.requireElement(args.getString("elementId"));
        JSONObject json = new JSONObject();
        json.put("ok", true);
        json.put("element", MCPElementResolver.elementSummary(element));
        return json;
    }

    public JSONObject findElements(JSONObject args) {
        String name = args.optString("name", null);
        String type = args.optString("type", null);
        JSONObject json = new JSONObject();
        json.put("ok", true);
        json.put("elements", MCPElementResolver.findElements(name, type));
        return json;
    }

    public JSONObject factoryCreate(JSONObject args) {
        String type = args.getString("type");
        String name = args.getString("name");
        if (!FACTORY_TYPES.contains(type)) {
            throw new MCPException("UNSUPPORTED_TYPE",
                    "Unsupported type '" + type + "'. Supported: " + FACTORY_TYPES);
        }

        Project project = MCPElementResolver.requireProject();
        SysMLFactory factory = SysMLFactory.getInstance(project);
        Element owner = resolveOwner(args.optString("ownerId", null), project);

        Element created = createTypedElement(factory, type, owner);
        created.setName(name);

        JSONObject json = new JSONObject();
        json.put("ok", true);
        json.put("element", MCPElementResolver.elementSummary(created));
        return json;
    }

    private Element resolveOwner(String ownerId, Project project) {
        if (ownerId == null || ownerId.isBlank()) {
            return project.getPrimaryModel();
        }
        Element owner = MCPElementResolver.resolveElement(ownerId);
        if (owner == null) {
            throw new MCPException("OWNER_NOT_FOUND", "Owner not found: " + ownerId);
        }
        return owner;
    }

    private Element createTypedElement(SysMLFactory factory, String type, Element owner) {
        switch (type) {
            case "Block":
                return factory.createBlock(owner);
            case "Package":
                return factory.createPackage(owner);
            case "ProxyPort":
                return factory.createProxyPort(owner);
            case "PartProperty":
                return factory.createPartProperty(owner);
            case "InterfaceBlock":
                return factory.createInterfaceBlock(owner);
            case "ConstraintBlock":
                return factory.createConstraintBlock(owner);
            case "Signal":
                return factory.createSignal(owner);
            case "StateMachine":
                StateMachine stateMachine = factory.getMagicDrawFactory().createStateMachineInstance();
                stateMachine.setOwner(owner);
                return stateMachine;
            case "Requirement":
                return factory.createClass(owner);
            default:
                throw new MCPException("UNSUPPORTED_TYPE", type);
        }
    }

    public JSONObject connect(JSONObject args) {
        Element from = MCPElementResolver.requireElement(args.getString("fromId"));
        Element to = MCPElementResolver.requireElement(args.getString("toId"));
        String kind = args.optString("kind", "connector");

        SysMLFactory factory = SysMLFactory.getInstance(MCPElementResolver.requireProject());
        Element owner = from.getOwner() != null ? from.getOwner() : to.getOwner();
        if (owner == null) {
            throw new MCPException("CONNECT_FAILED", "Cannot resolve connector owner");
        }

        Element link;
        if ("dependency".equalsIgnoreCase(kind)) {
            Dependency dependency = factory.getMagicDrawFactory().createDependencyInstance();
            dependency.getClient().add(from);
            dependency.getSupplier().add(to);
            dependency.setOwner(owner);
            link = dependency;
        } else if (from instanceof Port && to instanceof Port) {
            link = factory.createConnectorBetweenPorts((Port) from, (Port) to, null, null, owner);
        } else {
            throw new MCPException("CONNECT_FAILED",
                    "connector kind requires two ProxyPort ends; use kind=dependency otherwise");
        }

        JSONObject json = new JSONObject();
        json.put("ok", true);
        json.put("element", MCPElementResolver.elementSummary(link));
        return json;
    }

    public JSONObject display(JSONObject args) {
        Element element = MCPElementResolver.requireElement(args.getString("elementId"));
        Diagram diagram = resolveDiagram(args.optString("diagramId", null));

        DiagramPresentationElement diagramPe = DiagramUtils.getDiagram(diagram);
        PresentationElementsManager manager = PresentationElementsManager.getInstance();
        PresentationElement shape = findPresentationOnDiagram(diagramPe, element);
        if (shape == null) {
            try {
                shape = manager.createShapeElement(element, diagramPe, true);
            } catch (ReadOnlyElementException e) {
                throw new MCPException("DISPLAY_FAILED", e.getMessage());
            }
        }

        Project project = MCPElementResolver.requireProject();
        project.setActiveDiagram(diagramPe);
        Application.getInstance().getGUILog().log("MCP display: " + element.getHumanName());

        JSONObject json = new JSONObject();
        json.put("ok", true);
        json.put("diagramId", diagram.getID());
        json.put("presentationElementId", shape.getID());
        return json;
    }

    private Diagram resolveDiagram(String diagramId) {
        if (diagramId != null && !diagramId.isBlank()) {
            Element element = MCPElementResolver.requireElement(diagramId);
            if (!(element instanceof Diagram)) {
                throw new MCPException("NOT_A_DIAGRAM", "Element is not a diagram: " + diagramId);
            }
            return (Diagram) element;
        }
        return DiagramUtils.getOpenedDiagram();
    }

    public JSONObject modifyLayout(JSONObject args) {
        Diagram diagram = (Diagram) MCPElementResolver.requireElement(args.getString("diagramId"));
        DiagramPresentationElement diagramPe = DiagramUtils.getDiagram(diagram);
        PresentationElementsManager manager = PresentationElementsManager.getInstance();

        JSONArray shapes = args.getJSONArray("shapes");
        JSONArray updated = new JSONArray();
        for (int i = 0; i < shapes.length(); i++) {
            JSONObject shapeJson = shapes.getJSONObject(i);
            Element element = MCPElementResolver.requireElement(shapeJson.getString("elementId"));
            PresentationElement pe = findPresentationOnDiagram(diagramPe, element);
            if (pe == null) {
                throw new MCPException("SHAPE_NOT_FOUND", "No shape for element " + element.getID());
            }
            Rectangle bounds = new Rectangle(
                    shapeJson.optInt("x", pe.getBounds().x),
                    shapeJson.optInt("y", pe.getBounds().y),
                    shapeJson.optInt("width", pe.getBounds().width),
                    shapeJson.optInt("height", pe.getBounds().height)
            );
            try {
                manager.reshapeShapeElement(pe, bounds);
            } catch (ReadOnlyElementException e) {
                throw new MCPException("LAYOUT_FAILED", e.getMessage());
            }
            updated.put(new JSONObject().put("presentationElementId", pe.getID()).put("elementId", element.getID()));
        }

        JSONObject json = new JSONObject();
        json.put("ok", true);
        json.put("updated", updated);
        return json;
    }

    public JSONObject autolayout(JSONObject args) {
        Diagram diagram = (Diagram) MCPElementResolver.requireElement(args.getString("diagramId"));
        DiagramPresentationElement diagramPe = DiagramUtils.getDiagram(diagram);
        new LayoutManager(diagramPe).applyQuickLayout();

        JSONObject json = new JSONObject();
        json.put("ok", true);
        json.put("diagramId", diagram.getID());
        return json;
    }

    public JSONObject undo(JSONObject args) {
        int steps = args.optInt("steps", 1);
        Project project = MCPElementResolver.requireProject();
        for (int i = 0; i < steps; i++) {
            if (SessionManager.getInstance().isSessionCreated(project)) {
                throw new MCPException("SESSION_OPEN", "Close the modeling session before undo");
            }
            UndoManager.undo(project);
        }
        JSONObject json = new JSONObject();
        json.put("ok", true);
        json.put("steps", steps);
        return json;
    }

    public JSONObject redo(JSONObject args) {
        int steps = args.optInt("steps", 1);
        Project project = MCPElementResolver.requireProject();
        for (int i = 0; i < steps; i++) {
            UndoManager.redo(project);
        }
        JSONObject json = new JSONObject();
        json.put("ok", true);
        json.put("steps", steps);
        return json;
    }

    private PresentationElement findPresentationOnDiagram(DiagramPresentationElement diagramPe, Element element) {
        for (PresentationElement candidate : diagramPe.getPresentationElements()) {
            PresentationElement match = findPresentationRecursively(candidate, element);
            if (match != null) {
                return match;
            }
        }
        return null;
    }

    private PresentationElement findPresentationRecursively(PresentationElement presentation, Element element) {
        if (presentation.getElement() != null && presentation.getElement().equals(element)) {
            return presentation;
        }
        for (PresentationElement child : presentation.getManipulatedPresentationElements()) {
            PresentationElement match = findPresentationRecursively(child, element);
            if (match != null) {
                return match;
            }
        }
        return null;
    }
}
