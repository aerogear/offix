package org.aerogear.mobile.core;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.Build;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class MobileCoreModule extends CordovaPlugin {

  public MobileCoreModule() {
  }

  public MobileCoreModule(Context context) {
  }

  @Override
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    // Initialization logic here
  }

  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
    if (action.equals("getMetrics")) {
      try {
        callbackContext.success(getMetrics());
      } catch (Exception e) {
        callbackContext.error(e.getMessage());
      }

      return true;
    }

    return false;
  }

  @Override
  public String getServiceName() {
    return "MobileCore";
  }

  public JSONObject getMetrics() throws NameNotFoundException, JSONException {
    JSONObject metrics = new JSONObject();

    metrics.put("app", getAppMetrics());
    metrics.put("device", getDeviceMetrics());

    return metrics;
  }

  public JSONObject getDeviceMetrics() throws JSONException {
    final JSONObject deviceMetrics = new JSONObject();
    deviceMetrics.put("platform", "android");
    deviceMetrics.put("platformVersion", String.valueOf(Build.VERSION.SDK_INT));

    return deviceMetrics;
  }

  public JSONObject getAppMetrics() throws JSONException, NameNotFoundException {
    String packageName = this.cordova.getActivity().getPackageName();
    PackageInfo packageInfo = this.cordova.getActivity().getPackageManager()
      .getPackageInfo(packageName, 0);

    final JSONObject appMetrics = new JSONObject();
    appMetrics.put("appId", packageName);
    // sdkVersion is included in package.json, it must be added by JS interface
    appMetrics.put("sdkVersion", "");
    appMetrics.put("appVersion", packageInfo.versionName);

    return appMetrics;
  }
}