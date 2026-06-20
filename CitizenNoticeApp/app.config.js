const { withAndroidManifest } = require("expo/config-plugins");
const appJson = require("./app.json");

const withAndroidPermissionHardening = (config) =>
  withAndroidManifest(config, (manifestConfig) => {
    const application = manifestConfig.modResults.manifest.application?.[0]?.$;
    const manifest = manifestConfig.modResults.manifest;
    const blockedPermissions = new Set(appJson.expo.android?.blockedPermissions || []);

    if (application) {
      delete application["android:requestLegacyExternalStorage"];
    }

    if (Array.isArray(manifest["uses-permission"])) {
      manifest["uses-permission"] = manifest["uses-permission"].filter((permission) => {
        const name = permission?.$?.["android:name"];
        return !blockedPermissions.has(name);
      });
    }

    return manifestConfig;
  });

module.exports = ({ config }) => ({
  ...config,
  ...appJson.expo,
  plugins: [...(appJson.expo.plugins || []), withAndroidPermissionHardening],
});
