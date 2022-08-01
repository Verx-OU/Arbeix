plugins {
    java
    id("de.jjohannes.extra-java-module-info")
}

group = "ee.verx"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
    mavenLocal()
}

dependencies {
    implementation("org.jetbrains:annotations:23.0.0")
    implementation("org.odftoolkit:odfdom-java:0.10.0") {
        exclude("xml-apis")
        exclude("io.github.git-commit-id")
    }
}

extraJavaModuleInfo {
    module("odfdom-java-0.10.0.jar", "org.odftoolkit.odfdom") {
        exports("org.odftoolkit.odfdom")
        exports("org.odftoolkit.odfdom.changes")
        exports("org.odftoolkit.odfdom.doc.presentation")
        exports("org.odftoolkit.odfdom.doc.table")
        exports("org.odftoolkit.odfdom.doc")
        exports("org.odftoolkit.odfdom.dom.attribute.anim")
        exports("org.odftoolkit.odfdom.dom.attribute.chart")
        exports("org.odftoolkit.odfdom.dom.attribute.config")
        exports("org.odftoolkit.odfdom.dom.attribute.db")
        exports("org.odftoolkit.odfdom.dom.attribute.dr3d")
        exports("org.odftoolkit.odfdom.dom.attribute.draw")
        exports("org.odftoolkit.odfdom.dom.attribute.fo")
        exports("org.odftoolkit.odfdom.dom.attribute.form")
        exports("org.odftoolkit.odfdom.dom.attribute.grddl")
        exports("org.odftoolkit.odfdom.dom.attribute.meta")
        exports("org.odftoolkit.odfdom.dom.attribute.number")
        exports("org.odftoolkit.odfdom.dom.attribute.office")
        exports("org.odftoolkit.odfdom.dom.attribute.presentation")
        exports("org.odftoolkit.odfdom.dom.attribute.script")
        exports("org.odftoolkit.odfdom.dom.attribute.smil")
        exports("org.odftoolkit.odfdom.dom.attribute.style")
        exports("org.odftoolkit.odfdom.dom.attribute.svg")
        exports("org.odftoolkit.odfdom.dom.attribute.table")
        exports("org.odftoolkit.odfdom.dom.attribute.text")
        exports("org.odftoolkit.odfdom.dom.attribute.xforms")
        exports("org.odftoolkit.odfdom.dom.attribute.xhtml")
        exports("org.odftoolkit.odfdom.dom.attribute.xlink")
        exports("org.odftoolkit.odfdom.dom.attribute.xml")
        exports("org.odftoolkit.odfdom.dom.element")
        exports("org.odftoolkit.odfdom.dom.element.anim")
        exports("org.odftoolkit.odfdom.dom.element.chart")
        exports("org.odftoolkit.odfdom.dom.element.config")
        exports("org.odftoolkit.odfdom.dom.element.db")
        exports("org.odftoolkit.odfdom.dom.element.dc")
        exports("org.odftoolkit.odfdom.dom.element.dr3d")
        exports("org.odftoolkit.odfdom.dom.element.draw")
        exports("org.odftoolkit.odfdom.dom.element.form")
        exports("org.odftoolkit.odfdom.dom.element.math")
        exports("org.odftoolkit.odfdom.dom.element.meta")
        exports("org.odftoolkit.odfdom.dom.element.number")
        exports("org.odftoolkit.odfdom.dom.element.office")
        exports("org.odftoolkit.odfdom.dom.element.presentation")
        exports("org.odftoolkit.odfdom.dom.element.script")
        exports("org.odftoolkit.odfdom.dom.element.style")
        exports("org.odftoolkit.odfdom.dom.element.svg")
        exports("org.odftoolkit.odfdom.dom.element.table")
        exports("org.odftoolkit.odfdom.dom.element.text")
        exports("org.odftoolkit.odfdom.dom.element.xforms")
        exports("org.odftoolkit.odfdom.dom")
        exports("org.odftoolkit.odfdom.dom.style")
        exports("org.odftoolkit.odfdom.dom.style.props")
        exports("org.odftoolkit.odfdom.incubator.doc.draw")
        exports("org.odftoolkit.odfdom.incubator.doc.number")
        exports("org.odftoolkit.odfdom.incubator.doc.office")
        exports("org.odftoolkit.odfdom.incubator.doc.style")
        exports("org.odftoolkit.odfdom.incubator.doc.text")
        exports("org.odftoolkit.odfdom.incubator.meta")
        exports("org.odftoolkit.odfdom.incubator.search")
        exports("org.odftoolkit.odfdom.pkg")
        exports("org.odftoolkit.odfdom.pkg.dsig")
        exports("org.odftoolkit.odfdom.pkg.manifest")
        exports("org.odftoolkit.odfdom.pkg.rdfa")
        exports("org.odftoolkit.odfdom.type")
        exports("org.odftoolkit.odfdom.dom.rdfa")

        requires("commons.validator")
        // requires("java.desktop")
        requires("java.logging")
        requires("java.rdfa")
        requires("java.xml")
        requires("org.apache.commons.compress")
        requires("org.apache.commons.lang3")
        requires("org.apache.jena.core")
        requires("org.json")
        requires("org.slf4j")
        requires("serializer")
        requires("xercesImpl")
    }
    module("xercesImpl-2.12.1.jar", "xercesImpl", "2.12.1") {
        exports("org.apache.xerces.dom")
        requiresTransitive("java.xml")
    }
    module("jena-base-4.2.0.jar", "org.apache.jena.base", "4.2.0")
    module("jena-iri-4.2.0.jar", "org.apache.jena.iri", "4.2.0")
    module("jena-core-4.2.0.jar", "org.apache.jena.core", "4.2.0")
    module("serializer-2.7.2.jar", "serializer", "2.7.2") {
        requires("java.xml")
    }
    module("slf4j-api-1.7.32.jar", "org.slf4j", "1.7.32")
    module("java-rdfa-1.0.0-BETA1.jar", "java.rdfa", "1.0.0-BETA1") {
        requires("java.xml")
        requires("org.apache.jena.iri")
    }
    module("collection-0.7.jar", "collection", "0.7")
    module("json-20190722.jar", "org.json")
    // automaticModule("xml-apis-1.4.01.jar", "xml.apis")
    module("commons-validator-1.7.jar", "commons.validator")
    module("commons-beanutils-1.9.4.jar", "commons.beanutils")
    module("commons-digester-2.1.jar", "commons.digester")
    module("commons-logging-1.2.jar", "commons.logging")
    module("commons-cli-1.4.jar", "commons.cli")
    module("commons-csv-1.9.0.jar", "commons.csv")
    module("commons-collections-3.2.2.jar", "commons.collections")
    module("commons-compress-1.21.jar", "org.apache.commons.compress")
    module("commons-codec-1.15.jar", "org.apache.commons.codec")
    module("commons-lang3-3.12.0.jar", "org.apache.commons.lang3")
}

val copyDependencies = task("copyDependencies", Copy::class) {
    from(configurations.compileClasspath).into("${rootProject.buildDir}/libs")
    from(tasks.jar.get().archiveFile).into("${rootProject.buildDir}/libs")
}

tasks.build.get().dependsOn(copyDependencies)
rootProject.tasks.jar.get().dependsOn(tasks.build)
