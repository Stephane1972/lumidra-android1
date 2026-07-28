# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# ---- Règles ajoutées pour activer la minification (R8) sans casser le pont natif ----
# Basées sur les recommandations officielles de Capacitor : sans elles, R8 peut renommer
# ou supprimer des classes que le pont JavaScript<->natif appelle par réflexion, ce qui
# casserait silencieusement les plugins (notifications, partage, fichiers) au runtime.
-keep public class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * { *; }
-keep public class com.capacitorjs.plugins.** { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod public *;
}
-keepattributes *Annotation*
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-dontwarn com.getcapacitor.**

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile
