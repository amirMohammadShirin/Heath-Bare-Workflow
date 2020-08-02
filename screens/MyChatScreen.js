import React, {Component} from 'react';

import Autocomplete from 'react-native-autocomplete-input';
import ImagePicker from 'react-native-image-picker';
import Modal, {ModalContent, SlideAnimation,} from 'react-native-modals';
import {
    ActivityIndicator,
    Alert,
    AsyncStorage,
    Keyboard,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {Body, Button, Card, CardItem, Container, Content, Footer, Form, Icon, Right, Textarea,} from 'native-base';

const testUrl = "/api/GetDoctorsForSendingMessage"
const testMessage = "/api/SendMessage"
const GETDOCTORSFORMESSAGE = "/GetDoctorsForSendingMessage"
const SENDMESSAGE = "/SendMessage"
const options = {
    title: '',
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
    maxWidth: 160,
    maxHeight: 160,
};

export default class MyChatScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fontLoaded: false,
            refreshing: false,
            medicalCenterQuery: null,
            fullName: 'کاربر',
            imageFromDevice: null,
            fileName: null,
            medicalCentersShowData: true,
            doctorsShowData: true,
            doctorQuery: null,
            doctorSelected: false,
            medicalCenterSelected: false,
            progressModalVisible: false,
            doctorData: [],
            file: null,
            token: null
        };
    }


    async getDoctorsForMessage() {
        const token = this.state.token;
        const baseUrl = this.state.baseUrl;
        const hub = this.state.hub;
        const userId = this.state.userId;
        let body = {UserId: userId}
        let Body = {
            Method: 'POST',
            Url: GETDOCTORSFORMESSAGE,
            Username: '',
            NationalCode: '',
            Body: body
        }
        this.setState({progressModalVisible: true})
        fetch(baseUrl + hub, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + new String(token)
            },
            body: JSON.stringify(Body),
        })
            .then(response => response.json())
            .then(async responseData => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        try {

                            let data = responseData['Data']
                            let doctors = [];
                            for (let item of data) {
                                if (doctors.length <= 0) {
                                    doctors.push(item)
                                } else {

                                    for (let doctor of doctors) {
                                        if (doctor.Id !== item.Id) {
                                            doctors.push(item)
                                        }
                                    }

                                }


                            }

                            this.setState({doctorData: doctors, progressModalVisible: false})
                        } catch (e) {
                            this.setState({progressModalVisible: false})
                            alert('خطا در اتصال به سرویس')
                            console.log(e);
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
                        alert('خطا در اتصال به سرویس')
                    });
                }
            })
            .catch(error => {
                this.setState({progressModalVisible: false})
                console.log(error);
            });
    }

    async componentDidMount(): void {
        const baseUrl = await AsyncStorage.getItem('baseUrl');
        const hub = await AsyncStorage.getItem('hub');
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('token');
        this.setState({
            baseUrl: baseUrl,
            hub: hub,
            userId: userId,
            token: token
        }, () => {
            this.getDoctorsForMessage()

        })
    }

    showImagePicker() {
        ImagePicker.showImagePicker(options, response => {
            console.log('Response = ', response);
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                this.setState(
                    {
                        imageFromDevice: 'data:image/png;base64,' + response.data,
                        file: response.data,
                        fileName: response.fileName != null ? response.fileName : 'no-name',
                    },
                    () => {
                        console.log(
                            'photo : ' +
                            JSON.stringify({
                                file: this.state.file,
                                fileName: this.state.fileName,
                            }),
                        );
                    },
                );
            }
        });
    }

    async sendMessage() {
        this.setState({progressModalVisible: true})
        if (this.state.textAreaValue === '') {
            alert('لطفا متن پیام را وارد کنید')
        } else {
            const token = this.state.token;
            const baseUrl = this.state.baseUrl;
            const hub = this.state.hub;
            const userId = this.state.userId;
            let receiver = 0;
            for (let item of this.state.doctorData) {

                if (item.FullName === this.state.doctorQuery) {
                    receiver = item.Id;

                    break;
                }

            }

            let body = {
                SenderId: userId,
                ReceiverId: receiver,
                Content: this.state.textAreaValue,
                File: this.state.file,
                FileName: this.state.fileName
            }
            let Body = {
                Method: "POST",
                Url: SENDMESSAGE,
                username: '',
                nationalCode: '',
                Body: body
            }
            fetch(baseUrl + hub, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': 'Bearer ' + new String(token)
                },
                body: JSON.stringify(Body),
            })
                .then(response => response.json())
                .then(async responseData => {
                    if (responseData['StatusCode'] === 200) {
                        this.setState({
                            progressModalVisible: false,
                            Content: null,
                            File: null,
                            FileName: null

                        })
                        alert('پیام شما با موفقیت ارسال شد')
                    } else {
                        this.setState({progressModalVisible: false}, () => {
                            alert('خطا در اتصال به سرویس')
                        });
                    }
                })
                .catch(error => {
                    this.setState({progressModalVisible: false})
                    console.log(error);
                });


        }


    }

    filterDoctorData(text) {
        if (text !== null) {
            let mainData = this.state.doctorData;
            let data = [];
            for (var item of mainData) {
                if (item.FullName.includes(text)) {
                    data.push(item);
                }
            }
            return data;
        }
        return;
    }

    filterMedicalCenterData(text) {
        if (text !== null) {
            let mainData = this.state.medicalCenterData;
            let data = [];
            for (var item of mainData) {
                if (item.includes(text)) {
                    data.push(item);
                }
            }
            return data;
        }
        return;
    }

    onBackPressed() {
        Keyboard.dismiss();
        this.props.navigation.goBack(null);
    }

    onRefresh = () => {
        this.setState({refreshing: true});
    };

    render() {
        const {doctorQuery} = this.state;
        const doctorData = this.filterDoctorData(doctorQuery);
        return (
            <Container>
                <Content padder scrollEnabled={false}>
                    {Platform.OS === 'android' && (
                        <StatusBar
                            barStyle={'dark-content'}
                            backgroundColor={'#209b9b'}
                            hidden={false}
                        />
                    )}
                    {Platform.OS === 'ios' && <Card style={[styles.card, {height: 430}]}>
                        <CardItem style={styles.headerCardItemStyle}>
                            <Right style={{flex: 5, padding: 2}}>
                                <Text style={[styles.doctorTextStyle, {fontSize: 10}]}>
                                    {this.state.fullName} عزیز شما می توانید به پزشک خود پیام
                                    ارسال کنید
                                </Text>
                            </Right>
                            <Body style={{flex: 2}}>
                                <View style={styles.iconViewStyle}>
                                    <Icon
                                        type="FontAwesome"
                                        name="envelope"
                                        style={styles.iconStyle}
                                    />
                                </View>
                            </Body>
                        </CardItem>

                        <View
                            style={[styles.row, {position: 'absolute', top: 110, zIndex: 4}]}>
                            <Autocomplete
                                renderTextInput={() => {
                                    return (
                                        <TextInput
                                            // onEndEditing={() =>
                                            //     this.setState({doctorsShowData: false})
                                            // }
                                            placeholder={'نام پزشک'}
                                            placeholderTextColor={'#b7b7b7'}
                                            value={doctorQuery}
                                            onChangeText={text => {
                                                if (text.length === 0) {
                                                    this.setState({
                                                        doctorQuery: null,
                                                        doctorSelected: false,
                                                        doctorsShowData: true,
                                                    });
                                                } else {
                                                    if (this.state.doctorsShowData) {
                                                        this.setState({doctorQuery: text});
                                                    } else {
                                                        this.setState({
                                                            doctorQuery: text,
                                                            doctorsShowData: true,
                                                        });
                                                    }
                                                }
                                            }}
                                            style={styles.autocompleteInputStyle}
                                        />
                                    );
                                }}
                                hideResults={!this.state.doctorsShowData}
                                containerStyle={styles.autocompleteContainerStyle}
                                listStyle={styles.autocompleteListStyle}
                                listContainerStyle={
                                    !this.state.doctorSelected
                                        ? styles.autocompleteListContainerStyleSelected
                                        : [styles.autocompleteListContainerStyleSelected]
                                }
                                keyboardShouldPersistTaps={'always'}
                                data={doctorData}
                                renderItem={({item, i}) => (
                                    <TouchableOpacity
                                        style={styles.autocompleteResultStyle}
                                        onPress={() =>
                                            this.setState(
                                                {
                                                    doctorQuery: item.FullName,
                                                    doctorSelected: true,
                                                    doctorsShowData: false,
                                                },
                                                () => {
                                                    Keyboard.dismiss();
                                                },
                                            )
                                        }>
                                        <View style={styles.autocompleteIconViewStyle}>
                                            <Icon
                                                type="FontAwesome"
                                                name="user-md"
                                                style={styles.autocompleteIconStyle}
                                            />
                                        </View>
                                        <Text style={styles.autocompleteResultTextStyle}>
                                            {item.FullName}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />

                            <Text style={[styles.label, {marginBottom: 8, fontSize: 9}]}>
                                {' '}
                                ارسال پیام به
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.row,
                                {
                                    position: 'absolute',
                                    top: 150,
                                    zIndex: 2,
                                    borderBottomColor: '#d3d3d3',
                                    borderBottomWidth: 1,
                                },
                            ]}>
                            {this.state.imageFromDevice != null && (
                                <Button
                                    small
                                    style={{
                                        flex: 1,
                                        marginRight: 1,
                                        marginLeft: 1,
                                        backgroundColor: 'transparent',
                                        marginBottom: 2,
                                        borderColor: '#d9d9d9',
                                        justifyContent: 'center',
                                    }}
                                    onPress={() => {
                                        this.setState({
                                            imageFromDevice: null,
                                            fileName: null,
                                        });
                                    }}>
                                    <Icon
                                        type="FontAwesome"
                                        name="trash"
                                        style={{color: 'red', fontSize: 15, flex: 1}}
                                    />
                                </Button>
                            )}
                            <Button
                                small
                                style={{
                                    flex: 5,
                                    marginRight: 3,
                                    marginLeft: 3,
                                    backgroundColor: 'transparent',
                                    marginBottom: 2,
                                    borderWidth: 1,
                                    borderColor: '#d9d9d9',
                                    justifyContent: 'center',
                                }}
                                onPress={async () => {
                                    this.showImagePicker();
                                }}>
                                {this.state.imageFromDevice != null ? (
                                    <Text
                                        style={[styles.autocompleteInputStyle, {color: '#d9d9d9'}]}>
                                        {this.state.fileName}
                                    </Text>
                                ) : (
                                    <Text
                                        style={[styles.autocompleteInputStyle, {color: '#d9d9d9'}]}>
                                        انتخاب عکس
                                    </Text>
                                )}
                            </Button>

                            <Text
                                style={[styles.label, {marginBottom: 8, fontSize: 9, flex: 1}]}>
                                عکس ضمیمه
                            </Text>
                        </View>
                        <View
                            style={[styles.row, {position: 'absolute', top: 180, zIndex: 2}]}>
                            <Form style={{flex: 1}}>
                                <Textarea
                                    style={[styles.textArea]}
                                    rowSpan={6}
                                    bordered
                                    placeholder="متن پیام"
                                    placeholderTextColor={'#d9d9d9'}
                                    value={this.state.textAreaValue}
                                    onChangeText={text => this.setState({textAreaValue: text})}
                                />
                            </Form>
                        </View>
                        <View style={[styles.row, {position: 'absolute', top: 350}]}/>
                    </Card>}

                    {Platform.OS === 'android' &&

                    <Card style={[styles.card, {height: 430}]}>
                        <CardItem style={styles.headerCardItemStyle}>
                            <Right style={{flex: 5, padding: 2}}>
                                <Text style={[styles.doctorTextStyle, {fontSize: 10}]}>
                                    {this.state.fullName} عزیز شما می توانید به پزشک خود پیام
                                    ارسال کنید
                                </Text>
                            </Right>
                            <Body style={{flex: 2}}>
                                <View style={styles.iconViewStyle}>
                                    <Icon
                                        type="FontAwesome"
                                        name="envelope"
                                        style={styles.iconStyle}
                                    />
                                </View>
                            </Body>
                        </CardItem>

                        <View
                            style={[styles.row, {marginTop: 10}]}>
                            <Autocomplete
                                renderTextInput={() => {
                                    return (
                                        <Textarea
                                            numberOfLines={1}
                                            // onEndEditing={() =>
                                            //     this.setState({doctorsShowData: false})
                                            // }
                                            placeholder={'نام پزشک'}
                                            placeholderTextColor={'#b7b7b7'}
                                            value={doctorQuery}
                                            onChangeText={(text) => {
                                                if (text.length === 0) {
                                                    this.setState({
                                                        doctorQuery: null,
                                                        doctorSelected: false,
                                                        doctorsShowData: true,
                                                    });
                                                } else {
                                                    if (this.state.doctorsShowData) {
                                                        this.setState({doctorQuery: text});
                                                    } else {
                                                        this.setState({
                                                            doctorQuery: text,
                                                            doctorsShowData: true,
                                                        });
                                                    }
                                                }
                                            }}
                                            style={styles.autocompleteInputStyle}
                                        />
                                    );
                                }}
                                hideResults={!this.state.doctorsShowData}
                                containerStyle={[styles.autocompleteContainerStyle, {zIndex: 40}]}
                                listStyle={styles.autocompleteListStyle}
                                listContainerStyle={
                                    !this.state.doctorSelected
                                        ? styles.autocompleteListContainerStyleSelected
                                        : [styles.autocompleteListContainerStyleSelected]
                                }
                                keyboardShouldPersistTaps={'always'}
                                data={doctorData}
                                renderItem={({item, i}) => (
                                    <TouchableOpacity
                                        style={styles.autocompleteResultStyle}
                                        onPress={() =>
                                            this.setState(
                                                {
                                                    doctorQuery: item.FullName,
                                                    doctorSelected: true,
                                                    doctorsShowData: false,
                                                },
                                                () => {
                                                    Keyboard.dismiss();
                                                },
                                            )
                                        }>
                                        <View style={styles.autocompleteIconViewStyle}>
                                            <Icon
                                                type="FontAwesome"
                                                name="user-md"
                                                style={styles.autocompleteIconStyle}
                                            />
                                        </View>
                                        <Text style={styles.autocompleteResultTextStyle}>
                                            {item.FullName}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />


                        </View>
                        <View
                            style={[
                                styles.row,
                                {
                                    marginTop: 60,
                                    borderBottomColor: '#d3d3d3',
                                    borderBottomWidth: 1,
                                },
                            ]}>
                            {this.state.imageFromDevice != null && (
                                <Button
                                    small
                                    transparent={true}
                                    style={{
                                        flex: 1,
                                        marginRight: 1,
                                        marginLeft: 1,
                                        backgroundColor: 'transparent',
                                        marginBottom: 2,
                                        borderColor: '#d9d9d9',
                                        justifyContent: 'center',
                                        borderWidth: 0,
                                    }}
                                    onPress={() => {
                                        this.setState({
                                            imageFromDevice: null,
                                            fileName: null,
                                        });
                                    }}>
                                    <Icon
                                        type="FontAwesome"
                                        name="trash"
                                        style={{color: 'red', fontSize: 15}}
                                    />
                                </Button>
                            )}
                            <Button
                                small
                                style={{
                                    flex: 5,
                                    marginRight: 1,
                                    marginLeft: 1,
                                    backgroundColor: 'transparent',
                                    marginBottom: 2,
                                    borderWidth: 1,
                                    borderColor: '#d9d9d9',
                                    justifyContent: 'center',
                                }}
                                onPress={async () => {
                                    this.showImagePicker();
                                }}>
                                {this.state.imageFromDevice != null ? (
                                    <Text
                                        style={[styles.autocompleteInputStyle, {color: '#d9d9d9', fontSize: 8}]}>
                                        {this.state.fileName}
                                    </Text>
                                ) : (
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.autocompleteInputStyle,
                                            {color: '#d9d9d9', padding: 1, paddingTop: 0}]}>
                                        انتخاب عکس
                                    </Text>
                                )}
                            </Button>
                        </View>
                        <View
                            style={[styles.row, {zIndex: 1}]}>
                            <Form style={{flex: 1}}>
                                <Textarea
                                    style={[styles.textArea]}
                                    rowSpan={6}
                                    bordered
                                    placeholder="متن پیام"
                                    placeholderTextColor={'#d9d9d9'}
                                    value={this.state.textAreaValue}
                                    onChangeText={text => this.setState({textAreaValue: text})}
                                />
                            </Form>
                        </View>
                    </Card>
                    }
                    <Modal
                        style={{opacity: 0.7}}
                        width={300}
                        visible={this.state.progressModalVisible}
                        modalAnimation={
                            new SlideAnimation({
                                slideFrom: 'bottom',
                            })
                        }>
                        <ModalContent style={styles.modalContent}>
                            <ActivityIndicator
                                animating={true}
                                size="small"
                                color={'#23b9b9'}
                            />
                        </ModalContent>
                    </Modal>
                </Content>
                <Footer style={styles.footer}>
                    <Button
                        style={
                            this.state.doctorSelected
                                ? {
                                    flex: 5,
                                    marginTop: 1,
                                    marginRight: 10,
                                    backgroundColor: '#209b9b',
                                    marginLeft: 10,
                                    marginBottom: 2,
                                    justifyContent: 'center',
                                }
                                : {
                                    flex: 5,
                                    marginRight: 3,
                                    marginLeft: 3,
                                    backgroundColor: '#c7c7c7',
                                    marginBottom: 2,
                                    justifyContent: 'center',
                                }
                        }
                        onPress={async () => {
                            if (this.state.doctorSelected) {
                                Alert.alert(
                                    'ارسال پیام',
                                    'آیا از ارسال پیام اطمینان دارید ؟',
                                    [
                                        {
                                            text: 'بله',
                                            onPress: () => this.sendMessage(),
                                        },
                                        {
                                            text: 'انصراف',
                                            styles: 'cancel',
                                        },
                                    ],
                                    {cancelable: true},
                                );
                            } else {
                                alert('لطفا پزشک مورد نظر خود را انتخاب کنید');
                            }
                        }}>
                        <Text
                            style={
                                this.state.doctorSelected
                                    ? [
                                        styles.autocompleteInputStyle,
                                        {color: '#fff', fontSize: 13},
                                    ]
                                    : [
                                        styles.autocompleteInputStyle,
                                        {color: 'gray', fontSize: 13},
                                    ]
                            }>
                            ارسال
                        </Text>
                    </Button>
                </Footer>
            </Container>
        );
    }
}

