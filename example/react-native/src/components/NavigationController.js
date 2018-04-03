import { StackNavigator, DrawerNavigator } from "react-navigation";
import { HomeScreen, HttpScreen } from "./screens";

/**
 * Main navigation controller contains all children screen components
 */
const NavigationController = DrawerNavigator({
  Home: StackNavigator({ screen: HomeScreen }),
  Http: StackNavigator({ screen: HttpScreen }),
}, {
    initialRouteName: "Home"
  });

export default NavigationController;
