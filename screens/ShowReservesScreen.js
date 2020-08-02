import React, {Component} from 'react';
import {
    AccordionList,
    CollapseHeader,
    Collapse,
} from 'accordion-collapse-react-native';
import {
    StyleSheet,
    View,
    Image,
    ScrollView,
    StatusBar,
    AsyncStorage,
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import ProgressiveText from '../component/progressiveText';
import {
    Accordion,
    Container,
    Header,
    Title,
    Content,
    Footer,
    FooterTab,
    CardItem,
    Button,
    Left,
    Card,
    Right,
    Body,
    Icon,
    Text,
    List,
    ListItem,
    Fab,
    Separator,
    Item,
    Input,
    Badge,
} from 'native-base';
import {
    Collapse2,
    CollapseHeader2,
    CollapseBody,
    AccordionList2,
} from 'accordion-collapse-react-native';
import Modal, {
    ModalButton,
    ModalContent,
    ModalFooter,
    ModalTitle,
    SlideAnimation,
} from 'react-native-modals';

const GETRESREVATIONREPORTS = '/GetReservationReports';
// TODO : DISABLERESERVATION ?
const DISABLERESERVATION = '/DisableReservation';

export default class ShowReservesScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visibleModal: false,
            array: null,
            progressModalVisible: true,
            refreshing: false,
            reserveList: [{}],
            acceptedList: [{}],
            disabledList: [{}],
            waitingList: [{}],
            searchWord: null,
            redActive: true,
            grayActive: true,
            greenActive: true,
            navigation: null,
            hub: null,
            userId: null,
            token: null
        };
    }

    disableReservationConfirmation(value) {
        Alert.alert(
            'لغو نوبت',
            'آیا از لغو این نوبت اطمینان دارید ؟',
            [
                {
                    text: 'بله',
                    onPress: () => this.disableReservation(value),
                },
                {
                    text: 'انصراف',
                    styles: 'cancel',
                },
            ],
            {cancelable: true},
        );
    }

    async componentWillMount(): void {
        console.log('showReserveScreen will mount');
        const token = await AsyncStorage.getItem('token');
        var hub = await AsyncStorage.getItem('hub');
        var userId = await AsyncStorage.getItem('userId');
        var baseUrl = await AsyncStorage.getItem('baseUrl');
        this.setState({baseUrl: baseUrl, userId: userId, hub: hub, token: token}, async () => {
            this.getReservationReports(false);
        });
    }

    componentDidMount() {
        console.log('showReserveScreen Did mount');
    }

    componentWillUnmount() {
        console.log('showReserveScreen will umount');
    }

    async disableReservation(value) {
        const token = this.state.token;
        const baseUrl = this.state.baseUrl;
        const hub = this.state.hub;
        const userId = this.state.userId;
        this.setState({progressModalVisible: true});
        let body = {
            userId: userId,
            id: value.id,
            actor: value.actor,
            medicalCenter: value.medicalCenter,
            startTime: value.StartTime,
            type: value.type,
            date: value.date,
            status: value.status,
            statusValue: value.statusValue,
        };
        let Body = {
            method: "POST",
            Url: DISABLERESERVATION,
            UserName: '',
            NationalCode: '',
            body: body
        }
        console.log('body : ' + JSON.stringify(body));
        fetch(baseUrl + hub, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(token)
            },
            body: JSON.stringify(Body),
        })
            .then(response => response.json())
            .then(responseData => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];

                        this.setState({progressModalVisible: false}, async () => {
                            Alert.alert(
                                'عملیات لغو با موفقیت انجام شد',
                                '',
                                [
                                    {
                                        text: 'تایید',
                                        onPress: async () => {
                                            await this.getReservationReports(false);
                                            // await this.componentWillMount();
                                            // this.props.navigation.push('ShowReservesScreen')
                                        },
                                    },
                                ],
                                {
                                    cancelable: false,
                                },
                            );
                        });
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
                } else if (responseData['StatusCode'] === 501) {
                    //10010
                    this.setState({progressModalVisible: false});
                    alert(responseData['Data']);
                } else {
                    this.setState({progressModalVisible: false}, () => {
                        alert('خطا در اتصال به سرویس');
                        console.log(JSON.stringify(responseData));
                    });
                }
            })
            .catch(error => {
                console.error(error);
                // alert(error)
            });
    }

    async getReservationReports(refreshing) {
        const baseUrl = this.state.baseUrl;
        const hub = this.state.hub;
        const userId = this.state.userId;
        const token = this.state.token;
        let Body = {
            method: "POST",
            Url: GETRESREVATIONREPORTS,
            UserName: '',
            NationalCode: '',
            body: {
                id: userId.toString()
            }
        }
        this.setState({progressModalVisible: !refreshing});
        fetch(baseUrl + hub, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(token)
            },
            body: JSON.stringify(Body)
        })
            .then(response => response.json())
            .then(responseData => {
                console.log(responseData)
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        data.sort((a, b) => (a.id < b.id ? 1 : -1));
                        console.log(data);
                        this.setState({
                            array: data,
                            reserveList: data,
                            redActive: true,
                            greenActive: true,
                            grayActive: true,
                            searchWord: null,
                            progressModalVisible: false,
                            refreshing: false,
                        });
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
                    this.setState(
                        {progressModalVisible: false, refreshing: false, searchWord: null},
                        () => {
                            alert('خطا در اتصال به سرویس');
                        },
                    );
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    onBackPressed() {
        this.props.navigation.goBack();
    }

    renderList(value, index) {
        if (
            value.statusValue === '8' ||
            value.statusValue === '1' ||
            value.status === 'لغو شده' ||
            value.status === 'لغو حضور توسط مراجعه کننده'
        ) {
            return (
                <View key={index}>
                    <Card style={[styles.post]}>
                        <CardItem
                            bordered
                            header
                            style={{
                                flexDirection: 'row-reverse',
                                backgroundColor: 'rgba(215,1,0,0.75)',
                            }}>
                            <Right>
                                <Text style={[styles.title, {color: '#fff'}]}>تاریخ</Text>
                            </Right>
                            <Body>
                                <Text style={[styles.title, {color: '#fff'}]}>
                                    {value.date}
                                </Text>
                            </Body>
                        </CardItem>
                        <CardItem
                            style={{
                                backgroundColor: '#cfcfcf',
                                flexDirection: 'row-reverse',
                            }}>
                            <Right>
                                <Text style={styles.title}>پزشک</Text>
                            </Right>
                            <Body>
                                <Text style={styles.value}>{value.actor}</Text>
                            </Body>
                        </CardItem>
                        <CardItem
                            style={{
                                backgroundColor: '#cfcfcf',
                                flexDirection: 'row-reverse',
                            }}>
                            <Right>
                                <Text style={styles.title}>مرکز درمانی</Text>
                            </Right>
                            <Body>
                                <Text style={styles.value}>{value.medicalCenter}</Text>
                            </Body>
                        </CardItem>
                        <CardItem
                            style={{
                                backgroundColor: '#cfcfcf',
                                flexDirection: 'row-reverse',
                            }}>
                            <Right>
                                <Text style={styles.title}>وضعیت نوبت</Text>
                            </Right>
                            <Body>
                                <Text style={styles.value}>{value.status}</Text>
                            </Body>
                        </CardItem>
                        <CardItem
                            style={{
                                backgroundColor: '#cfcfcf',
                                flexDirection: 'row-reverse',
                            }}>
                            <Right>
                                <Text style={styles.title}>نوع نوبت</Text>
                            </Right>
                            <Body>
                                <Text style={styles.value}>{value.type}</Text>
                            </Body>
                        </CardItem>
                        <CardItem
                            style={{
                                backgroundColor: '#cfcfcf',
                                flexDirection: 'row-reverse',
                            }}>
                            <Right>
                                <Text style={styles.title}>ساعت</Text>
                            </Right>
                            <Body>
                                <Text style={styles.value}>{value.StartTime}</Text>
                            </Body>
                        </CardItem>
                    </Card>
                </View>
            );
        } else {
            return (
                <View key={index}>
                    <Card style={[styles.post]}>
                        <CardItem
                            bordered
                            header
                            style={{
                                flexDirection: 'row-reverse',
                                backgroundColor: 'rgba(0,138,50,0.78)',
                            }}>
                            <Right>
                                <Text style={[styles.title, {color: '#fff'}]}>تاریخ</Text>
                            </Right>
                            <Body>
                                <Text style={[styles.title, {color: '#fff'}]}>
                                    {value.date}
                                </Text>
                            </Body>
                        </CardItem>
                        <CardItem
                            style={{backgroundColor: '#fff', flexDirection: 'row-reverse'}}>
                            <Right>
                                <Text style={styles.title}>پزشک</Text>
                            </Right>
                            <Body>
                                <Text style={styles.value}>{value.actor}</Text>
                            </Body>
                        </CardItem>
                        <CardItem
                            style={{backgroundColor: '#fff', flexDirection: 'row-reverse'}}>
                            <Right>
                                <Text style={styles.title}>مرکز درمانی</Text>
                            </Right>
                            <Body>
                                <Text style={styles.value}>{value.medicalCenter}</Text>
                            </Body>
                        </CardItem>
                        <CardItem
                            style={{backgroundColor: '#fff', flexDirection: 'row-reverse'}}>
                            <Right>
                                <Text style={styles.title}>وضعیت نوبت</Text>
                            </Right>
                            <Body>
                                <Text style={styles.value}>{value.status}</Text>
                            </Body>
                        </CardItem>
                        <CardItem
                            style={{backgroundColor: '#fff', flexDirection: 'row-reverse'}}>
                            <Right>
                                <Text style={styles.title}>نوع نوبت</Text>
                            </Right>
                            <Body>
                                <Text style={styles.value}>{value.type}</Text>
                            </Body>
                        </CardItem>
                        <CardItem
                            style={{backgroundColor: '#fff', flexDirection: 'row-reverse'}}>
                            <Right>
                                <Text style={styles.title}>ساعت</Text>
                            </Right>
                            <Body>
                                <Text style={styles.value}>{value.StartTime}</Text>
                            </Body>
                        </CardItem>
                        <CardItem
                            footer
                            bordered
                            style={{backgroundColor: '#fff', flexDirection: 'row-reverse'}}>
                            <Right>
                                <Text
                                    onPress={() => this.disableReservationConfirmation(value)}
                                    style={[styles.title, {color: 'rgba(215,1,0,0.75)'}]}>
                                    لغو نوبت
                                </Text>
                            </Right>
                            <Body>
                                <Icon
                                    onPress={() => this.disableReservationConfirmation(value)}
                                    type={'FontAwesome5'}
                                    name="calendar-times"
                                    style={{color: 'rgba(215,1,0,0.75)'}}
                                />
                            </Body>
                        </CardItem>
                    </Card>
                </View>
            );
        }
    }

    goToRatingScreen(
        medicalCenter,
        doctor,
        reservationId,
        doctorId,
        medicalCenterId,
    ) {
        let fullName = this.props.fullName;
        this.props.navigation.navigate('Rating', {
            medicalCenter: medicalCenter,
            doctor: doctor,
            fullName: fullName,
            reservationId: reservationId,
            medicalCenterId: medicalCenterId,
            doctorId: doctorId,
        });
    }

    onRefresh = () => {
        this.setState({
            refreshing: true,
            searchWord: null,
        });
        this.getReservationReports(true);
    };

    renderData() {
        return (
            <Accordion
                ref={a => (this._Accordion = a)}
                style={{
                    margin: 5,
                    flexDirection: 'column',
                    flex: 1,
                }}
                dataArray={this.state.reserveList}
                headerStyle={{
                    backgroundColor: '#fff',
                    flexDirection: 'row-reverse',
                }}
                renderContent={item => {
                    return (
                        <Card style={[styles.post]}>
                            <CardItem style={styles.detailCard}>
                                <Right>
                                    <Text style={[styles.title]}>تاریخ</Text>
                                </Right>
                                <Body>
                                    <Text style={[styles.title]}>{item.date}</Text>
                                </Body>
                            </CardItem>
                            <CardItem style={styles.detailCard}>
                                <Right>
                                    <Text style={styles.title}>پزشک</Text>
                                </Right>
                                <Body>
                                    <Text style={styles.value}>{item.actor}</Text>
                                </Body>
                            </CardItem>
                            <CardItem style={styles.detailCard}>
                                <Right>
                                    <Text style={styles.title}>مرکز درمانی</Text>
                                </Right>
                                <Body>
                                    <Text style={styles.value}>{item.medicalCenter}</Text>
                                </Body>
                            </CardItem>
                            <CardItem style={styles.detailCard}>
                                <Right>
                                    <Text style={styles.title}>وضعیت نوبت</Text>
                                </Right>
                                <Body>
                                    <Text style={styles.value}>{item.status}</Text>
                                </Body>
                            </CardItem>
                            <CardItem style={styles.detailCard}>
                                <Right>
                                    <Text style={styles.title}>نوع نوبت</Text>
                                </Right>
                                <Body>
                                    <Text style={styles.value}>{item.type}</Text>
                                </Body>
                            </CardItem>
                            <CardItem style={styles.detailCard}>
                                <Right>
                                    <Text style={styles.title}>ساعت</Text>
                                </Right>
                                <Body>
                                    <Text style={styles.value}>{item.StartTime}</Text>
                                </Body>
                            </CardItem>
                        </Card>
                    );
                }}
                renderHeader={item => {
                    if (item.statusValue === 57 && this.state.greenActive) {
                        return (
                            <CardItem style={styles.headerCard}>
                                <Left style={styles.headerLeftStyle}>
                                    <TouchableOpacity
                                        disabled
                                        style={[
                                            styles.buttonActive,
                                            {
                                                width: 20,
                                                height: 20,
                                                borderRadius: 10,
                                                backgroundColor: 'green',
                                                borderColor: 'green',
                                            },
                                        ]}>
                                        <Icon
                                            type="FontAwesome5"
                                            name="check"
                                            style={[styles.activeIconStyle]}
                                        />
                                    </TouchableOpacity>
                                </Left>
                                <Body style={[styles.headerBody]}>
                                    <Text style={[styles.title]}>
                                        {item.actor} {item.medicalCenter}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.goToRatingScreen(
                                                item.medicalCenter,
                                                item.actor,
                                                item.id,
                                                item.actorId,
                                                item.medicalCenterId,
                                            );
                                        }}
                                        style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                        <Text
                                            style={{
                                                marginRight: 1,
                                                marginLeft: 1,
                                                marginTop: 5,
                                                color: '#209b9b',
                                                fontSize: 10,
                                                backgroundColor: '#fff',
                                                borderColor: '#209b9b',
                                                borderWidth: 1,
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                padding: 2,
                                                borderRadius: 2,
                                            }}>
                                            ارسال نظر
                                        </Text>
                                    </TouchableOpacity>
                                </Body>
                            </CardItem>
                        );
                    } else if (item.statusValue === 56 && this.state.grayActive) {
                        return (
                            <CardItem style={styles.headerCard}>
                                <Left style={styles.headerLeftStyle}>
                                    <TouchableOpacity
                                        disabled
                                        style={[
                                            styles.buttonActive,
                                            {
                                                width: 20,
                                                height: 20,
                                                borderRadius: 10,
                                                backgroundColor: 'gray',
                                                borderColor: 'gray',
                                            },
                                        ]}>
                                        <Icon
                                            type="FontAwesome5"
                                            name="clock"
                                            style={styles.activeIconStyle}
                                        />
                                    </TouchableOpacity>
                                </Left>
                                <Body style={styles.headerBody}>
                                    <Text style={styles.title}>
                                        {item.actor} {item.medicalCenter}
                                    </Text>
                                </Body>
                                <Right style={styles.headerRightStyle}>
                                    <Icon
                                        onPress={() => this.disableReservationConfirmation(item)}
                                        style={styles.disableIcon}
                                        type="FontAwesome5"
                                        name="calendar-times"
                                    />
                                </Right>
                            </CardItem>
                        );
                    } else if (
                        item.statusValue !== 56 &&
                        item.statusValue !== 57 &&
                        this.state.redActive
                    ) {
                        return (
                            <CardItem style={styles.headerCard}>
                                <Left style={styles.headerLeftStyle}>
                                    <TouchableOpacity
                                        disabled
                                        style={[
                                            styles.buttonActive,
                                            {
                                                width: 20,
                                                height: 20,
                                                borderRadius: 10,
                                                backgroundColor: 'red',
                                                borderColor: 'red',
                                            },
                                        ]}>
                                        <Icon
                                            type="FontAwesome5"
                                            name="times"
                                            style={styles.activeIconStyle}
                                        />
                                    </TouchableOpacity>
                                </Left>

                                <Body style={styles.headerBody}>
                                    <Text style={styles.title}>
                                        {item.actor} {item.medicalCenter}
                                    </Text>
                                </Body>
                                <Right style={styles.headerRightStyle}>
                                </Right>
                            </CardItem>
                        );
                    } else {
                        return null;
                    }
                }}
                contentStyle={{
                    backgroundColor: 'rgba(49,255,255,0)',
                    flexDirection: 'row-reverse',
                    backfaceVisibility: 'hidden',
                    borderColor: '#gray',
                    borderWidth: 1,
                }}
                iconStyle={{color: 'gray'}}
                expandedIconStyle={{color: 'gray'}}
            />
        );
    }

    filterList(searchWord) {
        console.log(searchWord);
        let mainData = this.state.array;
        let list = [];
        for (var item of mainData) {
            if (
                item.actor.includes(searchWord) ||
                item.medicalCenter.includes(searchWord) ||
                item.type.includes(searchWord) ||
                item.date.includes(searchWord) ||
                item.status.includes(searchWord)
            ) {
                this.setState({reserveList: []});
                list.push(item);
            } else {
                this.setState({reserveList: null});
            }
        }
        this.setState({reserveList: list});
    }

    onChangeText(text) {
        let mainData = this.state.array;
        if (text.length > 2) {
            this.filterList(text);
        } else if (text.length === 0) {
            this.setState({reserveList: mainData});
        }
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
                    {!this.state.progressModalVisible && (
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
                                        flex: 6,
                                        marginRight: 2,
                                        marginLeft: 2,
                                        borderWidth: 0,
                                    }}>
                                    <Icon
                                        style={styles.searchIcon}
                                        type="FontAwesome5"
                                        name="search"
                                    />
                                    <Input
                                        underlineColorAndroid="#209b9b"
                                        placeholder="جستجوی نام پزشک ، نام مرکز و ..."
                                        placeholderTextColor={'#fff'}
                                        style={styles.inputStyle}
                                        value={this.state.searchWord}
                                        onChangeText={text => this.onChangeText(text)}
                                    />
                                </Item>
                                <View
                                    style={{
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        flexDirection: 'column',
                                        marginTop: 5,
                                        flex: 1,
                                        paddingLeft: 5,
                                        paddingRight: 1,
                                        paddingTop: 1,
                                        paddingBottom: 1,
                                        marginRight: 2,
                                        marginLeft: 2,
                                    }}>
                                    <TouchableOpacity
                                        style={
                                            this.state.greenActive
                                                ? [
                                                    styles.buttonActive,
                                                    {backgroundColor: 'green', borderColor: 'green'},
                                                ]
                                                : styles.buttonDeActive
                                        }
                                        onPress={() =>
                                            this.setState({
                                                greenActive: !this.state.greenActive,
                                            })
                                        }>
                                        <Icon
                                            type="FontAwesome"
                                            name="check"
                                            style={
                                                this.state.greenActive
                                                    ? styles.activeIconStyle
                                                    : styles.deActiveIconStyle
                                            }
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={
                                            this.state.redActive
                                                ? [
                                                    styles.buttonActive,
                                                    {backgroundColor: 'red', borderColor: 'red'},
                                                ]
                                                : styles.buttonDeActive
                                        }
                                        onPress={() =>
                                            this.setState({
                                                redActive: !this.state.redActive,
                                            })
                                        }>
                                        <Icon
                                            type="FontAwesome"
                                            name="times"
                                            style={
                                                this.state.redActive
                                                    ? styles.activeIconStyle
                                                    : styles.deActiveIconStyle
                                            }
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={
                                            this.state.grayActive
                                                ? [
                                                    styles.buttonActive,
                                                    {backgroundColor: 'gray', borderColor: 'gray'},
                                                ]
                                                : styles.buttonDeActive
                                        }
                                        onPress={() => {
                                            this.setState({
                                                grayActive: !this.state.grayActive,
                                            });
                                        }}>
                                        <Icon
                                            type="FontAwesome5"
                                            name="clock"
                                            style={
                                                this.state.grayActive
                                                    ? styles.activeIconStyle
                                                    : styles.deActiveIconStyle
                                            }
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {this.state.reserveList.length > 0 ? (
                                <Card style={styles.mainCard}>
                                    {this.state.array != null &&
                                    this.state.reserveList.length > 0 ? (
                                        <View>{this.renderData()}</View>
                                    ) : null}
                                </Card>
                            ) : this.state.reserveList.length === 0 ? (
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
                                        }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                this.this.setState({
                                                    greenActive: !this.state.greenActive,
                                                });
                                            }}>
                                            <View
                                                style={
                                                    this.state.greenActive
                                                        ? styles.greenActive
                                                        : styles.greenDeActive
                                                }
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                this.setState({
                                                    redActive: !this.state.redActive,
                                                });
                                            }}>
                                            <View
                                                style={
                                                    this.state.redActive
                                                        ? styles.disabledActive
                                                        : styles.disabledActive
                                                }
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                this.setState({
                                                    grayActive: !this.state.grayActive,
                                                });
                                            }}>
                                            <View
                                                style={
                                                    this.state.grayActive
                                                        ? styles.waitingActive
                                                        : styles.waitingDeActive
                                                }
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <CardItem>
                                        <Body style={styles.noResultBody}>
                                            <Text style={styles.title}>موردی یافت نشد</Text>
                                        </Body>
                                    </CardItem>
                                </Card>
                            ) : !this.greenActive &&
                            !this.state.redActive &&
                            !this.state.grayActive ? null : null}
                        </View>
                    )}
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
            </Container>
        );

    }
}

