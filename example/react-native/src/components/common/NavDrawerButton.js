import React from "react";
import { TouchableOpacity, Image } from "react-native";
import { Images } from "../../assets";

const NavDrawerButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Image
      style={styles.imageStyle}
      source={Images.navDrawerIcon}
    />
  </TouchableOpacity>
);

const styles = {
  imageStyle: {
    margin: 12
  }
};

export { NavDrawerButton };
