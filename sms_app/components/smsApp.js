import SMSForm from './smsForm.js';
import {styles} from '../styles/appStyles.js';
import React from 'react-native';
const {Text, View} = React;

export default React.createClass({
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