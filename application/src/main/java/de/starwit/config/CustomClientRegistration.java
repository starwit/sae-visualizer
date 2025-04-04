package de.starwit.config;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Configuration
@Profile("auth")
@ConfigurationProperties(prefix = "oidc-client-registration", ignoreUnknownFields = false)
//@Validated
public class CustomClientRegistration {

    static final Logger LOG = LoggerFactory.getLogger(ClientRegistrationRepository.class);

    @NotBlank
    public String authorizationUri;
    @NotBlank
    public String tokenUri;
    @NotBlank
    public String userInfoUri;
    @NotBlank
    public String jwkSetUri;
    @NotBlank
    public String endSessionEndpoint;
    @NotBlank
    public String userNameAttribute;
    @NotBlank
    public String scope;
    @NotBlank
    public String clientId;
    @NotBlank
    public String clientSecret;
    @NotBlank
    public String redirectUri;

	@Override
	public String toString() {
		return "CustomClientRegistration [authorizationUri=" + authorizationUri + ", tokenUri=" + tokenUri
				+ ", userInfoUri=" + userInfoUri + ", jwkSetUri=" + jwkSetUri + ", endSessionEndpoint="
				+ endSessionEndpoint + ", userNameAttribute=" + userNameAttribute + ", scope=" + scope + ", clientId="
				+ clientId + ", clientSecret=" + clientSecret + ", redirectUri=" + redirectUri + "]";
	}

	@Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        LOG.debug(toString());
        return new InMemoryClientRegistrationRepository(ClientRegistration.withRegistrationId("keycloak")
            .authorizationUri(authorizationUri)
            .tokenUri(tokenUri)
            .userInfoUri(userInfoUri)
            .jwkSetUri(jwkSetUri)
            .userNameAttributeName(userNameAttribute)
            .scope(scope)
            .clientId(clientId)
            .clientSecret(clientSecret)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri(redirectUri)
            .providerConfigurationMetadata(Map.of("end_session_endpoint", endSessionEndpoint))
            .build());
    }

	public void setAuthorizationUri(String authorizationUri) {
		this.authorizationUri = authorizationUri;
	}

	public void setTokenUri(String tokenUri) {
		this.tokenUri = tokenUri;
	}

	public void setUserInfoUri(String userInfoUri) {
		this.userInfoUri = userInfoUri;
	}

	public void setJwkSetUri(String jwkSetUri) {
		this.jwkSetUri = jwkSetUri;
	}

	public void setEndSessionEndpoint(String endSessionEndpoint) {
		this.endSessionEndpoint = endSessionEndpoint;
	}

	public void setUserNameAttribute(String userNameAttribute) {
		this.userNameAttribute = userNameAttribute;
	}

	public void setScope(String scope) {
		this.scope = scope;
	}

	public void setClientId(String clientId) {
		this.clientId = clientId;
	}

	public void setClientSecret(String clientSecret) {
		this.clientSecret = clientSecret;
	}

	public void setRedirectUri(String redirectUri) {
		this.redirectUri = redirectUri;
	}
}
