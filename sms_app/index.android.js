/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  TextInput,
  StyleSheet,
  Text,
  View,
} = React;
// var Popup = require('react-native-popup');
import Popup from 'react-native-popup';
var Button = require('react-native-button');

var sms_app = React.createClass({
  render: function() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to Sleep On It SMS
        </Text>
        <Text style={styles.instructions}>
          Type a message below and then hit send
        </Text>
        <SMSForm />
      </View>
    );
  }
});

var SMSForm = React.createClass({
  getInitialState: function() {
    return {
      smsBody: '',
      mobileNumber: ''
    };
  },
  handleMessageChange: function(text) {
    this.setState({smsBody: text});
  },
  handleSend: function() {
    var smsBody = this.state.smsBody.trim();
    if (!smsBody) {
      return;
    }

    this.popup.confirm({
      title: 'Are you sure you want to be a jerk?',
      content: 'This message makes you sound like a jerk. Are you sure you want to send it?',
      ok: {
        text: 'Yeah - I really want to annoy the other person',
        callback: () => {
          this.popup.alert('You really are a jerk!');
        },
      },
      cancel: {
        text: 'Hmm maybe I should reconsider',
        callback: () => {
          this.popup.alert('Good decision');
        },
      },
    });
  },
  render: function() {
    return (
        <View>
          <TextInput type="text" placeholder="Mobile number" 
          value={this.state.mobileNumber}
          onChangeText={(text) => this.setState({mobileNumber: text})}/>

          <TextInput type="text" placeholder="Write a nice message" 
          value={this.state.smsBody}
          onChangeText={(text) => this.setState({smsBody: text})}/>

          <Button
            style={{fontSize: 20, color: 'green'}}
            styleDisabled={{color: 'red'}}
            onPress={this.handleSend}
          >
            Send!
          </Button>

          {/** Popup component */}
          <Popup ref={(popup) => { this.popup = popup }}/>
        </View>
    );
  }
});

var ConfirmDialog = React.createClass({
  getInitialState: function() {
    return {
      isModalOpen: false
    };
  },
  handleSend: function () {
    this.setState({isModalOpen: false});
  },
  handleCancel: function () {
    this.setState({isModalOpen: false});
  },
  render: function() {

    return (
      <Modal isVisible={this.state.isModalOpen} onClose={() => this.closeModal()}>
          <Text>This message makes you look like a jerk. Are you sure you want to send it?</Text>
          <Button
            style={{fontSize: 20, color: 'red'}}
            styleDisabled={{color: 'red'}}
            onPress={this.handleSend}
          >
            I don`t care - send it anyway
          </Button>
          <Button
            style={{fontSize: 20, color: 'green'}}
            styleDisabled={{color: 'red'}}
            onPress={this.handleCancel}
          >
            I`ll sleep on it
          </Button>
      </Modal>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('sms_app', () => sms_app);
