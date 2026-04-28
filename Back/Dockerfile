# ─── Build stage ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

# Copy Gradle wrapper and dependency manifests first so Docker can cache the
# dependency-download layer independently of source changes.
COPY gradlew gradlew.bat ./
COPY gradle/ gradle/
COPY build.gradle settings.gradle gradle.properties ./

# Make the wrapper executable and pre-fetch dependencies (best-effort; the
# real build below will succeed even if this layer is partially cached).
RUN chmod +x gradlew && \
    ./gradlew dependencies --no-daemon --console=plain || true

# Copy the full source tree and run the build with maximum output visibility.
# -x check -x test  → skip static analysis and unit tests (compile + package only)
# -Pproduction      → activates the production profile if referenced in build.gradle
# --no-daemon       → required in containers (no persistent Gradle daemon)
# --console=plain   → plain text output so every line is visible in Railway logs
# --stacktrace      → print full stack trace on any failure
# --info            → verbose Gradle lifecycle logging
COPY src/ src/

RUN ./gradlew clean build \
        -x check \
        -x test \
        -Pproduction \
        --no-daemon \
        --console=plain \
        --stacktrace \
        --info \
    && echo "=== Build complete. JAR contents ===" \
    && ls -lh build/libs/

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy AS runtime

WORKDIR /app

# Copy only the fat JAR produced by bootJar (archiveFileName = 'app.jar')
COPY --from=builder /app/build/libs/app.jar app.jar

# Railway injects PORT at runtime; Spring Boot reads SERVER_PORT.
ENV SERVER_PORT=${PORT:-8080}

EXPOSE 8080

ENTRYPOINT ["java", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-Dserver.port=${SERVER_PORT}", \
    "-jar", "app.jar"]
