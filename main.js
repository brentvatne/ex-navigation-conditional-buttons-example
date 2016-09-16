import Exponent from 'exponent';
import React from 'react';
import {
  AppRegistry,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createRouter,
  NavigationProvider,
  StackNavigation,
} from '@exponent/ex-navigation';

import { MaterialIcons } from '@exponent/vector-icons';
import { createStore } from 'redux';
import { Provider as ReduxProvider, connect } from 'react-redux';

// The dumbest most simple store you can have
const Store = createStore(function(state = {}, action) {
  if (action.type === 'toggle-left-button') {
    return {
      leftButtonEnabled: !state.leftButtonEnabled,
    };
  }

  return state;
});

// We only have one route here for the example
const Router = createRouter(() => ({
  home: () => HomeScreen,
}));

// A simple placeholder component
const EnabledButton = () => (
  <TouchableOpacity onPress={() => {}} style={{paddingTop: 5}}>
    <MaterialIcons
      name="check-circle"
      size={30}
    />
  </TouchableOpacity>
);

// A simple placeholder component
const DisabledButton = () => (
  <TouchableOpacity onPress={() => {}} style={{paddingTop: 5}}>
    <MaterialIcons
      name="cancel"
      size={30}
    />
  </TouchableOpacity>
);

// This button is subscribed to Redux, so we would update the state in Redux and
// render the appropriate button state -- enabled or disabled -- depending on
// some validation in the form data on the screen, or whatever.
@connect(data => ({leftButtonEnabled: data.leftButtonEnabled}))
class LeftButton extends React.Component {
  render() {
    if (this.props.leftButtonEnabled) {
      return <EnabledButton />;
    } else {
      return <DisabledButton />;
    }
  }
}

// This button is listening to the route's event emitter, so if you emit a
// 'toggle-right-button' event then you can update the state accordingly
// and re-render the button. This is useful if you want to keep the validation
// inside of your component rather than Redux. Eg: maybe all you need to do
// is scroll to the bottom of a massive terms of service agreement before you
// can press next, in this case it probably makes sense to use this instead of
// Redux.
class RightButton extends React.Component {
  componentWillMount() {
    this._subscription = this.props.events.addListener('toggle-right-button', this._handleToggle);
  }

  componentWillUnmount() {
    this._subscription.remove();
  }

  state = {
    enabled: false,
  };

  _handleToggle = () => {
    this.setState({enabled: !this.state.enabled});
  }

  render() {
    if (this.state.enabled) {
      return <EnabledButton />;
    } else {
      return <DisabledButton />;
    }
  }
}

@connect()
class HomeScreen extends React.Component {

  static route = {
    navigationBar: {
      title: 'Hello world',
      renderLeft: () => (
        <LeftButton />
      ),
      renderRight: ({ config: { eventEmitter } }) => (
        <RightButton events={eventEmitter} />
      ),
    }
  }

  _toggleLeftButton = () => {
    this.props.dispatch({type: 'toggle-left-button'});
  }

  _toggleRightButton = () => {
    this.props.route.getEventEmitter().emit('toggle-right-button');
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.toggle} onPress={this._toggleLeftButton}>
          <Text>Toggle left button</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggle} onPress={this._toggleRightButton}>
          <Text>Toggle right button</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class AppContainer extends React.Component {
  render() {
    return (
      <NavigationProvider router={Router}>
        <ReduxProvider store={Store}>
          <StackNavigation
            id="root"
            initialRoute={Router.getRoute('home')}
          />
        </ReduxProvider>
      </NavigationProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  toggle: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 10,
  },
});

Exponent.registerRootComponent(AppContainer);
