import React, {Component} from 'react';
import {StyleSheet, View, Text, StatusBar, Image, Platform, Alert, AsyncStorage, ActivityIndicator} from 'react-native';
import {BackHandler} from 'react-native';
import {Button, Input, Item, Container, Content, Card, Icon} from 'native-base'
import Modal, {ModalContent, SlideAnimation} from "react-native-modals";


const GETVERIFICATIONCODE = '/api/GetVerificationCode';
export default class GetVerificationCodeScreen extends Component {
    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        }
        this.state = {
            phone: '',
            valid: false,
            red: '#db1c09',
            green: '#00b452',
            color: '#db1c09',
            icon: 'close-circle',
            check: 'checkmark-circle',
            error: 'close-circle',
            progressModalVisible: false
        }
    }


    componentDidMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        }
    }


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
                        this.setState({progressModalVisible: false}, () => {
                            this.props.navigation.push('VerifyScreen', {phoneNumber: body.phoneNumber});
                        })
                    } else if (responseData['StatusCode'] === 800) {
                        this.setState({progressModalVisible: false}, () => {
                            // this.props.navigation.push('RegisterScreen');
                            Alert.alert(
                                "خطا در ارتباط با سرویس ارسال پیامک",
                                '',
                                [
                                    {
                                        text: "تلاش مجدد", onPress: async () => {
                                            await this.getVerificationCode(body)
                                            // await this.componentWillMount();

                                        },

                                    },
                                    {
                                        text: "انصراف"

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

    phoneNumberValidation(value) {
        const regex = RegExp('^(\\+98|0)?9\\d{9}$');
        let phone = new String(value)
        let status = regex.test(phone);
        if (status) {
            this.setState({valid: status, color: this.state.green, icon: this.state.check})
            return status;
        } else {
            this.setState({valid: status, color: this.state.red, icon: this.state.error})
            return status;
        }
    }

    render() {
        return (
            <Container>
                <Content scrollEnabled={false} contentContainerStyle={{flex: 1}}
                         style={{flex: 1, width: '100%', height: '100%'}}>
                    <StatusBar hidden translucent backgroundColor="transparent" barStyle={"light-content"}/>
                    <View style={{width: '100%', height: '50%'}}>
                        <Image
                            style={styles.container}
                            source={require(
                                'D:\\E\\react native projects\\Health\\bare\\salamat\\assets\\images\\splash.png')}>
                        </Image>
                    </View>
                    <View style={[styles.main, {width: '100%', height: '50%'}]}>
                        <Card style={styles.myCard}>
                            <Item
                                style={[styles.itemStyle, {borderBottomColor: this.state.color, borderBottomWidth: 1}]}>
                                <Input placeholder='شماره تلفن خود را وارد کنید' placeholderTextColor={'gray'}
                                       style={[styles.inputStyle]}
                                       keyboardType={'numeric'}
                                       onChangeText={(text) => {
                                           this.setState({phone: text});
                                           this.phoneNumberValidation(text);

                                       }}/>
                                <Icon name={this.state.icon} style={{color: this.state.color}}/>
                            </Item>
                            <Button
                                textStyle={{fontFamily: 'IRANMarker'}}
                                light style={styles.buttonStyle} onPress={() => {
                                if (this.phoneNumberValidation(this.state.phone)) {
                                    // alert('Sent')

                                    var body = {
                                        phoneNumber: this.state.phone
                                    }
                                    this.getVerificationCode(body)
                                } else {
                                    if (this.state.phone.length < 11) {
                                        alert('لطفا شماره تلفن خود را وارد کنید')
                                    } else {
                                        alert('شماره تلفن شما صحیح نمی باشد')
                                    }
                                }
                            }}>
                                <Text style={styles.textStyle}>دریافت کد فعال سازی</Text>
                            </Button>
                        </Card>
                    </View>
                    <Modal style={{opacity: 0.7}}
                           width={300}
                           visible={this.state.progressModalVisible}
                           modalAnimation={new SlideAnimation({
                               slideFrom: 'bottom'
                           })}
                    >
                        <ModalContent style={[styles.modalContent, {backgroundColor: 'rgba(47,246,246,0.02)'}]}>
                            <ActivityIndicator animating={true} size="small" color={"#23b9b9"}/>
                        </ModalContent>
                    </Modal>

                </Content>
            </Container>
        );
    }

}

GetVerificationCodeScreen.navigationOptions = {
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
        fontFamily: 'IRANMarker',
        marginTop: 25,
        backgroundColor: '#23b9b9'
    },
    textStyle: {
        fontFamily: 'IRANMarkersss',
        textAlign: 'center',
        color: '#fff',
        padding: 5
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
    }
});
