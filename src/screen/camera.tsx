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
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import CameraRollExtended from 'react-native-store-photos-album'
import {hiddenStatusBarSize, ratio34Height, safeBottomAreaSize, screenWidth, screenHeight} from '../lib/screenSize'

const CONTROLLER_HEIGHT = 120 + safeBottomAreaSize
const isShortHeight = screenHeight - (ratio34Height + CONTROLLER_HEIGHT) < 100

console.log('isShortHeight', isShortHeight)

type GridType = Readonly<{on: any, off: any}>;

const GridConstants = {
  on : 'on',
  off: 'off',
} as GridType

interface State {
  autoFocus: Constants['AutoFocus']
  flashMode: Constants['FlashMode']
  cameraType: Constants['Type']
  whiteBalance: Constants['WhiteBalance']
  grid: GridType
  zoom: number
  isCameraReady: boolean
  isTakingPicture: boolean
  latestPictureUri: string
}

interface OwnProps {
  enable: boolean
  latestPictureUri?: string
  goToSlider: (index: number) => void
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
      grid            : GridConstants.off,
      zoom            : 0,
      isCameraReady   : false,
      isTakingPicture : false,
      latestPictureUri: this.props.latestPictureUri || null,
    }

    this.onCameraReady = this.onCameraReady.bind(this)
    this.onToggleAutoFocus = this.onToggleAutoFocus.bind(this)
    this.onToggleFlashMode = this.onToggleFlashMode.bind(this)
    this.onToggleCameraType = this.onToggleCameraType.bind(this)
    this.onToggleWhiteBalance = this.onToggleWhiteBalance.bind(this)
    this.onToggleGrid = this.onToggleGrid.bind(this)
    this.goBackHome = this.goBackHome.bind(this)
    this.takePicture = this.takePicture.bind(this)
    this.onSavePicture = this.onSavePicture.bind(this)
  }

  camera: any

  onCameraReady() {
    this.setState({
      isCameraReady: true,
    })
  }

  goBackHome() {
    if (this.props.goToSlider) {
      this.props.goToSlider(1)
    }
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
        return {flashMode: RNCamera.Constants.FlashMode.auto}
      }
      else if (flashMode === RNCamera.Constants.FlashMode.auto) {
        return {flashMode: RNCamera.Constants.FlashMode.on}
      }
      else if (flashMode === RNCamera.Constants.FlashMode.on) {
        return {flashMode: RNCamera.Constants.FlashMode.torch}
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

  onToggleWhiteBalance() {
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

  onToggleGrid() {
    this.setState(({grid}) => {
      if (grid === GridConstants.off) {
        return {grid: GridConstants.on}
      }
      else {
        return {grid: GridConstants.off}
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
      const options = {quality: 1, base64: false, forceUpOrientation: true}
      this.setState({
        isTakingPicture: true,
      }, () => {
        setTimeout(() => {
          this.setState({
            isTakingPicture: false,
          })
        }, 100)
      })
      const data = await this.camera.takePictureAsync(options)
      // console.log(data)

      const savePictureUri = await CameraRollExtended.saveToCameraRoll({uri: data.uri, album: 'Unless'}, 'photo')
      // console.log('savePicture', savePictureUri)
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
      <TouchableOpacity style={styles.latestPictureContainer} onPress={this.goBackHome}>
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

  _renderAdjustController() {
    return (
      <View style={styles.adjustControllerContainer}>
        {
          this._renderGridType()
        }

        {
          this._renderAutoFocus()
        }

        {
          this._renderFlashMode()
        }

        {
          this._renderWhiteBalance()
        }
      </View>
    )
  }

  _renderAutoFocusTypeIcon(type) {
    if (type === RNCamera.Constants.AutoFocus.off) {
      return (
        <FeatherIcon
          name="x"
          size={13}
          color="#ffffff"
        />
      )
    }
    else {
      return (
        <Text style={styles.adjustItemSubText}>
          A
        </Text>
      )
    }
  }

  _renderAutoFocus() {
    const type = this.state.autoFocus

    return (
      <TouchableOpacity
        style={styles.adjustItem}
        onPress={this.onToggleAutoFocus}
      >
        <FeatherIcon
          name="crosshair"
          size={25}
          color="#ffffff"
        />
        <View style={styles.adjustSubItem}>
          {
            this._renderAutoFocusTypeIcon(type)
          }
        </View>
      </TouchableOpacity>
    )
  }

  _renderFlashModeTypeIcon(type) {
    switch (type) {
      case RNCamera.Constants.FlashMode.auto:
        return (
          <Text style={styles.adjustItemSubText}>
            A
          </Text>
        )
      case RNCamera.Constants.FlashMode.off:
        return (
          <FeatherIcon
            name="x"
            size={13}
            color="#ffffff"
          />
        )

      case RNCamera.Constants.FlashMode.on:
        return (
          <FeatherIcon
            name="circle"
            size={13}
            color="#ffffff"
          />
        )

      case RNCamera.Constants.FlashMode.torch:
        return (
          <Text style={styles.adjustItemSubText}>
            T
          </Text>
        )
    }
  }

  _renderFlashMode() {
    const type = this.state.flashMode

    return (
      <TouchableOpacity
        style={styles.adjustItem}
        onPress={this.onToggleFlashMode}
      >
        <FeatherIcon
          name="zap"
          size={25}
          color="#ffffff"
        />
        <View style={styles.adjustSubItem}>
          {
            this._renderFlashModeTypeIcon(type)
          }
        </View>
      </TouchableOpacity>
    )
  }

  _renderWhiteBalanceTypeIcon(type) {
    switch (type) {
      case RNCamera.Constants.WhiteBalance.auto:
        return (
          <Text style={[styles.adjustItemSubText]}>
            Auto
          </Text>
        )
      case RNCamera.Constants.WhiteBalance.sunny:
        return (
          <Text style={styles.adjustItemSubText}>
            Sunny
          </Text>
        )

      case RNCamera.Constants.WhiteBalance.shadow:
        return (
          <Text style={styles.adjustItemSubText}>
            Shadow
          </Text>
        )

      case RNCamera.Constants.WhiteBalance.incandescent:
        return (
          <Text style={styles.adjustItemSubText}>
            Incandescent
          </Text>
        )

      case RNCamera.Constants.WhiteBalance.fluorescent:
        return (
          <Text style={styles.adjustItemSubText}>
            Fluorescent
          </Text>
        )

      case RNCamera.Constants.WhiteBalance.cloudy:
        return (
          <Text style={styles.adjustItemSubText}>
            Cloudy
          </Text>
        )
    }
  }

  _renderWhiteBalance() {
    const type = this.state.whiteBalance

    return (
      <TouchableOpacity
        style={[styles.adjustItem, {width: 65, marginHorizontal: 5}]}
        onPress={this.onToggleWhiteBalance}
      >
        <Text style={styles.adjustItemText}>
          WB
        </Text>
        <View style={[styles.adjustSubItem, {width: 65}]}>
          {
            this._renderWhiteBalanceTypeIcon(type)
          }
        </View>
      </TouchableOpacity>
    )
  }

  _renderGridTypeIcon(type) {
    if (type === GridConstants.off) {
      return (
        <FeatherIcon
          name="x"
          size={13}
          color="#ffffff"
        />
      )
    }
    else {
      return (
        <FeatherIcon
          name="circle"
          size={13}
          color="#ffffff"
        />
      )
    }
  }

  _renderGridType() {
    const type = this.state.grid

    return (
      <TouchableOpacity
        style={[styles.adjustItem, {width: 50}]}
        onPress={this.onToggleGrid}
      >
        <MaterialIcon
          name="border-all"
          size={27}
          color="#ffffff"
        />
        <View style={styles.adjustSubItem}>
          {
            this._renderGridTypeIcon(type)
          }
        </View>
      </TouchableOpacity>
    )
  }

  _renderGrid(){
    if(this.state.grid === GridConstants.on){
      return (
        <View style={styles.gridContainer}>
          <View style={styles.gridHorizonLine}>

          </View>

          <View style={styles.gridVerticalLine}>

          </View>
        </View>
      )
    }
    else{
      return null
    }
  }

  _renderCamera() {
    return (
      <View style={styles.cameraContainer}>
        <View style={styles.previewContainer}>
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
              >
                {
                  this._renderGrid()
                }
                <View style={[styles.previewBorder, this.state.isTakingPicture ? styles.takingSnapshotBorder : null]}>
                  {
                    isShortHeight ?
                      this._renderAdjustController()
                      :
                      null
                  }
                </View>
              </RNCamera>
              :
              null
          }
        </View>
        {
          !isShortHeight ?
            this._renderAdjustController()
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
  container                : {
    flex           : 1,
    backgroundColor: '#000000',
    paddingTop     : hiddenStatusBarSize,
  },
  cameraContainer          : {
    flex           : 1,
    flexDirection  : 'column',
    alignItems     : 'stretch',
    justifyContent : 'flex-end',
    backgroundColor: '#000000',
  },
  gridContainer:{
    position:'absolute',
    width : screenWidth,
    height: ratio34Height,
  },
  gridVerticalLine:{
    position:'absolute',
    width : screenWidth / 2,
    height: ratio34Height,
    borderRightWidth:1,
    borderColor:'#ffffff'
  },
  gridHorizonLine:{
    position:'absolute',
    width : screenWidth,
    height: ratio34Height/2,
    borderBottomWidth:1,
    borderColor:'#ffffff'
  },
  previewContainer         : {
    width : screenWidth,
    height: ratio34Height,
  },
  preview                  : {
    width : screenWidth,
    height: ratio34Height,
  },
  previewBorder            : {
    position       : 'absolute',
    top            : 0,
    left           : 0,
    backgroundColor: 'transparent',
    width          : screenWidth,
    height         : ratio34Height,
    flexDirection  : 'column',
    alignItems     : 'stretch',
    justifyContent : 'flex-end',
  },
  takingSnapshotBorder     : {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  capture                  : {
    width           : 80,
    height          : 80,
    backgroundColor : 'transparent',
    borderColor     : '#FF19DD',
    // borderColor     : '#ffffff',
    borderWidth     : 2,
    borderRadius    : 40,
    marginHorizontal: 30,
  },
  latestPictureContainer   : {
    width           : 50,
    height          : 50,
    marginHorizontal: 10,
    flexWrap        : 'wrap',
    alignItems      : 'center',
    justifyContent  : 'center',
  },
  latestPicture            : {
    width       : 50,
    height      : 50,
    borderRadius: 5,
    borderWidth : 2,
    borderColor : '#ffffff',
  },
  switchCameraType         : {
    width           : 50,
    height          : 50,
    marginHorizontal: 10,
    flexWrap        : 'wrap',
    alignItems      : 'center',
    justifyContent  : 'center',
  },
  adjustControllerContainer: {
    flexWrap         : 'wrap',
    flexDirection    : 'row',
    justifyContent   : 'space-between',
    alignItems       : 'center',
    paddingHorizontal: 10,
    height           : 50,
    backgroundColor  : 'rgba(0,0,0,0.2)',

    // borderWidth:1,
    // borderColor:'red',
  },
  adjustItem               : {
    width           : 40,
    height          : 50,
    marginHorizontal: 10,
    flexWrap        : 'wrap',
    justifyContent  : 'center',
    alignItems      : 'center',
  },
  adjustSubItem            : {
    position      : 'absolute',
    bottom        : 5,
    right         : 0,
    flexWrap      : 'wrap',
    justifyContent: 'center',
    alignItems    : 'center',
    width         : 15,
    height        : 15,
  },
  adjustItemText           : {
    fontSize  : 15,
    fontFamily: 'Hind',
    color     : '#ffffff',
  },
  adjustItemSubText        : {
    fontSize  : 11,
    fontFamily: 'Hind',
    color     : '#ffffff',
    textAlign : 'center',
  },
  controllerContainer      : {
    flex           : isShortHeight ? 1 : 0,
    paddingTop     : 20,
    paddingBottom  : 20 + safeBottomAreaSize,
    flexDirection  : 'row',
    justifyContent : 'center',
    alignItems     : 'center',
    // backgroundColor:'rgba(0,0,0,0.5)'
    backgroundColor: '#000000',
    // borderWidth:1,
    // borderColor:'blue'
  },

})