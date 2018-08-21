import React from 'react'
import {persistor, store} from './src/store'
import {Provider} from 'react-redux'
import {PersistGate} from 'redux-persist/integration/react'
import {Navigation} from './src/navigation'

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Navigation/>
        </PersistGate>
      </Provider>
    )
  }
}