# Application Deployment

Application can be deployed to Kubernetes clusters with Helm. Helm chart can be found [here](https://hub.docker.com/r/starwitorg/sae-visualizer-chart).

## Values

Ingress to application is configured straightforward. See following example:

```yaml
ingress:
  enabled: true
  annotations: 
    cert-manager.io/cluster-issuer: letsencrypt-prod # if you use lets encrypt
  hosts:
    - host: saevisualizer.cluster.local
      paths:
        - path: /
          pathType: ImplementationSpecific
  tls: 
    - secretName: saevisualizer.cluster.local
      hosts:
        - saevisualizer.cluster.local
```

Authentication is done via external Keycloak. The following sample configuration shows, which values to set:
```YAML
auth:
  enabled: true
  keycloakRealmUrlInternal: http://auth-keycloak.auth.svc.cluster.local/realms/aicockpit
  keycloakRealmUrlExternal: https://hostname/realms/realmname
  clientId: clientId
  clientSecret: clientSecret
```

### Connection to 

As Visualizer needs access to a running ValKey/Redis instance to listen for incoming data, this connection is configured like so:

```yaml
config:
  valkey:
    stream_ids: 
      - streamId1
      - streamId2
    host: valkey-primary
    port: 6379
```

For all other possible configurationvalues see [values.yaml](deployment/helm/sae-visualizer/values.yaml).

## Notes for Traefik Deployment
This application is using web sockets to update object positions quickly. So all network components between client and Visualizer app needs to support 

However if you use a Kubernetes cluster with Traefik as ingress controller, some additional configuration needs to done.

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: headers
  namespace: default
spec:
  headers:
    customRequestHeaders:
      X-Forwarded-Proto: "https"
    sslRedirect: true
    forceSTSHeader: true
    stsIncludeSubdomains: true
    stsPreload: true
    stsSeconds: 31536000
```


```yaml
ingress:
  enabled: true
  annotations: 
    cert-manager.io/cluster-issuer: letsencrypt-prod
    # Add these annotations for WebSocket support
    traefik.ingress.kubernetes.io/router.middlewares: default-headers@kubernetescrd
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
    traefik.ingress.kubernetes.io/router.tls: "true"
    # Enable WebSocket protocol
    traefik.ingress.kubernetes.io/service.protocols: "h2c,http/1.1"
    traefik.ingress.kubernetes.io/service.protocol: "http" 
  hosts:
    - host: saevisualizer.cluster.local
      paths:
        - path: /
          pathType: ImplementationSpecific
```