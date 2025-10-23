FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ARG JAR_FILE=target/website-project-ai-java-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
