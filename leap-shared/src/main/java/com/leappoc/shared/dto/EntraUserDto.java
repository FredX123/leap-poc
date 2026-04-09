package com.leappoc.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Lightweight representation of a user fetched from Microsoft Entra ID via Graph API.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EntraUserDto {

    private String id;
    private String firstName;
    private String lastName;
    private String displayName;
    private String userPrincipalName;
    private String mail;

    public EntraUserDto() {}

    public EntraUserDto(String id, String firstName, String lastName,
                        String displayName, String userPrincipalName, String mail) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.displayName = displayName;
        this.userPrincipalName = userPrincipalName;
        this.mail = mail;
    }

    public String getId()                { return id; }
    public void   setId(String id)       { this.id = id; }

    public String getFirstName()                   { return firstName; }
    public void   setFirstName(String firstName)   { this.firstName = firstName; }

    public String getLastName()                  { return lastName; }
    public void   setLastName(String lastName)   { this.lastName = lastName; }

    public String getDisplayName()                     { return displayName; }
    public void   setDisplayName(String displayName)   { this.displayName = displayName; }

    public String getUserPrincipalName()                         { return userPrincipalName; }
    public void   setUserPrincipalName(String userPrincipalName) { this.userPrincipalName = userPrincipalName; }

    public String getMail()                { return mail; }
    public void   setMail(String mail)     { this.mail = mail; }
}
