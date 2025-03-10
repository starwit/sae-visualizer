# SAE Visualizer
Starwit Awareness Engine is processing video material and extracts results likge movements of objects or geo-positions of objects. This component shall visualize these results. It is a Spring Boot app, that connects to SAE's central communication bus and sends data to a ReactJS frontend. 

## How to use

This application needs a connection to ValKey/Redis bus of a running SAE instance. Connection details can be configured via [application.properties](application/src/main/resources/application.properties) or environment variables.

Once started application provides various views on processed data. 

## How to deploy

TODO
* Docker compose
* Helm Chart

## Development Documentation 
In order to build application, two steps are necessary. First package Javascript frontend like so:

```bash
    cd webclient/app
    npm install
```

Then Spring Boot can be build with this command:

```bash
    mvn clean install -P frontend
```

Run application locally with:

```bash
    java -jar application/target/application-xxx.jar
```

You can then access application under: http://localhost:8080/sae-visualizer