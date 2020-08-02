import React, {Component} from 'react';
import {StyleSheet, ImageBackground, AsyncStorage} from 'react-native';

const BASE = 'http://clinicservices.bazyarapp.ir';
const HUB = "/Api/HubService";
const AUTHENTICATE = '/Authenticate';


export default class SplashScreen extends Component {

    performTimeConsumingTask = async () => {
        return new Promise(resolve =>
            setTimeout(() => {
                resolve('result');
            }, 2000),
        );
    };

    async componentDidMount() {
        await AsyncStorage.setItem('baseUrl', BASE);
        await AsyncStorage.setItem('hub', HUB);
        const token = await AsyncStorage.getItem('token');
        const hub = await AsyncStorage.getItem('hub');
        const username = await AsyncStorage.getItem('username');
        const baseUrl = await AsyncStorage.getItem('baseUrl');
        const nationalCode = await AsyncStorage.getItem('nationalCode');
        console.log(baseUrl);
        console.log(hub);
        console.log(nationalCode);
        console.log(username)
        if (
            hub != null &&
            typeof hub !== 'undefined' &&
            baseUrl != null &&
            typeof baseUrl !== 'undefined' &&
            username != null &&
            typeof username !== 'undefined' &&
            nationalCode != null &&
            typeof nationalCode !== 'undefined'
        ) {

            let body = {
                username: username,
                nationalCode: nationalCode,
            };
            let BODY = {
                Method: "POST",
                UserName: username,
                NationalCode: nationalCode,
                Url: AUTHENTICATE,
                body: body
            }
            console.log(JSON.stringify(BODY))
            console.log(baseUrl + hub)
            fetch(baseUrl + hub, {
                method: 'POST',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify(BODY),
            })
                .then(response => response.json())
                .then(async responseData => {
                    console.log("Response : ", responseData)
                    if (responseData['StatusCode'] === 200) {
                        if (responseData['Data'] != null) {
                            try {
                                let data = responseData['Data'];
                                let userInfo = data['userinfo'];
                                this.props.navigation.navigate('HomeScreen', {
                                    user: {userInfo},
                                    baseUrl: BASE,
                                });
                            } catch (e) {
                                console.log(e);
                            }

                        }
                    } else if (responseData['StatusCode'] === 600) {
                        this.setState({progressModalVisible: false}, () => {
                            this.props.navigation.navigate(
                                'GetVerificationCodeScreen',
                                {
                                    user: {
                                        username: 'adrian',
                                        password: '1234',
                                        role: 'stranger',
                                    },
                                },
                            );
                        });
                    } else {
                        this.setState({progressModalVisible: false}, () => {
                            this.props.navigation.navigate(
                                'GetVerificationCodeScreen',
                                {
                                    user: {
                                        username: 'adrian',
                                        password: '1234',
                                        role: 'stranger',
                                    },
                                },
                            );
                        });
                    }
                })
                .catch(error => {
                    console.log(error);
                    this.props.navigation.navigate(
                        'GetVerificationCodeScreen',
                        {
                            user: {
                                username: 'adrian',
                                password: '1234',
                                role: 'stranger',
                            },
                        },
                    );
                });
        } else {
            this.props.navigation.navigate(
                'GetVerificationCodeScreen',
                {
                    user: {
                        username: 'adrian',
                        password: '1234',
                        role: 'stranger',
                    },
                },
            );

        }

    }

    render() {
        return (
            <ImageBackground
                style={styles.container}
                source={require('../assets/images/splash.png')}
            ></ImageBackground>
        );
    }
}

SplashScreen.navigationOptions = {
    header: null,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
