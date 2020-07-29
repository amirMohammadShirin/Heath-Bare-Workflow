import React, {Component} from 'react';
import {StyleSheet, ImageBackground, AsyncStorage} from 'react-native';
// const AUTHORIZE = '/api/Authorize';
// const GETCROSS = '/Images/Cross.png';
// const GETHIJAB = '/Images/Hijab.png';
// const GETDOCTOR = '/Images/Doctor.png';
// const GETVEIL = '/Images/Veil.png';
// const GETACCOUNT = '/Images/Account.png';
// const GETPIC = '/Images/Pic.png';
const BASE = 'http://clinicservices.bazyarapp.ir';
const HUB = "/Api/HubService";
// const BASE = 'http://clinicapi.adproj.ir';
// const imageObject = {
//   doctor: BASE + GETDOCTOR,
//   hijab: BASE + GETHIJAB,
//   pic: BASE + GETPIC,
//   veil: BASE + GETVEIL,
//   account: BASE + GETACCOUNT,
//   cross: BASE + GETCROSS,
// };
// const BASE = 'https://cisservices.tehran.ir/TM.Services.ClinicManagementApi.Ver1';
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
        // const userId = await AsyncStorage.getItem('nationalCode');
        //  console.log(userId);

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
                // username: '09191111111',
                nationalCode: nationalCode,
            };
            let BODY = {
                Method:"POST",
                UserName: username,
                NationalCode: nationalCode,
                Url: AUTHENTICATE,
                body: body
            }

            console.log(JSON.stringify((BODY)))

            fetch(baseUrl + hub, {
                method: 'POST',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify(BODY),
            })
                .then(response => response.json())
                .then(async responseData => {
                    console.log(JSON.stringify(responseData));
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
                                // alert(e)
                                console.error(e);
                            }

                        }
                    } else if (responseData['StatusCode'] === 600) {
                        this.setState({progressModalVisible: false}, () => {
                            // alert('کاربر یافت نشد')
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
                            // alert('خطا در اتصال به سرویس')
                            // alert(JSON.stringify(responseData))
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
                    console.error(error);
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
                // source={require(
                //     'D:\\E\\react native projects\\Health\\bare\\salamat\\assets\\images\\splash.png')
                // }
                source={require('../assets/images/splash.png')}

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
