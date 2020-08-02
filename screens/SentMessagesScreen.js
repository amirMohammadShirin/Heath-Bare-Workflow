import React, {Component} from 'react';
import DefaultDoctorImage from '../component/DefaultDoctorImage';
import {Dialog} from 'react-native-simple-dialogs';
import ImageView from 'react-native-image-view';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    Platform,
    ActivityIndicator,
    Keyboard, AsyncStorage
} from 'react-native';
import {
    Container,
    Content,
    CardItem,
    Button,
    Left,
    Card,
    Body,
    Icon,
    Text,
    Item,
    Textarea,
} from 'native-base';
import Modal, {ModalContent, SlideAnimation} from "react-native-modals";

const SentMessagesTest = '/api/GetSentMessages'
const GETSENTMESSAGES = '/GetSentMessages';

var images = [
    {
        source: {
            uri: 'http://clinicservices.bazyarapp.ir/Images/Doctor.png',
        },
        title: 'Paris',
        width: 806,
        height: 720,
    },
];
export default class SentMessagesScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            imageViewVisible: false,
            visible: false,
            chatList: [],
            searchWord: null,
            array: null,
            selectedMessage: null,
            chatDetails: [],
            navigator: this.props.myNavigator,
            refreshing: false,
            baseUrl: null,
            hub: null,
            userId: null,
            imageVisible: false,
            token: null
        };
    }


    async componentDidMount(): void {
        const token = await AsyncStorage.getItem('token');
        const baseUrl = await AsyncStorage.getItem("baseUrl")
        const hub = await AsyncStorage.getItem("hub")
        const userId = await AsyncStorage.getItem("userId")
        this.setState({
            baseUrl: baseUrl,
            hub: hub,
            userId: userId,
            token: token,
        })
        this.getSentMessages(true);
    }


    showMessage(item) {
        this.setState({selectedMessage: item, visible: true});
        if (item.File !== null) {
            images[0].title = item.FileName;
            images[0].source.uri = "data:image/png;base64," + item.File;
        }
    }

    async getSentMessages(isRefresh) {
        const token = this.state.token;
        const baseUrl = this.state.baseUrl;
        const hub = this.state.hub;
        const userId = this.state.userId;

        let body = {UserId: userId}
        let Body = {
            Method: 'POST',
            Url: GETSENTMESSAGES,
            Username: '',
            NationalCode: '',
            Body: body
        }
        this.setState({progressModalVisible: !isRefresh, refreshing: isRefresh})
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
                        let data = responseData['Data']
                        console.log(JSON.stringify(responseData))
                        this.setState({chatList: data, chatDetails: data}, () => {
                            this.setState({progressModalVisible: false, refreshing: false})
                        })
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
                    this.setState({progressModalVisible: false, refreshing: false}, () => {
                        alert('خطا در اتصال به سرویس')
                    });
                }
            })
            .catch(error => {
                this.setState({progressModalVisible: false, refreshing: false})
                console.log(error);
            });
    }


    onRefresh = () => {
        Keyboard.dismiss;
        this.setState({
            refreshing: true,
            searchWord: null,
        });
        console.log('refresh started');
        this.getSentMessages(true)

    };

    renderData(item) {
        return (
            <TouchableOpacity onPress={() => this.showMessage(item)}>
                <CardItem bordered style={styles.headerCard}>
                    <Left style={styles.headerLeftStyle}>
                        {item.SenderImage == null ? (
                            <View>
                                {item.Gender === 'مرد' ? (
                                    <DefaultDoctorImage
                                        myStyle={{
                                            padding: 5,
                                            flex: 1,
                                            height: 60,
                                            width: 60,
                                            resizeMode: 'cover',
                                            marginBottom: 3,
                                        }}
                                        gender={'Man'}
                                    />
                                ) : (
                                    <DefaultDoctorImage
                                        myStyle={{
                                            marginBottom: 3,
                                            padding: 5,
                                            flex: 1,
                                            height: 60,
                                            width: 60,

                                            resizeMode: 'cover',
                                        }}
                                        gender={'Woman'}
                                    />
                                )}
                            </View>
                        ) : null}
                    </Left>
                    <Body style={styles.headerBody}>
                        <Text style={[styles.title, {marginTop: 5, fontSize: 10, color: '#000'}]}>
                            {item.SenderName}
                        </Text>
                        <Text numberOfLines={1} style={[styles.title, {marginTop: 3, fontSize: 9}]}>
                            {item.LastMessage}
                        </Text>
                        <Text style={[styles.title, {marginTop: 5, fontSize: 7}]}>
                            تاریخ ارسال پیام {item.Date}
                        </Text>
                    </Body>
                </CardItem>
            </TouchableOpacity>
        );
    }

    filterList(searchWord) {
        let mainData = this.state.chatDetails;
        let list = [];
        for (var item of mainData) {
            if (
                item.SenderName.includes(searchWord) ||
                item.LastMessage.includes(searchWord) ||
                item.Gender.includes(searchWord)
            ) {
                this.setState({chatList: []});
                list.push(item);
            } else {
                this.setState({chatList: null});
            }
        }
        console.log(JSON.stringify(list));
        this.setState({chatList: list});
    }

    onChangeText(text) {
        let mainData = this.state.chatDetails;
        if (text.length > 2) {
            this.filterList(text);
        } else if (text.length === 0) {
            this.setState({chatList: mainData});
        }
    }

    myNavigate() {
        this.state.navigator.navigate('ChatScreen');
    }

    render() {
        return (
            <Container style={{backgroundColor: '#fff'}}>
                <Content
                    style={{flex: 1}}
                    scrollEnabled={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh}
                            progressBackgroundColor="#fff"
                            tintColor="#209b9b"
                            colors={['#209b9b', 'rgba(34,166,166,0.72)']}
                        />
                    }>
                    {Platform.OS === 'android' && (
                        <StatusBar
                            barStyle={'dark-content'}
                            backgroundColor={'#209b9b'}
                            hidden={false}
                        />
                    )}
                    <View
                        style={{
                            marginTop: 5,
                            marginBottom: 2,
                            backgroundColor: '#209b9b',
                            flex: 1,
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                            borderColor: '#209b9b',
                            marginRight: 2,
                            marginLeft: 2,
                        }}>
                        <View
                            style={{
                                marginTop: 2,
                                flexDirection: 'row-reverse',
                                backgroundColor: '#209b9b,flex:1',
                            }}>
                            <Item
                                style={{
                                    marginTop: 5,
                                    backgroundColor: 'transparent',
                                    flexDirection: 'row',
                                    width: '98%',
                                    marginRight: 2,
                                    marginLeft: 2,
                                    borderWidth: 0,
                                }}>
                                <Icon
                                    style={styles.searchIcon}
                                    type="FontAwesome5"
                                    name="search"
                                />
                                <Textarea
                                    numberOfLines={1}
                                    underlineColorAndroid="#209b9b"
                                    placeholder="جستجوی نام پزشک"
                                    placeholderTextColor={'#fff'}
                                    style={styles.inputStyle}
                                    value={this.state.searchWord}
                                    onChangeText={text => this.onChangeText(text)}
                                />
                            </Item>
                        </View>
                        {/* <View> */}

                        {this.state.chatList.length > 0 ? (
                            <Card style={styles.mainCard}>
                                {this.state.chatDetails != null &&
                                this.state.chatList.length > 0 ? (
                                    <View>
                                        {this.state.chatList.map((item, index) =>
                                            this.renderData(item),
                                        )}
                                    </View>
                                ) : this.state.chatDetails.length > 0 ? (
                                    <View>
                                        {this.state.chatDetails.map((item, index) =>
                                            this.renderData(item),
                                        )}
                                    </View>
                                ) : null}
                            </Card>
                        ) : this.state.chatList.length === 0 ? (
                            <Card style={styles.mainCard}>
                                <View
                                    style={{
                                        flexDirection: 'row-reverse',
                                        justifyContent: 'flex-end',
                                        alignContent: 'flex-end',
                                        marginTop: 2,
                                        paddingLeft: 5,
                                        paddingTop: 1,
                                        paddingBottom: 1,
                                        marginLeft: 2,
                                        marginBottom: 10,
                                    }}
                                />

                                <CardItem>
                                    <Body style={styles.noResultBody}>
                                        <Text
                                            style={[
                                                styles.title,
                                                {alignSelf: 'center', textAlign: 'center'},
                                            ]}>
                                            موردی یافت نشد
                                        </Text>
                                    </Body>
                                </CardItem>
                            </Card>
                        ) : null}
                    </View>


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

                    {this.state.selectedMessage != null && (
                        <Dialog
                            contentStyle={{backgroundColor: 'transparent'}}
                            dialogStyle={{
                                backgroundColor: 'transparent',
                                borderColor: 'transparent',
                                borderWidth: 0,
                                elevation: 0,
                            }}
                            animationType={'fade'}
                            visible={this.state.visible}
                            onTouchOutside={() => this.setState({visible: false})}>
                            <View>
                                <Card
                                    style={{
                                        borderBottomColor: 'gray',
                                        borderWidth: 1,
                                    }}>
                                    <CardItem header style={{backgroundColor: '#209b9b'}}>
                                        <Body>
                                            <Text style={styles.modalTitleText}>
                                                {this.state.selectedMessage.SenderName}
                                            </Text>
                                        </Body>
                                    </CardItem>
                                    <CardItem
                                        header
                                        style={{
                                            backgroundColor: '#fff',
                                            minHeight: 1,
                                            maxHeight: 400,
                                        }}>
                                        <Body
                                            style={{
                                                minHeight: 50,
                                                flexDirection: 'row-reverse',
                                            }}>
                                            <Textarea
                                                disabled={true}
                                                numberOfLines={7}
                                                style={[
                                                    styles.modalCancelButtonText,
                                                    {
                                                        margin: 2,
                                                        color: '#23b9b9',
                                                        fontSize: 10,
                                                        textAlign: 'right',
                                                        borderColor: '#c9c9c9',
                                                        borderWidth: 0,
                                                    },
                                                ]}>
                                                {this.state.selectedMessage.LastMessage}
                                            </Textarea>
                                        </Body>
                                    </CardItem>
                                    {this.state.selectedMessage.File != null && <CardItem footer>
                                        <Body style={{flex: 1, flexDirection: 'column-reverse'}}>
                                            <Button
                                                small
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    alignSelf: 'flex-start',
                                                    width: '100%',
                                                    borderWidth: 1,
                                                    borderColor: '#c9c9c9',
                                                    borderRadius: 5,
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                                onPress={() => this.setState({imageViewVisible: true})}>
                                                <Text
                                                    style={{
                                                        fontSize: 10,
                                                        alignSelf: 'center',
                                                        fontFamily: 'IRANMarker',
                                                        textAlign: 'center',
                                                        color: '#c9c9c9',
                                                    }}>
                                                    مشاهده عکس
                                                </Text>
                                            </Button>
                                        </Body>
                                    </CardItem>}
                                </Card>

                                <ImageView
                                    animationType={'fade'}
                                    isSwipeCloseEnabled={true}
                                    onClose={() => this.setState({imageViewVisible: false})}
                                    images={images}
                                    imageIndex={0}
                                    isVisible={this.state.imageViewVisible}
                                />
                            </View>
                        </Dialog>
                    )}
                </Content>
            </Container>
        );
    }
}

