FROM openjdk:8
EXPOSE 8080
ADD target/deployment-integration.jar deployment-integration.jar
ENTRYPOINT ["java","-jar","/deployment-integration.jar"]