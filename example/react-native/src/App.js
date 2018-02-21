import { DrawerNavigator } from 'react-navigation';
import StartScreen from './components/StartScreen';

// We will add more demo screens here as the SDK grows
const App = DrawerNavigator({
  StartScreen: {
    screen: StartScreen,
    navigationOptions: {
      title: "Welcome"
    }
  }
}, {
  initialRouteName: "StartScreen"
});

export default App;