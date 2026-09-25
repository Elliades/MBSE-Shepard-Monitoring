package com.samares_engineering.omf.omf_public_features.mcp;

public class MCPException extends RuntimeException {

    private final String code;

    public MCPException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
