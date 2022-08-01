plugins {
    java
    application
    id("de.jjohannes.extra-java-module-info") version "0.15"
}

group = "ee.verx"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

tasks.jar.get().enabled = false

application {
    mainModule.set("arbeix.main")
    mainClass.set("ee.verx.arbeix.Main")
}
