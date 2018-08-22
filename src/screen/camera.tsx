import React from 'react'
import {
  Button,
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  TouchableHighlightComponent,
  TouchableHighlight, CameraRoll, Dimensions, TouchableOpacityComponent, Image,
} from 'react-native'
import {auth, AuthState} from '../redux/auth/reducer'
import {connect} from 'react-redux'
import {RootState} from '../redux'
import {login} from '../redux/auth/actions'
import {LoginStatus} from '../components/loginStatus'
import {NavigationActions} from 'react-navigation'
import {CameraRollPicker} from '../lib/cameraRollPicker'
import Swiper from 'react-native-swiper'
import {Constants, RNCamera} from 'react-native-camera'
import FeatherIcon from 'react-native-vector-icons/Feather'
import CameraRollExtended from 'react-native-store-photos-album'
import {ratio34Height, safeBottomAreaSize} from '../lib/screenSize'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height
interface State {
  autoFocus: Constants['AutoFocus']
  flashMode: Constants['FlashMode']
  cameraType: Constants['Type']
  whiteBalance: Constants['WhiteBalance']
  zoom: number
  isCameraReady: boolean
  latestPictureUri: string
}

interface OwnProps {
  enable: boolean
  latestPictureUri?:string
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

class CameraScreen extends React.Component<Props, State> {
  static defaultProps = {
    enable: false,
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      autoFocus       : RNCamera.Constants.AutoFocus.on,
      flashMode       : RNCamera.Constants.FlashMode.off,
      cameraType      : RNCamera.Constants.Type.back,
      whiteBalance    : RNCamera.Constants.WhiteBalance.auto,
      zoom            : 0,
      isCameraReady   : false,
      latestPictureUri: this.props.latestPictureUri || null ,
    }

    this.onCameraReady = this.onCameraReady.bind(this)
    this.onToggleAutoFocus = this.onToggleAutoFocus.bind(this)
    this.onToggleFlashMode = this.onToggleFlashMode.bind(this)
    this.onToggleCameraType = this.onToggleCameraType.bind(this)
    this.onToggleWhieBalance = this.onToggleWhieBalance.bind(this)
    this.takePicture = this.takePicture.bind(this)
    this.onSavePicture = this.onSavePicture.bind(this)
  }

  camera: any

  onCameraReady() {
    this.setState({
      isCameraReady: true,
    })
  }

  onToggleAutoFocus() {
    this.setState(({autoFocus}) => {
      if (autoFocus === RNCamera.Constants.AutoFocus.off) {
        return {autoFocus: RNCamera.Constants.AutoFocus.on}
      }
      else {
        return {autoFocus: RNCamera.Constants.AutoFocus.off}
      }
    })
  }

  onToggleFlashMode() {
    this.setState(({flashMode}) => {
      if (flashMode === RNCamera.Constants.FlashMode.off) {
        return {flashMode: RNCamera.Constants.FlashMode.on}
      }
      else if (flashMode === RNCamera.Constants.FlashMode.on) {
        return {flashMode: RNCamera.Constants.FlashMode.auto}
      }
      else {
        return {flashMode: RNCamera.Constants.FlashMode.off}
      }
    })
  }

  onToggleCameraType() {
    this.setState(({cameraType}) => {
      if (cameraType === RNCamera.Constants.Type.back) {
        return {cameraType: RNCamera.Constants.Type.front}
      }
      else {
        return {cameraType: RNCamera.Constants.Type.back}
      }
    })
  }

  onToggleWhieBalance() {
    this.setState(({whiteBalance}) => {
      switch (whiteBalance) {
        case RNCamera.Constants.WhiteBalance.auto:
          return {whiteBalance: RNCamera.Constants.WhiteBalance.cloudy}
        case RNCamera.Constants.WhiteBalance.cloudy:
          return {whiteBalance: RNCamera.Constants.WhiteBalance.fluorescent}
        case RNCamera.Constants.WhiteBalance.fluorescent:
          return {whiteBalance: RNCamera.Constants.WhiteBalance.incandescent}
        case RNCamera.Constants.WhiteBalance.incandescent:
          return {whiteBalance: RNCamera.Constants.WhiteBalance.shadow}
        case RNCamera.Constants.WhiteBalance.shadow:
          return {whiteBalance: RNCamera.Constants.WhiteBalance.sunny}
        default:
          return {whiteBalance: RNCamera.Constants.WhiteBalance.auto}
      }
    })
  }

