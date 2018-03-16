const ConfigService = require('@aerogearservices/core').ConfigService;

document.addEventListener("deviceready", onDeviceReady, false);
// Cordova is loaded and it is now safe to make calls Cordova methods
function onDeviceReady() {

  const config = new ConfigService(require("../mobile-services"));
  // Framework7 App main instance
  const app = new Framework7({
    root: '#app', // App root element
    id: 'io.framework7.aerogear', // App bundle ID
    name: 'Framework7', // App name
    theme: 'auto', // Automatic theme detection
    // App routes
    routes: [
      {
        path: '/template/:pageName/',
        async: function (routeTo, routeFrom, resolve, reject) {
          // Router instance
          const router = this;
          // App instance
          const app = router.app;
          // Page name from request
          const pageName = routeTo.params.pageName;
          const template = {
            home: {
              title: "AeroGear",
              blockTitle: "Home page",
              imageName: "cordova_logo.png",
              itemTitle: "Aerogear",
              itemText: "This is AeroGear Cordova Example App",
              websiteName: "AeroGear",
              websiteUrl: "https://aerogear.org/"
            },
            push: {
              title: "Push notifications",
              blockTitle: "Coming soon!",
              imageName: "aerogear_logo.png",
              itemTitle: "Push notifications",
              itemText: "Send push notifications to any device, regardless of platform or network",
              websiteName: "Aerogear Push",
              websiteUrl: "https://aerogear.org/push/"
            },
            auth: {
              title: "Authentication",
              blockTitle: "Authentication via Keycloak",
              imageName: "keycloak_logo.png",
              itemTitle: "Keycloak configuration:",
              itemText: JSON.stringify(config.getKeycloakConfig()),
              websiteName: "Keycloak",
              websiteUrl: "https://www.keycloak.org/"
            },
            metrics: {
              title: "Metrics",
              blockTitle: "Mobile device metrics",
              imageName: "aerogear_logo.png",
              itemTitle: "Metrics configuration:",
              itemText: JSON.stringify(config.getMetricsConfig()),
              websiteName: "Aerogear",
              websiteUrl: "https://aerogear.org/push/"
            }
          };

          // Resolve route to load page
          resolve(
            {
              componentUrl: './pages/template.html',
            },
            {
              context: {
                template: template,
                pageName: pageName
              }
            }
          );
        }
      }
    ]
  });

  // Init/Create main view
  const mainView = app.views.create('.view-main');
  mainView.router.navigate('/template/home/')
}

