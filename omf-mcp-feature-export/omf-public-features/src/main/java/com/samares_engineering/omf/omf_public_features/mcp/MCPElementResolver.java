package com.samares_engineering.omf.omf_public_features.mcp;

import com.nomagic.magicdraw.core.Project;
import com.nomagic.uml2.ext.magicdraw.classes.mdkernel.Element;
import com.samares_engineering.omf.omf_core_framework.utils.OMFUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public final class MCPElementResolver {

    private MCPElementResolver() {
    }

    public static Project requireProject() {
        Project project = OMFUtils.getProject();
        if (project == null || project.isClosed()) {
            throw new MCPException("NO_PROJECT", "No open MagicDraw project");
        }
        return project;
    }

    public static Element requireElement(String elementId) {
        Element element = resolveElement(elementId);
        if (element == null) {
            throw new MCPException("ELEMENT_NOT_FOUND", "Element not found: " + elementId);
        }
        return element;
    }

    public static Element resolveElement(String elementId) {
        if (elementId == null || elementId.isBlank()) {
            return null;
        }
        return requireProject().getElementByID(elementId);
    }

    public static JSONObject elementSummary(Element element) {
        JSONObject json = new JSONObject();
        json.put("id", element.getID());
        json.put("name", element.getHumanName());
        json.put("qualifiedName", element.getQualifiedName());
        json.put("metaClass", element.getClassType().getName());
        return json;
    }

    public static JSONArray findElements(String name, String type) {
        Project project = requireProject();
        List<Element> matches = new ArrayList<>();
        collectElements(project.getPrimaryModel(), matches);

        JSONArray array = new JSONArray();
        for (Element element : matches) {
            if (name != null && !name.isBlank() && !element.getHumanName().contains(name)) {
                continue;
            }
            if (type != null && !type.isBlank() && !element.getClassType().getName().contains(type)) {
                continue;
            }
            array.put(elementSummary(element));
        }
        return array;
    }

    private static void collectElements(Element root, List<Element> out) {
        if (root == null) {
            return;
        }
        out.add(root);
        if (root.getOwnedElement() != null) {
            for (Element child : root.getOwnedElement()) {
                collectElements(child, out);
            }
        }
    }
}