SentMessagesScreen.navigationOptions = {
    header: null,
    title: 'پیام ها',
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
        backgroundColor: 'rgba(34,166,166,0.72)',
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
        marginRight: 10,
        marginLeft: 10,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 2,
        elevation: 8,
    },
    header: {
        backgroundColor: 'rgba(34,166,166,0.72)',
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
        color: '#fff',
        textAlign: 'left',
        alignSelf: 'flex-end',
        marginTop: 5,
        fontSize: 15,
    },
    searchIcon: {
        fontSize: 13,
        color: '#fff',
        marginRight: 2,
        marginLeft: 10,
        alignSelf: 'center',
    },
    inputStyle: {
        color: '#fff',
        alignSelf: 'center',
        flex: 4,
        marginRight: 5,
        textAlign: 'right',
        fontSize: 9,
        fontFamily: 'IRANMarker',
        borderWidth: 0,
    },
    mainCard: {
        padding: 2,
        marginTop: 2,
        marginBottom: 2,
    },
    noResultBody: {
        marginTop: 30,
        alignSelf: 'center',
        flexDirection: 'row-reverse',
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
    },
    headerLeftStyle: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    headerRightStyle: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-end',
    },
    headerBody: {
        flexDirection: 'column',
        flex: 7,
        margin: 1,
    },
    headerCard: {
        flexDirection: 'row-reverse',
        paddingRight: 3,
        // borderBottomColor: '#c9c9c9',
        // borderBottomWidth: 1,
    },
    detailCard: {
        flexDirection: 'row-reverse',
        backgroundColor: '#fff',
    },
    title: {
        flex: 1,
        alignSelf: 'flex-end',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 2,
        color: 'gray',
        textAlign: 'right',
        fontFamily: 'IRANMarker',
        fontSize: 9,
        marginRight: 15,
    },
    modalTitle: {
        backgroundColor: '#23b9b9',
    },
    modalTitleText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'IRANMarker',
        textAlign: 'center',
        alignSelf: 'center',
    },
    modalFooter: {
        padding: 2,
        backgroundColor: 'rgba(47,246,246,0.06)',
    },
    modalCancelButton: {
        flex: 1,
        minHeight: 50,
        backgroundColor: '#fff',
        borderRadius: 3,
        borderColor: '#23b9b9',
        borderWidth: 1,
        padding: 2,
        margin: 5,
    },
    modalSuccessButton: {
        flex: 1,
        minHeight: 50,
        backgroundColor: '#23b9b9',
        borderRadius: 3,
        padding: 2,
        margin: 5,
    },
    modalSuccessButtonText: {
        flex: 1,
        color: '#fff',
        fontFamily: 'IRANMarker',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        textAlignVertical: 'center',
    },
    modalCancelButtonText: {
        flex: 1,
        color: '#23b9b9',
        fontSize: 10,
        fontFamily: 'IRANMarker',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        textAlignVertical: 'center',
    },
    modalContent: {
        marginTop: 5,
        padding: 2,
        alignContent: 'center',
        backgroundColor: 'rgba(47,246,246,0.06)',
    },
});
