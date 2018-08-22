import {
  ActivityIndicator,
  CameraRoll,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  PermissionsAndroid,
} from 'react-native'
import * as React from 'react'
import {AnimationText} from './animationText'
import {safeBottomAreaSize, screenWidth} from './screenSize'

interface ImageItemState {

}

interface ImageItemProps {
  index: string
  item: any
  selected: boolean
  onPressItem: (item: any, index: string | number) => void
  imageSize: number
  imageMargin:number
}

class ImageItem extends React.PureComponent<ImageItemProps, ImageItemState> {
  constructor(props: ImageItemProps) {
    super(props)
  }

  _onPress = (uri: string, index: string) => {
    this.props.onPressItem(uri, index)
  }

  render() {
    const uri = this.props.item.node.image.uri
    const index = this.props.index
    const imageMargin = this.props.imageMargin
    const imageWidth = this.props.imageSize
    const imageHeight = imageWidth * this.props.item.node.image.height / this.props.item.node.image.width
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={{padding:imageMargin / 2,width: imageWidth + imageMargin, height: imageHeight + imageMargin}}
        onPress={() => this._onPress(uri, index)}
      >
        <Image
          source={{uri}}
          style={{
            width      : imageWidth,
            height     : imageHeight,
            borderWidth: 5,
            borderColor: this.props.selected ? '#ffdd03' : 'transparent',
          }}
          resizeMode='cover'
        />
      </TouchableOpacity>
    )
  }
}

interface CameraRollPickerState {
  selected: number
  initialLoading: boolean
  loadingMore: boolean
}

interface CameraRollPickerProps {
  scrollRenderAheadDistance?: number,
  initialListSize?: number,
  pageSize?: number,
  batchSize?: number,
  removeClippedSubviews?: boolean,
  groupTypes?: 'Album' | 'All' | 'Event' | 'Faces' | 'Library' | 'PhotoStream' | 'SavedPhotos',
  maximum?: number,
  assetType?: 'Photos' | 'Videos' | 'All',
  imagesPerRow?: number,
  imageMargin?: number,
  containerWidth?: number,
  onSubmit?: (selected) => void,
  selected?: Map<string, any>,
  selectedMarker?: React.ReactElement<any>,
  backgroundColor?: string,
  emptyText?: string,
  emptyTextStyle?: TextStyle,
  loader?: React.ReactElement<any>,
}

export class CameraRollPicker extends React.PureComponent<CameraRollPickerProps, CameraRollPickerState> {
  static defaultProps = {
    scrollRenderAheadDistance: 500,
    initialListSize          : 1,
    pageSize                 : 10,
    removeClippedSubviews    : true,
    groupTypes               : 'SavedPhotos',
    maximum                  : 15,
    imagesPerRow             : 3,
    imageMargin              : 20,
    assetType                : 'Photos',
    backgroundColor          : 'white',
    selected                 : null,
    onSubmit                 : function(selectedImages) {
    },
    emptyText                : 'No photos.',
  }

  public images = []
  public imageSize: number

  public lastCursor = null
  public noMore = false

  public selectedItem: any

  constructor(props: CameraRollPickerProps) {
    super(props)

    this.state = {
      selected      : null,
      initialLoading: true,
      loadingMore   : false,
    }

    this._onEndReached = this._onEndReached.bind(this)
    this._renderFooterSpinner = this._renderFooterSpinner.bind(this)
    this._checkPermission = this._checkPermission.bind(this)
    this._submit = this._submit.bind(this)
  }

  async componentWillMount() {
    this.imageSize = (screenWidth - (this.props.imagesPerRow + 1) * this.props.imageMargin) / this.props.imagesPerRow

    if (await this._checkPermission()) {
      this.fetch()
    }
  }

  fetch() {
    if (!this.state.loadingMore) {
      this.setState({loadingMore: true}, () => {
        this._fetch()
      })
    }
  }

