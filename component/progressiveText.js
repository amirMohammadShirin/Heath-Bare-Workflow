import React, {Component} from 'react';
import {ActivityIndicator,View} from 'react-native';
import {Item, Input} from 'native-base';

export default class ProgressiveText extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Item regular>
        <View
          style={{
            width: 30,
            height: 30,
            margin: 10,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator
            style={{alignSelf: 'center'}}
            animating={this.props.isLoading}
            color={'#209b9b'}
          />
        </View>
        <Input
          placeholder={this.props.placeholder}
          placeholderTextColor={this.props.placeholderTextColor}
          style={{
            textAlign: 'right',
            fontSize: 13,
            fontFamily: 'IRANMarker',
          }}
          value={this.props.searchTerm}
          onChangeText={this.props.onChangeText}
        />
      </Item>
    );
  }
}
