import React from 'react'
import {StyleSheet, View} from 'react-native'
import {AuthState} from '../redux/auth/reducer'
import {connect} from 'react-redux'
import {RootState} from '../redux'
import {login} from '../redux/auth/actions'
import {NavigationActions} from 'react-navigation'
import {CameraRollPicker} from '../lib/cameraRollPicker'

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

class RollScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      pictures: []
    }

    this.getSelectedPictures = this.getSelectedPictures.bind(this)
  }

  camera: any

  async getSelectedPictures(pictures) {
    if (pictures && pictures.length > 0) {
      this.setState({
        pictures: pictures,
      })
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <CameraRollPicker
          onSubmit={this.getSelectedPictures}
          maximum={1}/>
      </View>
    )
  }
}

export const
  Roll = connect<StateProps, DispatchProps, OwnProps>((state: RootState) => ({
    auth: state.auth,
  }), {
    login,
    navigate: NavigationActions.navigate,
  })(RollScreen)

const styles = StyleSheet.create({
  container            : {
    flex           : 1,
    backgroundColor: '#ffffff',
  }
})