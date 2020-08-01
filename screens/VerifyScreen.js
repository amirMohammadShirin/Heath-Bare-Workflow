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

const GETVERIFICATIONCODE = '/GetVerificationCode';
const VERIFY = '/Verify';

export default class VerifyScreen extends Component {
    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        }
        this.state = {
            progressModalVisible: false,
            phoneNumber: null,
            verificationCode: null,
            baseUrl: null,
            hub: null
        }
    }

    async componentDidMount(): void {
        const phoneNumber = this.props.navigation.getParam('phoneNumber');
        const baseUrl = await AsyncStorage.getItem('baseUrl');
        const hub = await AsyncStorage.getItem("hub");
        this.setState({phoneNumber: phoneNumber, baseUrl: baseUrl, hub: hub});
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        }
    }


    handleBackButtonClick() {

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

    componentWillMount() {
        this.setState({
            phoneNumber: this.state.phoneNumber
        })

    }

    goToNationalCodeScreen(phoneNumber) {
        this.props.navigation.navigate('NationalCodeScreen', {phoneNumber: phoneNumber});
    }

    async getVerificationCode(body) {
        const hub = this.state.hub;
        const baseUrl = this.state.baseUrl;
        let BODY = {
            Method: 'POST',
            UserName: '',
            NationalCode: '',
            Url: GETVERIFICATIONCODE,
            body: body
        }
        this.setState({progressModalVisible: true}, async () => {
            await fetch(baseUrl + hub, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(BODY),
            })
                .then(response => response.json())
                .then(async responseData => {
                    if (responseData['StatusCode'] === 200) {
                        this.setState({progressModalVisible: false}, () => {

                        });
                    } else if (responseData['StatusCode'] === 800) {
                        this.setState({progressModalVisible: false}, () => {
                            Alert.alert(
                                'خطا در ارتباط با سرویس ارسال پیامک',
                                '',
                                [
                                    {
                                        text: 'تلاش مجدد',
                                        onPress: async () => {
                                            await this.getVerificationCode(body);
                                        },
                                    },
                                    {
                                        text: 'انصراف',
                                        styles: 'cancel',
                                    },
                                ],
                                {
                                    cancelable: false,
                                },
                            );
                        });
                    } else {
                        this.setState({progressModalVisible: false}, () => {
                            alert('خطا در اتصال به سرویس');
                        });
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        });
    }

    verify = async (body) => {

        const baseUrl = this.state.baseUrl;
        const hub = this.state.hub;
        let BODY = {
            NationalCode: '',
            UserName: '',
            Method: 'POST',
            Url: VERIFY,
            Body: body
        };
        console.log('verify body : ' + JSON.stringify(BODY))
        fetch(baseUrl + hub, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(BODY)
        }).then((response) => response.json())
            .then(async (responseData) => {
                console.log(responseData)
                if (responseData['StatusCode'] === 901) {
                    this.setState({progressModalVisible: false}, () => {
                        this.goToNationalCodeScreen(body.phoneNumber)
                    })
                } else if (responseData['StatusCode'] === 902) {
                    this.setState({progressModalVisible: false}, () => {
                        alert('کد وارد شده منقضی شده است')
                    })
                } else if (responseData['StatusCode'] === 900) {
                    this.setState({progressModalVisible: false}, () => {
                        alert('کد وارد شده معتبر نمیباشد')
                    })
                } else {
                    this.setState({progressModalVisible: false}, () => {
                        alert('خطا در اتصال به سرویس')
                        console.log(JSON.stringify(responseData))
                    })
                }
            })
            .catch((error) => {
                console.log(error)
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
                                   '../assets/images/splash.png')
                               }
                        >
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

                                                   await Keyboard.dismiss()
                                                   this.setState({progressModalVisible: true}, async () => {

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