import React from 'react'
import {Button, View, StyleSheet, StatusBar} from 'react-native'
import {auth, AuthState} from '../redux/auth/reducer'
import {connect} from 'react-redux'
import {RootState} from '../redux'
import {login} from '../redux/auth/actions'
import {LoginStatus} from '../components/loginStatus'
import {NavigationActions} from 'react-navigation'
import {CameraRollPicker} from '../lib/cameraRollPicker'
import Swiper from 'react-native-swiper'
import {statusBarSize} from '../lib/statusBarSize'

interface State {
  pictures: string[]
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
      pictures: [],
    }

    this.getSelectedPictures = this.getSelectedPictures.bind(this)
  }

  async getSelectedPictures(pictures) {
    if (pictures && pictures.length > 0) {
      this.setState({
        pictures: pictures,
      })
    }
  }

  _renderSlider() {
    return (
      <Swiper index={1}
              loop={false}
              showsButtons={false}
              showsPagination={false}>
        <View style={styles.cameraContainer}>
        </View>
        <View style={styles.container}>
          {
            this._renderMain()
          }
        </View>
        <View style={styles.container}>
        </View>
      </Swiper>
    )
  }

  _renderMain() {
    return (
      <View style={styles.container}>
        {
          this._renderHeader()
        }

        <CameraRollPicker
          onSubmit={this.getSelectedPictures}
          maximum={1}/>
      </View>
    )
  }

  _renderHeader() {
    return (
      <View style={styles.header}>

      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor="#ffffff"
          barStyle="dark-content"
        />
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
  container      : {
    flex           : 1,
    backgroundColor: '#ffffff',
  },
  cameraContainer: {
    flex           : 1,
    backgroundColor: '#000000',
  },
  header         : {
    height         : statusBarSize + 50,
    backgroundColor: '#ffffff',

    borderBottomWidth: 0.5,
    borderBottomColor: '#d3d3d3',
  },
})