  _fetch() {
    const {groupTypes, assetType} = this.props

    let fetchParams = {
      first     : 30,
      groupTypes: groupTypes,
      assetType : assetType,
    }

    if (Platform.OS === 'android') {
      // not supported in android
      delete fetchParams.groupTypes
    }

    if (this.lastCursor) {
      fetchParams['after'] = this.lastCursor
    }

    CameraRoll.getPhotos(fetchParams)
      .then((data) => this._appendImages(data), (e) => null)
  }

  async _checkPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ])

        Object.keys(granted).map((key) => {
          if (granted[key] === PermissionsAndroid.RESULTS.DENIED || PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            console.log('has no permission')

            return false
          }
        })

        console.log('has permission')

        return true
      } catch (err) {
        console.warn(err)
      }
    }
    else {
      return true
    }
  }

  _appendImages(data) {
    const assets = data.edges

    if (!data.page_info.has_next_page) {
      this.noMore = true
    }

    if (assets.length > 0) {
      this.lastCursor = data.page_info.end_cursor
      this.images = this.images.concat(assets)
    }

    this.setState({
      loadingMore   : false,
      initialLoading: false,
    })
  }

  _onEndReached() {
    if (!this.noMore) {
      this.fetch()
    }
  }

  _keyExtractor = (item, index) => index

  _onPressItem = (item, key: number) => {
    this.setState((state) => {
      let selected = null
      if (state.selected !== key) {
        selected = key
        this.selectedItem = item
      }
      else {
        selected = null
        this.selectedItem = null
      }
      return {selected}
    })
  }

  _renderFooterSpinner() {
    return (
      <View style={styles.listFooterContainer}>

      </View>
    )
  }

  _renderItem = ({item, index}) => (
    <ImageItem
      index={index}
      imageSize={this.imageSize}
      imageMargin={this.props.imageMargin}
      item={item}
      onPressItem={this._onPressItem}
      selected={this.state.selected === index}
    />
  )

  _submit() {
    if (this.props.onSubmit) {
      this.props.onSubmit(this.selectedItem)
    }
  }

  render() {
    const hasSelectedItem = this.state.selected !== null
    return (
      <View style={styles.container}>
        <FlatList
          removeClippedSubviews={true}
          numColumns={this.props.imagesPerRow}
          onEndReached={this._onEndReached}
          data={this.images}
          extraData={this.state}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
          ListFooterComponent={this._renderFooterSpinner}
          style={styles.listContainer}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />

        <AnimationText
          text="Edit"
          active={hasSelectedItem}
          activeStyle={styles.activeStyle}
          activeContainerStyle={styles.activeContainerStyle}
          inactiveStyle={styles.inactiveStyle}
          inactiveContainerStyle={styles.inactiveContainerStyle}
          onPress={this._submit}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container             : {
    flex: 1,
  },
  listContainer         : {
    flex   : 1,
  },
  contentContainer      : {
    padding:10
  },
  activeStyle           : {
    color     : '#ffffff',
    fontSize  : 20,
    fontWeight: '500',
  },
  activeContainerStyle  : {
    position       : 'absolute',
    bottom         : 0,
    left           : 10,
    right          : 10,
    height         : 50 + safeBottomAreaSize,
    alignItems     : 'center',
    justifyContent : 'center',
    borderRadius   : 0,
    backgroundColor: '#FF19DD',
    // borderTopWidth:2,
    // borderColor:'#ffffff'
  },
  inactiveStyle         : {
    color     : '#797979',
    fontSize  : 20,
    fontWeight: '500',
  },
  inactiveContainerStyle: {
    position       : 'absolute',
    bottom         : -50 - safeBottomAreaSize,
    left           : 20,
    right          : 20,
    height         : 50 + safeBottomAreaSize,
    alignItems     : 'center',
    justifyContent : 'center',
    borderRadius   : 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  listFooterContainer   : {
    width          : screenWidth,
    height         : 90,
    backgroundColor: 'transparent',
  },
})