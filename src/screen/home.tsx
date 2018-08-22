import React from 'react'
import {Button, View, StyleSheet, StatusBar, TouchableOpacity, Text} from 'react-native'
import {auth, AuthState} from '../redux/auth/reducer'
import {connect} from 'react-redux'
import {RootState} from '../redux'
import {login} from '../redux/auth/actions'
import {LoginStatus} from '../components/loginStatus'
import {NavigationActions} from 'react-navigation'
import {CameraRollPicker} from '../lib/cameraRollPicker'
import Swiper from 'react-native-swiper'
import {RNCamera} from 'react-native-camera'
import FeatherIcon from 'react-native-vector-icons/Feather'
import {Camera} from './camera'
import {hiddenStatusBarSize, statusBarSize} from '../lib/screenSize'
import {isIphoneX} from 'react-native-iphone-x-helper'
import {Roll} from './roll'

interface State {
  slideIndex: number
}

interface OwnProps {
}

interface StateProps {
  auth: AuthState,
}

interface DispatchProps {
  login: typeof login
  navigate: typeof NavigationActions.navigate
}

interface Props extends StateProps, DispatchProps, OwnProps {
}

class HomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      slideIndex: 1,
    }

    this.onSlideIndexChanged = this.onSlideIndexChanged.bind(this)
  }

  swiper: any

  goToSlider(index: number) {
    if (this.swiper) {
      this.swiper.scrollBy(index, true)
    }
  }

  onSlideIndexChanged(slideIndex) {
    this.setState({slideIndex})
  }

  _renderCamera() {
    return (
      <Camera enable={this.state.slideIndex === 0}/>
    )
  }

  _renderRoll() {
    return (
      <Roll/>
    )
  }

  _renderHeader() {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => this.goToSlider(-1)}
        >
          <FeatherIcon
            name="camera"
            size={25}
            color="#000000"
          />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>
          Unless
        </Text>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => this.goToSlider(1)}
        >
          <FeatherIcon
            name="download"
            size={25}
            color="#000000"
          />
        </TouchableOpacity>
      </View>
    )
  }

  _renderSlider() {
    return (
      <Swiper
        ref={ref => {
          this.swiper = ref
        }}
        index={1}
        onIndexChanged={this.onSlideIndexChanged}
        loop={false}
        showsButtons={false}
        showsPagination={false}>
        <View style={styles.container}>
          {
            this._renderCamera()
          }
        </View>
        <View style={styles.container}>
          {
            this._renderHeader()
          }
          {
            this._renderRoll()
          }
        </View>
        <View style={styles.container}>
        </View>
      </Swiper>
    )
  }


  render() {
    return (
      <View style={styles.container}>
        {
          isIphoneX() ?
            <StatusBar
              backgroundColor="#ffffff"
              barStyle="dark-content"
            />
            :
            <StatusBar hidden={true}/>

        }
        {
          this._renderSlider()
        }

      </View>
    )
  }
}

export const
  Home = connect<StateProps, DispatchProps, OwnProps>((state: RootState) => ({
    auth: state.auth,
  }), {
    login,
    navigate: NavigationActions.navigate,
  })(HomeScreen)

const styles = StyleSheet.create({
  container : {
    flex           : 1,
    backgroundColor: '#ffffff',
  },
  header    : {
    height           : hiddenStatusBarSize + 50,
    paddingTop       : hiddenStatusBarSize,
    backgroundColor  : '#ffffff',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    flexWrap         : 'wrap',
    flexDirection    : 'row',
    alignItems       : 'center',
    justifyContent   : 'space-between',
  },
  headerLogo: {
    fontSize  : 20,
    fontWeight: '500',
    fontFamily: 'Hind',
    color     : '#000000',
    marginTop : 5,
  },
  headerIcon: {
    width         : 50,
    height        : 50,
    marginLeft    : 5,
    marginRight   : 5,
    flexWrap      : 'wrap',
    flexDirection : 'row',
    alignItems    : 'center',
    justifyContent: 'center',
  },
})