  onSavePicture(uri: string) {
    this.setState({
      latestPictureUri: uri,
    })
  }

  async takePicture() {
    if (this.camera) {
      const options = {quality: 1, base64: true, forceUpOrientation: true}
      const data = await this.camera.takePictureAsync(options)
      console.log(data)
      const savePictureUri = await CameraRollExtended.saveToCameraRoll({uri: data.uri, album: 'Unless'}, 'photo')
      console.log('savePicture', savePictureUri)
      this.onSavePicture(savePictureUri)
    }
  }

  _renderCapture() {
    return (
      <TouchableOpacity
        onPress={this.takePicture.bind(this)}
        style={styles.capture}
      >
        <View>
        </View>
      </TouchableOpacity>
    )
  }

  _renderLatestPicture() {
    return (
      <TouchableOpacity style={styles.latestPictureContainer}>
        {
          this.state.latestPictureUri ?
              <Image
                source={{uri: this.state.latestPictureUri}}
                style={styles.latestPicture}
                resizeMode='cover'
              />
            :
            <FeatherIcon
              name="chevron-right"
              size={32}
              color="#ffffff"
            />
        }
      </TouchableOpacity>
    )
  }

  _renderSwitchCameraType() {
    return (
      <TouchableOpacity
        style={styles.switchCameraType}
        onPress={this.onToggleCameraType}
      >
        <FeatherIcon
          name="repeat"
          size={25}
          color="#ffffff"
        />
      </TouchableOpacity>
    )
  }

  _renderCamera() {
    return (
      <View style={styles.container}>
        {
          this.props.enable ?
            <RNCamera
              ref={ref => {
                this.camera = ref
              }}
              style={styles.preview}
              autoFocus={this.state.autoFocus}
              type={this.state.cameraType}
              flashMode={this.state.flashMode}
              whiteBalance={this.state.whiteBalance}
              zoom={this.state.zoom}
              permissionDialogTitle={'Permission to use camera'}
              permissionDialogMessage={'We need your permission to use your camera phone'}
              onCameraReady={this.onCameraReady}
            />
            :
            null
        }

        <View style={styles.controllerContainer}>
          {
            this._renderSwitchCameraType()
          }

          {
            this._renderCapture()
          }

          {
            this._renderLatestPicture()
          }
        </View>
      </View>
    )
  }


  render() {
    return (
      <View style={styles.container}>
        {
          this._renderCamera()
        }
      </View>
    )
  }
}

export const
  Camera = connect<StateProps, DispatchProps, OwnProps>((state: RootState) => ({
    auth: state.auth,
  }), {
    login,
    navigate: NavigationActions.navigate,
  })(CameraScreen)

const styles = StyleSheet.create({
  container          : {
    flex           : 1,
    flexDirection  : 'column',
    justifyContent : 'flex-end',
    backgroundColor: '#000000',
  },
  preview            : {
    width      : screenWidth,
    height     : ratio34Height,
    borderWidth: 1,
    borderColor: 'red',
  },
  capture            : {
    width           : 80,
    height          : 80,
    backgroundColor : 'transparent',
    borderColor     : '#FF19DD',
    borderWidth     : 2,
    borderRadius    : 40,
    marginHorizontal: 30,
  },
  latestPictureContainer     : {
    width           : 50,
    height          : 50,
    marginHorizontal: 20,
    flexWrap:'wrap',
    alignItems:'flex-start',
    justifyContent:'center'
  },
  latestPicture:{
    width       : 50,
    height      : 50,
    borderRadius: 5,
    borderWidth:2,
    borderColor:'#ffffff'
  },
  switchCameraType   : {
    width           : 50,
    height          : 50,
    marginHorizontal: 20,
    flexWrap:'wrap',
    alignItems:'flex-end',
    justifyContent:'center'
  },
  controllerContainer: {
    flex           : 0,
    paddingTop     : 20,
    paddingBottom  : 20 + safeBottomAreaSize,
    flexWrap       : 'wrap',
    flexDirection  : 'row',
    justifyContent : 'center',
    alignItems     : 'center',
    // backgroundColor:'rgba(0,0,0,0.5)'
    backgroundColor: '#000000',
  },

})