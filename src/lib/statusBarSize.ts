import {ifIphoneX} from 'react-native-iphone-x-helper'
import {Platform} from 'react-native'

export const statusBarSize = function() {
  if (Platform.OS === 'ios') {
    return ifIphoneX(44, 20)
  }

  return 0
}()