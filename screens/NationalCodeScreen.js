import React, {Component} from 'react';
import {
    ActivityIndicator,
    Alert,
    AsyncStorage,
    BackHandler,
    Image,
    Keyboard,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import {Card, Container, Content, Input, Item} from 'native-base'
import Modal, {ModalContent, SlideAnimation} from "react-native-modals";
// TODO : remove this text
const SUCCESSTEXT = 'شماره موبایل با کد ملی مطابقت دارد';
const AUTHENTICATE = "/Authenticate";
const SHAHKAR = '/ShahkarVerification';
export default class NationalCodeScreen extends Component {
    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        }
        this.state = {
            progressModalVisible: false,
            phoneNumber: null,
            nationalCode: null,
            baseUrl: null,
            hub: null,
            token: null
        }
    }

    async componentDidMount(): void {
        const phoneNumber = this.props.navigation.getParam('phoneNumber');
        const baseUrl = await AsyncStorage.getItem("baseUrl");
        const hub = await AsyncStorage.getItem("hub");
        const token = await AsyncStorage.getItem('token');

        this.setState({phoneNumber: phoneNumber, baseUrl: baseUrl, hub: hub, token: token});
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        }
    }

    async ShahkarVerification(body) {
        this.setState({progressModalVisible: true});
        const baseUrl = this.state.baseUrl;
        const token = this.state.token;
        const hub = this.state.hub;
        const Body = {
            UserName: body.username,
            NationalCode: body.nationalCode,
            Method: "POST",
            Url: SHAHKAR,
            Body: {
                phonuNumber: body.username,
                nationalCode: body.nationalCode
            }
        }
        console.log('Shahkar Code Body : ' + JSON.stringify(Body))
        await fetch(baseUrl + hub, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + "false"
            },
            body: JSON.stringify(Body)
        }).then(async (response) => response.json())
            .then(async (responseData) => {
                console.log(JSON.stringify(responseData))
                this.setState({progressModalVisible: false}, () => {
                    if (responseData['StatusCode'] === 200) {
                        let data = responseData['Data'];
                        if (data != null) {
                            if (data === SUCCESSTEXT) {
                                this.goToHomeScreen(body);
                            } else {
                                alert(data)
                            }
                        }
                    } else if (responseData['StatusCode'] === 401) {
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
                            alert('خطا در استعلام شماره ملی و شماره موبایل')

                            console.log(responseData)

                        })
                    }
                })
            })
            .catch((error) => {
                // console.log(error)
                // this.setState({progressModalVisible: false}, () => {
                //     alert('خطا در استعلام شماره ملی و شماره موبایل')
                //     //Todo : remove line :|
                //
                // })
                this.goToHomeScreen(body);

            })
    }

    handleBackButtonClick() {
        // alert('pressed')

        Alert.alert(
            'خروج',
            ' مایل به خروج از برنامه هستید؟ ',
            [
                {
                    text: 'خیر',
                    style: 'cancel',
                },
                {text: 'بله', onPress: () => BackHandler.exitApp()},
            ],
            {cancelable: false},
        );
        return true;
    }

    goToHomeScreen = async (body) => {
        this.setState({progressModalVisible: true});
        const baseUrl = this.state.baseUrl;
        const token = this.state.token;
        const hub = this.state.hub;
        const Body = {
            UserName: body.username,
            NationalCode: body.nationalCode,
            Method: "POST",
            Url: AUTHENTICATE,
            Body: body
        }
        await fetch(baseUrl + hub, {
            method: 'POST',
            headers: {'content-type': 'application/json', 'Authorization': 'Bearer ' + "false"},
            body: JSON.stringify(Body)
        }).then(async (response) => response.json())
            .then(async (responseData) => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        console.log(responseData)
                        try {
                            let data = responseData['Data'];
                            let userInfo = data['userinfo'];
                            let userId = userInfo['user_id'];
                            let nationalCode = userInfo['nationalCode'];
                            let userName = userInfo['user_name'];
                            let token = userInfo['token'];
                            await AsyncStorage.setItem('nationalCode', nationalCode);
                            await AsyncStorage.setItem('username', userName);
                            await AsyncStorage.setItem('userId', userId);
                            await AsyncStorage.setItem('token', token);
                            this.setState({progressModalVisible: false})
                            this.props.navigation.navigate('HomeScreen',
                                {user: {userInfo}, baseUrl: baseUrl})
                        } catch (e) {
                            console.log(e)
                        }
                    }
                } else if (responseData['StatusCode'] === 401) {
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
                } else if (responseData['StatusCode'] === 600) {
                    this.setState({progressModalVisible: false}, () => {
                        this.props.navigation.push('RegisterScreen', {
                            phoneNumber: this.state.phoneNumber,
                            nationalCode: this.state.nationalCode
                        });
                    })
                } else if (responseData['StatusCode'] === 601) {
                    this.setState({progressModalVisible: false}, () => {
                        alert('کد ملی وارد شده معتبر نمی باشد')
                    })
                } else {
                    this.setState({progressModalVisible: false}, () => {
                        alert('خطا در اتصال به سرویس')
                        console.log(responseData)
                    })
                }
            })
            .catch((error) => {
                console.log(error)
            })
    };

    render() {
        return (
            <Container>
                <Content scrollEnabled={false} contentContainerStyle={{flex: 1}}
                         style={{flex: 1, width: '100%', height: '100%'}}>
                    <StatusBar hidden translucent backgroundColor="transparent"/>
                    <View style={{width: '100%', height: '50%'}}>
                        <Image style={styles.container}
                            // source={require(
                            //     'D:\\E\\react native projects\\Health\\bare\\salamat\\assets\\images\\splash.png')
                               source={require(
                                   '../assets/images/splash.png')
                               }>
                        </Image>
                    </View>
                    <View style={[styles.main, {width: '100%', height: '50%'}]}>
                        <Card style={styles.myCard}>
                            <Item style={styles.itemStyle}>
                                <Input placeholder='کد ملی خود را وارد کنید' placeholderTextColor={'gray'}
                                       style={styles.inputStyle} keyboardType={'numeric'}
                                       onChangeText={(text) => {
                                           this.setState({nationalCode: text}, () => {
                                               if (text.length == 10) {
                                                   Keyboard.dismiss();

                                                   let body = {
                                                       username: this.state.phoneNumber,
                                                       nationalCode: this.state.nationalCode
                                                   }

                                                   this.ShahkarVerification(body)


                                               }
                                           })

                                       }}
                                />
                            </Item>
                            <Text style={[styles.textStyle, {color: '#23b9b9', marginTop: 40}]} onPress={() => {
                                let body = {
                                    username: this.state.phoneNumber,
                                    nationalCode: this.state.nationalCode
                                }
                                this.ShahkarVerification(body);

                            }}>تلاش مجدد</Text>
                        </Card>
                    </View>

                    <Modal style={{opacity: 0.7}}
                           width={300}
                           visible={this.state.progressModalVisible}
                           modalAnimation={new SlideAnimation({
                               slideFrom: 'bottom'
                           })}
                    >
                        <ModalContent style={styles.modalContent}>
                            <ActivityIndicator animating={true} size="small" color={"#23b9b9"}/>
                        </ModalContent>
                    </Modal>
                </Content>
            </Container>
        );
    }

}