ShowReservesScreen.navigationOptions = {
    header: null,
    title: 'نوبت های رزرو شده',
    headerStyle: {
        backgroundColor: '#23b9b9',
    },
    headerTitleStyle: {
        color: '#fff',
    },
    headerLeft: null,
};

const styles = StyleSheet.create({
    buttonActive: {
        justifyContent: 'center',
        height: 18,
        width: 18,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#3ae0e0',
        backgroundColor: '#3ae0e0',
        margin: 3,
    },
    buttonDeActive: {
        justifyContent: 'center',
        height: 18,
        width: 18,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#3ae0e0',
        backgroundColor: '#fff',
        margin: 3,
    },
    expandIcon: {fontSize: 15, color: 'gray', alignSelf: 'flex-end'},
    searchIcon: {
        fontSize: 13,
        color: '#fff',
        marginRight: 2,
        marginLeft: 10,
        alignSelf: 'center',
        flex: 1,
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
    noResultBody: {
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
        flexDirection: 'row-reverse',
        flex: 7,
        margin: 1,
    },
    headerCard: {
        flexDirection: 'row-reverse',
        // borderBottomColor: '#c9c9c9',
        // borderBottomWidth: 1,
    },
    detailCard: {
        flexDirection: 'row-reverse',
        backgroundColor: '#fff',
    },
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
    post: {
        margin: 5,
        flex: 0,
        backgroundColor: '#e4e4e4',
    },
    titleText: {
        color: 'gray',
        textAlign: 'right',
        fontSize: 15,
    },
    contentText: {
        color: 'gray',
        textAlign: 'right',
        fontSize: 15,
    },
    modalContent: {
        marginTop: 5,
        padding: 2,
        alignContent: 'center',
        backgroundColor: 'rgba(47,246,246,0.02)',
    },
    title: {
        flex: 5,
        alignSelf: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 5,
        color: 'gray',
        textAlign: 'center',
        fontFamily: 'IRANMarker',
        fontSize: 9,
    },
    value: {
        color: 'gray',
        textAlign: 'right',
        fontFamily: 'IRANMarker',
        fontSize: 9,
    },
    mainCard: {
        padding: 2,
        marginTop: 2,
        marginBottom: 2,
    },
    activeIconStyle: {
        color: '#fff',
        fontSize: 10,
        alignSelf: 'center',
    },
    deActiveIconStyle: {
        color: '#3ae0e0',
        fontSize: 10,
        alignSelf: 'center',
    },
    disableIcon: {
        color: 'red',
        fontSize: 15,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginRight: 2,
        marginLeft: 5,
    },
    badgeStyle: {
        borderColor: '#209b9b',
        borderWidth: 1,
        backgroundColor: '#fff',
        elevation: 3,
        padding: 1,
        margin: 1,
    },
    badgeText: {
        color: '#209b9b',
        fontSize: 20,
    },
});
