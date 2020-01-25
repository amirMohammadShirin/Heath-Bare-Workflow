import React, {Component} from 'react';
import {StyleSheet, ImageBackground} from 'react-native';


export default class SplashScreen extends Component {

    performTimeConsumingTask = async () => {
        return new Promise((resolve) =>
            setTimeout(
                () => {
                    resolve('result')
                },
                2000
            )
        )
    }

    async componentDidMount() {
        const data = await this.performTimeConsumingTask();

        if (data !== null) {
            //this.props.navigation.navigate('HomeScreen', {user: {username: 'adrian', password: '1234', role:
            // 'stranger'}});
            // this.props.navigation.navigate('GetVerificationCodeScreen',
            //     {user: {username: 'adrian', password: '1234', role: 'stranger'}});
            // this.props.navigation.navigate('RegisterScreen');
            this.props.navigation.navigate('GetVerificationCodeScreen', {
                user: {
                    username: 'adrian',
                    password: '1234',
                    role: 'stranger'
                }
            })
        }
    }

    render() {
        return (
            <ImageBackground style={styles.container}
                             source={require(
                                 'D:\\E\\react native projects\\Health\\bare\\salamat\\assets\\images\\splash.png')}
                             onPress={() => {
                                 // this.props.navigation.user.username = 'adrian';
                                 // this.props.navigation.user.password = '1234';
                                 // this.props.navigation.user.role = 'admin';
                                 // this.props.navigation.navigate('HomeScreen', {
                                 //     user: {
                                 //         username: 'adrian',
                                 //         password: '1234',
                                 //         role: 'stranger'
                                 //     }
                                 // })

                                 //
                                 this.props.navigation.navigate('GetVerificationCodeScreen', {
                                     user: {
                                         username: 'adrian',
                                         password: '1234',
                                         role: 'stranger'
                                     }
                                 })

                                 // this.props.navigation.navigate('RegisterScreen');

                             }}>
            </ImageBackground>
        );
    }

}

SplashScreen.navigationOptions = {
    header: null
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
