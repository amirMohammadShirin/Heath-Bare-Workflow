import React, {Component} from 'react';
import {StyleSheet, ImageBackground, AsyncStorage} from 'react-native';


const AUTHORIZE = '/api/Authorize';
const BASE = 'http://clinicapi.adproj.ir';
const AUTHENTICATE = "/Api/Authenticate";
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
        await AsyncStorage.setItem("baseUrl", BASE);
        const token = await AsyncStorage.getItem("token");
        console.log(token);
        const baseUrl = await AsyncStorage.getItem("baseUrl");
        console.log(baseUrl)

        if (token != null && typeof token !== 'undefined' && baseUrl != null && typeof baseUrl !== 'undefined') {
            console.log('token and base are not null')
            console.log('no.1 fetch started')
            await fetch(baseUrl + AUTHORIZE, {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                    Accept: 'application/json',
                    'Authorization': 'Bearer ' + new String(token)
                },
            }).then((response) => response.json())
                .then(async (responseData) => {
                    console.log(JSON.stringify(responseData))
                    if (responseData['StatusCode'] === 200) {
                        const username = await AsyncStorage.getItem('username');
                        if (username != null && typeof username !== 'undefined') {
                            console.log('username is not null')
                            let body = {
                                username: username,
                                // username: '09191111111',
                                deviceId: 'deviceId'
                            };
                            console.log(JSON.stringify(body))
                            console.log('no.2 fetch started')
                            fetch(baseUrl + AUTHENTICATE, {
                                method: 'POST',
                                headers: {'content-type': 'application/json'},
                                body: JSON.stringify(body)
                            }).then((response) => response.json())
                                .then(async (responseData) => {
                                    console.log(JSON.stringify(responseData))
                                    if (responseData['StatusCode'] === 200) {
                                        if (responseData['Data'] != null) {
                                            try {
                                                let data = responseData['Data'];
                                                let token = data['token'];
                                                let userInfo = data['userinfo'];
                                                AsyncStorage.setItem('username', username).then(() => {
                                                    AsyncStorage.setItem('token', token).then(() => {
                                                        this.props.navigation.navigate('HomeScreen',
                                                            {user: {userInfo}, baseUrl: baseUrl})
                                                    })
                                                })
                                            } catch (e) {
                                                // alert(e)
                                                console.error(e)
                                            }
                                        }
                                    } else if (responseData['StatusCode'] === 600) {
                                        this.setState({progressModalVisible: false}, () => {
                                            alert('کاربر یافت نشد')
                                        })
                                    } else {
                                        this.setState({progressModalVisible: false}, () => {
                                            // alert('خطا در اتصال به سرویس')
                                            // alert(JSON.stringify(responseData))
                                            this.props.navigation.navigate('GetVerificationCodeScreen', {
                                                user: {
                                                    username: 'adrian',
                                                    password: '1234',
                                                    role: 'stranger'
                                                }
                                            })
                                        })
                                    }
                                })
                                .catch((error) => {
                                    console.error(error)
                                })
                        }

                        // if (responseData['Data'] != null) {
                        //     this.props.navigation.navigate('homeScreen')
                        // }
                    } else if (responseData['StatusCode'] === 401) {
                        this.props.navigation.navigate('GetVerificationCodeScreen', {
                            user: {
                                username: 'adrian',
                                password: '1234',
                                role: 'stranger'
                            }
                        })
                    } else {
                        alert('خطا در اتصال به سرویس')

                    }
                })
                .catch((error) => {
                    console.error(error)
                    // alert(error)
                })
        } else {
            this.props.navigation.navigate('GetVerificationCodeScreen', {
                user: {
                    username: 'adrian',
                    password: '1234',
                    role: 'stranger'
                }
            })
        }
        // const data = await this.performTimeConsumingTask();
        //
        // if (data !== null) {
        //     //this.props.navigation.navigate('HomeScreen', {user: {username: 'adrian', password: '1234', role:
        //     // 'stranger'}});
        //     // this.props.navigation.navigate('GetVerificationCodeScreen',
        //     //     {user: {username: 'adrian', password: '1234', role: 'stranger'}});
        //     // this.props.navigation.navigate('RegisterScreen');
        //     this.props.navigation.navigate('GetVerificationCodeScreen', {
        //         user: {
        //             username: 'adrian',
        //             password: '1234',
        //             role: 'stranger'
        //         }
        //     })
        // }
    }

    render() {
        return (
            <ImageBackground style={styles.container}
                             source={require(
                                 'D:\\E\\react native projects\\Health\\bare\\salamat\\assets\\images\\splash.png')}
                // onPress={() => {
                //     // this.props.navigation.user.username = 'adrian';
                //     // this.props.navigation.user.password = '1234';
                //     // this.props.navigation.user.role = 'admin';
                //     // this.props.navigation.navigate('HomeScreen', {
                //     //     user: {
                //     //         username: 'adrian',
                //     //         password: '1234',
                //     //         role: 'stranger'
                //     //     }
                //     // })
                //
                //     //
                //     this.props.navigation.navigate('GetVerificationCodeScreen', {
                //         user: {
                //             username: 'adrian',
                //             password: '1234',
                //             role: 'stranger'
                //         }
                //     })
                //
                //     // this.props.navigation.navigate('RegisterScreen');
                //
                // }}
            >
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
