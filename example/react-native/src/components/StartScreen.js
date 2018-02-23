import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
import { ConfigService } from '@aerogearservices/core';

const WELCOME_TEXT = "AeroGear SDK Demo";

class StartScreen extends Component {
  openDrawer() {
    this.props.navigation.navigate("DrawerOpen");
  }

  render() {
    var mobileServicesJson = require('../mobile-services.json');
    var config = new ConfigService(mobileServicesJson);
    var keycloakConfig = config.getKeycloakConfig();
    return (
      <TouchableWithoutFeedback onPress={this.openDrawer.bind(this)}>
        <View style={styles.container}>
          <Text style={styles.welcome}>
            {WELCOME_TEXT}
          </Text>
          <Text style={styles.small}>
            Tap to extend drawer
          </Text>
          <Text style="{styles.small}">
            keycloakConfig={JSON.stringify(keycloakConfig)}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  small: {
    fontSize: 12
  }
});

export default StartScreen;