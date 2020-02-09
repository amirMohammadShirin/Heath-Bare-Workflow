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

const AUTHENTICATE = "/Api/Authenticate";

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
            baseUrl: null
        }
    }

    async componentDidMount(): void {
        const phoneNumber = this.props.navigation.getParam('phoneNumber');
        const baseUrl = await AsyncStorage.getItem("baseUrl");
        this.setState({phoneNumber: phoneNumber, baseUrl: baseUrl});
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

    goToHomeScreen = async (body) => {
        const baseUrl = this.state.baseUrl;
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
                            this.setState({progressModalVisible: false}, async () => {
                                await AsyncStorage.setItem('username', body.phoneNumber).then(async () => {
                                    await AsyncStorage.setItem('nationalCode', body.nationalCode, async () => {
                                        await AsyncStorage.setItem('token', token).then(() => {
                                            this.props.navigation.navigate('HomeScreen',
                                                {user: {userInfo}, baseUrl: baseUrl})
                                        })
                                    })
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
                } else if (responseData['StatusCode'] === 601) {
                    this.setState({progressModalVisible: false}, () => {
                        alert('کد ملی وارد شده معتبر نمی باشد')
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
    };

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
                                <Input placeholder='کد ملی خود را وارد کنید' placeholderTextColor={'gray'}
                                       style={styles.inputStyle} keyboardType={'numeric'}
                                       onChangeText={(text) => {
                                           if (true) {
                                               Keyboard.dismiss()
                                               this.setState({progressModalVisible: true}, async () => {
                                                   let body = {
                                                       username: this.state.phoneNumber,
                                                       nationalCode: this.state.nationalCode
                                                   }

                                                   this.goToHomeScreen(body)
                                               })

                                           }
                                       }}/>
                            </Item>
                            <Button light style={styles.buttonStyle}>
                                <Text style={styles.textStyle} onPress={() => alert('clicked')}>ارسال مجدد کد فعال
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