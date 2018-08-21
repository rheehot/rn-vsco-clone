import {createStackNavigator} from 'react-navigation'
import {Home} from './screen/home'

export const AppNavigator = createStackNavigator({
  Home       : {screen: Home, navigationOptions: {title: 'Home'}},
}, {
  initialRouteName : 'Home',
  headerMode       : 'screen',
  navigationOptions: {
    headerTitleStyle: {color: '#000000'},
    headerStyle     : {
      height           : 60,
      backgroundColor  : 'transparent',
      borderWidth      : 0,
      borderBottomWidth: 0,
      shadowColor      : 'transparent',
      shadowOpacity    : 0,
      shadowOffset     : {
        height: 0,
        width : 0,
      },
      elevation        : 0,
    },
  },
  cardStyle        : {backgroundColor: '#ffffff'},
})
