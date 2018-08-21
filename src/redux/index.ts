import {combineReducers} from 'redux'
import {auth, AuthState} from './auth/reducer'
import {PersistedState} from 'redux-persist/es/types'
import {createNavigationReducer, ReducerState as NavigationReducerState} from 'react-navigation-redux-helpers'
import {AppNavigator} from '../route'
import {jwt, JwtState} from './jwt/reducer'

//for navigation
export const navReducer = createNavigationReducer(AppNavigator)

export interface RootState extends PersistedState {
  auth: AuthState,
  jwt: JwtState,
  nav: NavigationReducerState,
}

export const rootReducer = combineReducers<RootState>({
  auth,
  jwt,
  nav: navReducer,
})