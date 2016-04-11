import {analyseSentiment} from '../vendor/analyseSentiment.js';
import Button from 'react-native-button';
import Popup from 'react-native-popup';
import React from 'react-native';
const {View, TextInput} = React;

export default React.createClass({
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
    const smsBody = this.state.smsBody.trim();
    if (!smsBody) {
      return;
    }

    const sentimentScore = analyseSentiment(smsBody);

    if (sentimentScore.score < 2) {
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
    } else {
      this.popup.alert('What a nice message :)');
    }
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
