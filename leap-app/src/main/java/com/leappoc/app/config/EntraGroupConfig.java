package com.leappoc.app.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.HashMap;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "entra")
@Profile("!mock")
public class EntraGroupConfig {

    private Map<String, String> groups = new HashMap<>();

    public Map<String, String> getGroups() {
        return groups;
    }

    public void setGroups(Map<String, String> groups) {
        this.groups = groups;
    }

    public String getGroupName(String gid) {
        if (gid == null) return null;
        return getGroupIdToNameMap().get(gid.toLowerCase());
    }

    public Map<String, String> getGroupIdToNameMap() {
        Map<String, String> reversed = new HashMap<>();
        for (Map.Entry<String, String> entry : groups.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isBlank()) {
                reversed.put(entry.getValue().toLowerCase(), entry.getKey());
            }
        }
        return reversed;
    }
}
