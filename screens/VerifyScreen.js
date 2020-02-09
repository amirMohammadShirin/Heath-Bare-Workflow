import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    StatusBar,
    Image,
    AsyncStorage,
    ActivityIndicator,
    Keyboard,
    Platform, BackHandler, Alert
} from 'react-native';
import {Button, Card, Container, Content, Input, Item} from 'native-base'
import Modal, {ModalContent, SlideAnimation} from "react-native-modals";

const GETVERIFICATIONCODE = '/api/GetVerificationCode';
const VERIFY = '/Api/Verify';

export default class VerifyScreen extends Component {
    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        }
        this.state = {
            progressModalVisible: false,
            phoneNumber: null,
            verificationCode: null
        }
    }

    componentDidMount(): void {
        const phoneNumber = this.props.navigation.getParam('phoneNumber');
        this.setState({phoneNumber: phoneNumber});
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        }
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


    goToNationalCodeScreen(phoneNumber) {
        this.props.navigation.navigate('NationalCodeScreen', {phoneNumber: phoneNumber});
    }

    // goToHomeScreen = async (body) => {
    //
    //     fetch(BASE + AUTHENTICATE, {
    //         method: 'POST',
    //         headers: {'content-type': 'application/json'},
    //         body: JSON.stringify(body)
    //     }).then((response) => response.json())
    //         .then(async (responseData) => {
    //             if (responseData['StatusCode'] === 200) {
    //                 if (responseData['Data'] != null) {
    //                     try {
    //                         let data = responseData['Data'];
    //                         let token = data['token'];
    //                         let userInfo = data['userinfo'];
    //                         this.setState({progressModalVisible: false}, async () => {
    //                             await AsyncStorage.setItem('username', body.username).then(() => {
    //                                 AsyncStorage.setItem('token', token).then(() => {
    //                                     AsyncStorage.setItem('baseUrl', BASE).then(() => {
    //                                         this.props.navigation.navigate('HomeScreen',
    //                                             {user: {userInfo}, baseUrl: BASE})
    //                                     })
    //                                 })
    //                             })
    //                         })
    //                     } catch (e) {
    //                         // alert(e)
    //                         console.error(e)
    //                     }
    //                 }
    //             } else if (responseData['StatusCode'] === 600) {
    //                 this.setState({progressModalVisible: false}, () => {
    //                     alert('کاربر یافت نشد')
    //                 })
    //             } else {
    //                 this.setState({progressModalVisible: false}, () => {
    //                     // alert('خطا در اتصال به سرویس')
    //                     alert(JSON.stringify(responseData))
    //                 })
    //             }
    //         })
    //         .catch((error) => {
    //             console.error(error)
    //         })
    //     // fetch(BASE + AUTHENTICATE, {
    //     //     method: 'POST',
    //     //     Accept: 'application/json',
    //     //     credentials: 'include',
    //     //     headers: {'content-type': 'application/json'},
    //     //     body: JSON.stringify(body)
    //     // }).then((response) => console.log(JSON.stringify(response)))
    //     //     .catch((error) => {
    //     //         console.error(error)
    //     //     })
    // };

    async getVerificationCode(body) {
        const baseUrl = await AsyncStorage.getItem("baseUrl");
        console.log(JSON.stringify(body))
        this.setState({progressModalVisible: true}, async () => {
            await fetch(baseUrl + GETVERIFICATIONCODE, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    Accept: 'application/json',
                    'Authorization': 'Bearer ' + new String(this.state.token)
                },
                body: JSON.stringify(body),
            }).then((response) => response.json())
                .then(async (responseData) => {
                    if (responseData['StatusCode'] === 200) {
                        this.setState({progressModalVisible: false},)
                    } else if (responseData['StatusCode'] === 800) {
                        this.setState({progressModalVisible: false}, () => {
                            Alert.alert(
                                "خطا در ارتباط با سرویس ارسال پیامک",
                                '',
                                [
                                    {
                                        text: "تلاش مجدد", onPress: async () => {
                                            await this.getVerificationCode(body)
                                        },

                                    },
                                    {
                                        text: "انصراف",
                                        styles: 'cancel'
                                    }
                                ],
                                {
                                    cancelable: false,
                                }
                            )
                        })
                    } else {
                        this.setState({progressModalVisible: false}, () => {
                            alert('خطا در اتصال به سرویس')
                        })

                    }
                })
                .catch((error) => {
                    console.error(error)
                    // alert(error)
                })
        })

    }


    verify = async (body) => {
        const baseUrl = await AsyncStorage.getItem("baseUrl");
        fetch(baseUrl + VERIFY, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(body)
        }).then((response) => response.json())
            .then(async (responseData) => {
                if (responseData['StatusCode'] === 200) {
                    this.setState({progressModalVisible: false}, () => {
                        this.goToNationalCodeScreen(body.phoneNumber)
                    })
                } else if (responseData['StatusCode'] === 902) {
                    this.setState({progressModalVisible: false}, () => {
                        alert('کد وارد شده معتبر نمیباشد')
                    })
                } else {
                    this.setState({progressModalVisible: false}, () => {
                        alert('خطا در اتصال به سرویس')
                        // alert(JSON.stringify(responseData))
                    })
                }
            })
            .catch((error) => {
                console.error(error)
            })

    }


    render() {
        return (
            <Container>
                <Content scrollEnabled={false} contentContainerStyle={{flex: 1}}
                         style={{flex: 1, width: '100%', height: '100%'}}>
                    <StatusBar hidden translucent backgroundColor="transparent"/>
                    <View style={{width: '100%', height: '50%'}}>
                        <Image style={styles.container}
                               source={require(
                                   'D:\\E\\react native projects\\Health\\bare\\salamat\\assets\\images\\splash.png')}>
                        </Image>
                    </View>
                    <View style={[styles.main, {width: '100%', height: '50%'}]}>
                        <Card style={styles.myCard}>
                            <Item style={styles.itemStyle}>
                                <Input placeholder='کد فعال سازی را وارد کنید' placeholderTextColor={'gray'}
                                       style={styles.inputStyle} keyboardType={'numeric'}
                                       onChangeText={async (text) => {
                                           this.setState({verificationCode: text}, async () => {
                                               if (text.length === 4) {
                                                   // alert('Sent')
                                                   await Keyboard.dismiss()
                                                   this.setState({progressModalVisible: true}, async () => {
                                                       // this.goToHomeScreen()
                                                       let body = {
                                                           phoneNumber: this.state.phoneNumber,
                                                           verificationCode: this.state.verificationCode,
                                                       }
                                                       this.verify(body)
                                                   })

                                               }
                                           })
                                       }}/>
                            </Item>
                            <Button light style={styles.buttonStyle}>
                                <Text style={styles.textStyle} onPress={() => {
                                    let body = {
                                        phoneNumber: this.state.phoneNumber
                                    }
                                    Keyboard.dismiss();
                                    this.getVerificationCode(body)
                                }}>ارسال مجدد کد فعال
                                    سازی</Text>
                            </Button>
                            <Text style={[styles.textStyle, {color: '#23b9b9', marginTop: 40}]} onPress={() => {
                                this.props.navigation.goBack()
                            }}>ویرایش شماره تماس</Text>
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

VerifyScreen.navigationOptions = {
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