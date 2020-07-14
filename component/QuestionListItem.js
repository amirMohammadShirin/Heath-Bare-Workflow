import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableNativeFeedback,
  Platform,
} from 'react-native';
import {Item, Icon} from 'native-base';

export default class QuestionListItem extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <TouchableNativeFeedback
        useForeground={false}
        background={TouchableNativeFeedback.Ripple('#1cb8b5', true)}
        onPress={this.props.onPress}>
        <View
          style={{
            backgroundColor: 'rgba(37,180,180,0.42)',
            padding: 5,
            margin: 1,
            flexDirection: 'row-reverse',
          }}>
         
          <Text style={styles.titleStyle}>{this.props.title}</Text>
      
        </View>
      </TouchableNativeFeedback>
    );
  }
}

const styles = StyleSheet.create({
  titleStyle: {
    fontFamily: 'IRANMarker',
    color: '#fff',
    fontSize: 10,
    textAlign: 'right',
  },
  titleStyle: {
    fontFamily: 'IRANMarker',
    color: '#fff',
    fontSize: 10,
    textAlign: 'right',
  },
  leftIconStyle: {
    fontSize: 20,
    color: '#1f9292',
  },
 
});