MyChatScreen.navigationOptions = {
    header: null,
    title: '',
    headerStyle: {
        backgroundColor: '#23b9b9',
    },
    headerTitleStyle: {
        color: '#fff',
    },
    headerLeft: null,
};
const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerMenuIcon: {
        padding: 5,
        color: '#fff',
    },
    headerText: {
        padding: 5,
        fontSize: 20,
        color: '#fff',
    },
    questionName: {
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignContent: 'center',
        textAlign: 'right',
        fontSize: 10,
    },
    questionInfo: {
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignContent: 'center',
        textAlign: 'right',
        fontSize: 10,
    },
    card: {
        margin: 5,
        borderWidth: 1,
        borderColor: '#c7c7c7',
        borderRadius: 2,
        elevation: 8,
    },
    header: {
        backgroundColor: '#23b9b9',
        height: 150,
    },
    body: {
        marginTop: 40,
    },
    bodyContent: {
        flex: 1,
        margin: 10,
        alignItems: 'center',
        padding: 10,
        borderWidth: 2,
        borderColor: '#23b9b9',
    },
    titleText: {
        color: '#fff',
        textAlign: 'left',
        alignSelf: 'flex-end',
        fontWeight: 'bold',
    },
    contentText: {
        color: '#000',
        textAlign: 'left',
        alignSelf: 'flex-end',
        marginTop: 5,
        fontSize: 15,
    },
    chatInput: {
        padding: 2,
        marginTop: 10,
        marginBottom: 10,
    },
    footer: {
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        marginTop: 10,
    },
    scrollView: {
        flex: 1,
        backgroundColor: 'pink',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        flex: 1,
        marginRight: 20,
        marginLeft: 20,
        marginTop: 5,
        marginBottom: 5,
        borderRadius: 5,
        backgroundColor: '#23b9b9',
    },
    mainViewStyle: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    mainCardStyle: {
        height: '100%',
        marginBottom: 10,
        backgroundColor: '#fff',
        flexDirection: 'column',
        flex: 1,
        borderColor: '#d9d9d9',
        borderWidth: 1,
    },
    iconViewStyle: {
        alignSelf: 'center',
        minWidth: 80,
        minHeight: 80,
        maxWidth: 100,
        maxHeight: 100,
        borderRadius: 50,
        borderColor: '#d9d9d9',
        borderWidth: 1,
        elevation: 8,
        shadowColor: '#fff',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
    },
    iconStyle: {
        fontSize: 30,
        color: '#209b9b',
    },
    medicalCenterNameBodyStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
    },
    medicalCenterTextStyle: {
        marginRight: 1,
        textAlign: 'right',
        color: '#fff',
        // color: '#8a8a8a',
        fontFamily: 'IRANMarker',
        fontSize: 11,
    },
    doctorTextStyle: {
        alignSelf: 'flex-end',
        marginRight: 5,
        textAlign: 'center',
        color: '#fff',
        // color: '#8a8a8a',
        fontFamily: 'IRANMarker',
        fontSize: 8,
    },
    headerCardItemStyle: {
        backgroundColor: '#209b9b',
    },
    RatingTextStyle: {
        marginRight: 1,
        textAlign: 'right',
        color: '#636363',
        fontFamily: 'IRANMarker',
        fontSize: 10,
    },
    textArea: {
        marginTop: 20,
        // zIndex: 1,
        paddingTop: 10,
        flexDirection: 'row-reverse',
        padding: 2,
        paddingRight: 10,
        fontFamily: 'IRANMarker',
        fontSize: 10,
        color: '#636363',
        textAlign: 'right',
        elevation: 2,
        backgroundColor: '#fff',
        shadowColor: '#000',
        borderColor: '#fff',
    },
    label: {
        fontFamily: 'IRANMarker',
        color: '#000',
        alignSelf: 'flex-end',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 1,
        flex: 1,
        marginBottom: 13,
        margin: 1,
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    row: {

        flexDirection: 'row',
        margin: 5,
        padding: 1,
    },
    modalContent: {
        marginTop: 5,
        padding: 2,
        alignContent: 'center',
        backgroundColor: 'rgba(47,246,246,0.06)',
    },
    autocompleteContainerStyle: {
        borderWidth: 0,
        flex: 5,
        left: 4,
        position: 'absolute',
        right: 4,
        top: 0,
        zIndex: 10,
    },
    autocompleteInputStyle: {
        paddingTop: 20,
        justifyContent: 'center',
        borderWidth: 0,
        color: '#23b9b9',
        fontFamily: 'IRANMarker',
        padding: 1,
        marginRight: 2,
        fontSize: 10,
        textAlign: 'right',
    },
    autocompleteResultTextStyle: {
        borderWidth: 0,
        flex: 10,
        color: 'gray',
        fontFamily: 'IRANMarker',
        fontSize: 11,
        padding: 1,
        marginRight: 3,
        textAlign: 'right',
    },
    autocompleteResultStyle: {
        flexDirection: 'row-reverse',
        backgroundColor: '#fff',
        borderBottomColor: '#c7c7c7',
        borderBottomWidth: 1,
    },
    autocompleteListStyle: {
        borderColor: '#c7c7c7',
        borderWidth: 1,
        borderRightColor: 'transparent',
        borderLeftColor: 'transparent',
        borderBottomEndRadius: 2,
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 3,
    },
    autocompleteListContainerStyleSelected: {
        width: '100%',
        borderWidth: 0,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        paddingRight: 10,
        paddingLeft: 10,
        minHeight: 0,
        maxHeight: 100,
    },
    autocompleteListContainerStyleDeSelected: {
        borderWidth: 0,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        paddingRight: 10,
        paddingLeft: 10,
        minHeight: 0,
        maxHeight: 0,
    },
    autocompleteIconViewStyle: {
        marginRight: 2,
        marginLeft: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },
    autocompleteIconStyle: {
        alignSelf: 'center',
        color: 'gray',
        fontSize: 15,
    },
});
