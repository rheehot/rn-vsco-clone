import React from 'react'
import {Button, View} from 'react-native'
import {AuthState} from '../redux/auth/reducer'
import {connect} from 'react-redux'
import {RootState} from '../redux'
import {login} from '../redux/auth/actions'
import {LoginStatus} from '../components/loginStatus'
import {NavigationActions} from 'react-navigation'

interface State {
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
  }

  login() {
    const token = 'ia9djf9j92j3fijaifjoidajf9jsfadf'
    this.props.login(token)
  }

  render() {
    return (
      <View>
        <LoginStatus />

        <Button title={'Login'} onPress={() => this.login()} />
      </View>
    )
  }
}

export const Home = connect<StateProps, DispatchProps, OwnProps>((state: RootState) => ({
  auth: state.auth,
}), {
  login,
  navigate: NavigationActions.navigate
})(HomeScreen)