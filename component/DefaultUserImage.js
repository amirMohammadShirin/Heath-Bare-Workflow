import React, {Component} from 'react';
import {StyleSheet} from "react-native";
import {Thumbnail} from "native-base";

export default class DefaultUserImage extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <Thumbnail
                circular
                large
                style={this.props.profile ?
                       styles.avatar
                    :this.props.myStyle}
                source={{
                    uri: this.props.gender === 'Man' ? 'http://clinicservices.bazyarapp.ir/Images/Account.png'
                        : 'http://clinicservices.bazyarapp.ir/Images/Veil.png'
                }}
            />
        );
    }
}
const styles = StyleSheet.create({
    avatar: {
        // backgroundColor: '#fff',
        width: 130,
        height: 130,
        borderRadius: 500,
        marginBottom: 10,
        alignSelf: 'center',
        position: 'absolute',
        backgroundColor: 'transparent',
        tintColor: '#fff',
        borderColor: 'transparent',
        marginTop: 50,
    }
});