NationalCodeScreen.navigationOptions = {
    header: null
};

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        backgroundColor: '#fff',
        width: '100%',
        height: '100%'
    },
    main: {
        backgroundColor: '#23b9b9',
        flex: 1,
        padding: 10,
        borderColor: '#fff'
    },
    itemStyle: {
        marginTop: 15,
        marginRight: 20,
        marginLeft: 20,
        padding: 2,
        alignSelf: 'center'
    },
    inputStyle: {
        textAlign: 'center',
        color: '#23b9b9',
        padding: 2,
        fontFamily: 'IRANMarker'
    },
    buttonStyle: {
        alignSelf: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: 25,
        backgroundColor: '#23b9b9'
    },
    textStyle: {
        textAlign: 'center',
        color: '#fff',
        padding: 5,
        fontFamily: 'IRANMarker'
    },
    content: {
        flex: 1,
        backgroundColor: 'rgba(47,246,246,0.06)',
    },
    headerMenuIcon: {
        color: '#fff',
    },
    headerText: {
        fontSize: 20,
        padding: 5,
        color: '#fff',
    },
    header: {
        width: '100%',
        backgroundColor: "#23b9b9",
        height: 180,
    },
    avatar: {
        width: 130,
        height: 130,
        borderRadius: 63,
        borderWidth: 4,
        borderColor: "white",
        marginBottom: 10,
        alignSelf: 'center',
        position: 'absolute',
        marginTop: 60
    },
    body: {
        flex: 1,
        width: '100%',
        height: '100%',
        marginTop: 5,
        backgroundColor: 'rgba(47,246,246,0.02)',
    },
    myCard: {
        borderWidth: 2,
        borderColor: '#23b9b9',
        elevation: 8,
        margin: 10,
        padding: 1,
        height: '90%',
        flexDirection: 'column'
    },
    modalContent: {
        marginTop: 5,
        padding: 2,
        alignContent: 'center',
        backgroundColor: 'rgba(47,246,246,0.02)'
    }
});