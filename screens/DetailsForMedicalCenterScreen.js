import React, {Component} from 'react';
import {Rating, AirbnbRating} from 'react-native-ratings';
import DefaultMedicalCenterImage from '../component/DefaultMedicalCenterImage';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
    StyleSheet,
    Text,
    View,
    Platform,
    BackHandler,
} from 'react-native';
import {
    Button,
    Body,
    Container,
    Content,
    Card,
    Header,
    Icon,
    Left,
    Right,
    Root,
    Thumbnail,
    CardItem,
} from 'native-base';
import Modal, {ModalContent, SlideAnimation} from 'react-native-modals';

const GETMEDICALCENTERBYID = '/GetMedicalCenterById';
const GETMEDICALCENTERRATE = '/GetMedicalCenterRate';

export default class DetailsForMedicalCenterScreen extends Component {
    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        }
        this.state = {
            id: null,
            title: null,
            description: null,
            contract: null,
            address: null,
            phoneNumber: null,
            morningStart: null,
            morningEnd: null,
            eveningStart: null,
            eveningEnd: null,
            nightStart: null,
            nightEnd: null,
            baseUrl: null,
            token: null,
            progressModalVisible: false,
            selectedMedicalCenter: null,
            location: '',
            facilities: null,
            score: 1,
            count: '1',
            hub: null,

        };
    }

    handleBackButtonClick() {
        console.log(JSON.stringify(this.props.navigation.state));

        if (this.props.navigation.state.isDrawerOpen) {
            this.props.navigation.closeDrawer();
        } else {
            if (!this.state.progressModalVisible) {
                this.onBackPressed();
            }
        }
        return true;
    }

    async componentWillMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener(
                'hardwareBackPress',
                this.handleBackButtonClick,
            );
        }
        const token = await AsyncStorage.getItem('token');
        var hub = await AsyncStorage.getItem('hub');
        var baseUrl = await AsyncStorage.getItem('baseUrl');
        const medicalCenter = this.props.navigation.getParam('medicalCenter');
        console.log(JSON.stringify(this.props.navigation.state));
        await this.setState(
            {baseUrl: baseUrl, hub: hub, selectedMedicalCenter: medicalCenter, token: token},
            () => {
                this.getMedicalCenterDetails();
            },
        );
    }

    getLatLong(location, type) {
        let latlong = location.split(',');
        let pointToShow = {latitude: latlong[0], longitude: latlong[1]};
        if (type === 'latitude') {
            return parseFloat(pointToShow.latitude);
        } else {
            return parseFloat(pointToShow.longitude);
        }
    }

    onBackPressed() {
        let backRoute = this.props.navigation.getParam('backRoute');
        console.log(backRoute);
        if (backRoute === 'HomeScreen') {
            // this.props.navigation.push('HomeScreen', {
            // });
            this.props.navigation.push('HomeScreen');
        } else {
            this.props.navigation.goBack(null);
        }
    }

    getInitialState() {
        return {
            region: {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            },
        };
    }

    onRegionChange(region) {
        this.setState({region});
    }

    async getMedicalCenterDetails() {
        const baseUrl = this.state.baseUrl;
        const hub = this.state.hub;
        const token = this.state.token;
        this.setState({progressModalVisible: true});
        const value = this.state.selectedMedicalCenter;
        let body =
            {
                title: value.Title
                , id: value.Id
            };
        let Body = {
            method: "POST",
            Url: GETMEDICALCENTERBYID,
            Username: '',
            NationalCode: '',
            Body: body

        }
        await fetch(baseUrl + hub, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(token)

            },
            body: JSON.stringify(Body),
        })
            .then(response => response.json())
            .then(async responseData => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        this.setState({progressModalVisible: true}, async () => {
                            await this.getMedicalCenterRate()
                            this.setState({
                                id: data['Id'],
                                title: data['Title'],
                                description: data['Description'],
                                contract: data['Contract'],
                                address: data['Address'],
                                phoneNumber: data['PhoneNumber'],
                                morningStart: data['MorningStart'],
                                morningEnd: data['MorningEnd'],
                                eveningStart: data['EveningStart'],
                                eveningEnd: data['EveningEnd'],
                                nightStart: data['NightStart'],
                                nightEnd: data['NightEnd'],
                                image: data['Image'],
                                location: data['Location'],
                                // score: 1,
                                facilities:
                                    data['Facilities'] != null &&
                                    typeof data['Facilities'] != 'undefined'
                                        ? data['Facilities']
                                        : null,
                            });
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
                    this.setState({progressModalVisible: false}, () => {
                        alert(JSON.stringify('خطا در دسترسی به سرویس'));
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
    }


    async getMedicalCenterRate() {
        const baseUrl = this.state.baseUrl;
        const hub = this.state.hub
        const token = this.state.token;
        this.setState({progressModalVisible: true});
        const value = this.state.selectedMedicalCenter;
        let body =
            {
                title: value.LastName,
                id: value.Id.toString()
            };

        let Body = {
            Method: "POST",
            Url: GETMEDICALCENTERRATE,
            username: '',
            nationalCode: '',
            body: body
        }
        console.log('getDoctorRate Body : \n ', Body);
        await fetch(baseUrl + hub, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(token)
            },
            body: JSON.stringify(Body),
        })
            .then(response => response.json())
            .then(async responseData => {
                console.log('getDoctorRate Response : \n ', responseData);
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        let score = data['Score']
                        let count = data['Count']
                        await this.setState({progressModalVisible: false}, () => {
                            console.log(JSON.stringify(data));
                            this.setState(
                                {
                                    score: score,
                                    count: count.toString()
                                },
                                async () => {
                                    // alert(JSON.stringify(this.state.doctor))
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
                } else {
                    this.setState({progressModalVisible: false}, () => {
                        alert(JSON.stringify('خطا در دسترسی به سرویس'))
                        // alert(JSON.stringify(responseData));
                    });
                }
            })
            .catch(error => {
                console.log(error);
                // alert(error)
            });
    }


    render() {
        return (
            <Container>
                <Header span style={styles.header}>
                    <Left>
                        <Button
                            transparent
                            style={styles.headerMenuIcon}
                            onPress={() => this.onBackPressed()}>
                            <Icon
                                style={styles.headerMenuIcon}
                                name="arrow-back"
                                onPress={() => this.onBackPressed()}
                            />
                        </Button>
                    </Left>
                    <Right>
                        <Text style={styles.headerText}>اطلاعات بیشتر</Text>
                    </Right>
                </Header>
                <Root>
                    <Content padder style={styles.content}>
                        {Platform.OS === 'android' && (
                            <StatusBar
                                barStyle={'dark-content'}
                                backgroundColor={'#209b9b'}
                                hidden={false}
                            />
                        )}
                        <Card
                            style={{
                                padding: 5,
                                borderColor: '#23b9b9',
                                elevation: 8,
                                borderWidth: 1,
                            }}>
                            {!this.state.progressModalVisible && (
                                <CardItem style={{marginTop: 5}}>
                                    <Left>
                                        <View>
                                            {this.state.image !== null &&
                                            typeof this.state.image !== 'undefined' ? (
                                                <Thumbnail
                                                    circular
                                                    large
                                                    style={{
                                                        height: 100,
                                                        width: 100,
                                                        resizeMode: 'cover',
                                                    }}
                                                    source={{
                                                        uri: 'data:image/png;base64, ' + this.state.image,
                                                    }}
                                                />
                                            ) : (
                                                <DefaultMedicalCenterImage myStyle={{
                                                    height: 100,
                                                    width: 100,
                                                    resizeMode: 'cover',
                                                }}/>

                                            )}
                                            <AirbnbRating
                                                showRating={false}
                                                isDisabled={true}
                                                style={{
                                                    marginRight: 1,
                                                    marginLeft: 1,
                                                    marginTop: 10,
                                                    marginBottom: 10,
                                                }}
                                                starContainerStyle={{
                                                    marginTop: 10,
                                                    backgroundColor: '#fff',
                                                    paddingRight: 10,
                                                    borderRadius: 20,
                                                    borderColor: '#d9d9d9',
                                                    borderWidth: 1,
                                                    elevation: 8,
                                                    shadowColor: '#000',
                                                }}
                                                count={5}
                                                defaultRating={this.state.score}
                                                size={12}
                                                selectedColor={
                                                    this.state.score < 2
                                                        ? '#d11d1d'
                                                        : this.state.score >= 3
                                                        ? '#26c754'
                                                        : '#209b9b'
                                                }
                                            />
                                            <Text
                                                style={{
                                                    marginTop: 1,
                                                    fontFamily: 'IRANMarker',
                                                    fontSize: 6,
                                                    color: '#8a8a8a',
                                                    textAlign: 'center',
                                                }}>
                                                مجموع نظرات کاربران
                                            </Text>
                                            <Text
                                                style={{
                                                    marginTop: 1,
                                                    fontFamily: 'IRANMarker',
                                                    fontSize: 8,
                                                    color: '#8a8a8a',
                                                    textAlign: 'center',
                                                }}>
                                                {this.state.count}
                                            </Text>
                                        </View>

                                        <Body
                                            style={{
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                            }}>
                                            <Button
                                                bordered
                                                info
                                                style={{
                                                    padding: 2,
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    backgroundColor: '#23b9b9',
                                                    borderColor: '#23b9b9',
                                                }}
                                                onPress={() => {
                                                    // this.getLocation()
                                                    // NativeModules.NeshanFullScreenModule.navigateToNative(
                                                    //     this.state.selectedMedicalCenter.Id)
                                                    // NativeModules.NeshanFullScreenModule.test()
                                                    let location = {
                                                        Latitude: this.getLatLong(
                                                            this.state.location,
                                                            'latitude',
                                                        ),
                                                        Longitude: this.getLatLong(
                                                            this.state.location,
                                                            'longitude',
                                                        ),
                                                    };
                                                    this.props.navigation.navigate('MapScreen', {
                                                        location: location,
                                                        title:
                                                            this.state.title != null ? this.state.title : '',
                                                    });
                                                }}>
                                                <Text style={{color: '#fff', fontFamily: 'IRANMarker'}}>
                                                    مشاهده روی نقشه
                                                </Text>
                                            </Button>
                                        </Body>
                                    </Left>
                                </CardItem>
                            )}

                            {this.state.title != null && this.state.title !== '' ? (
                                <CardItem style={{marginTop: 5}}>
                                    <Left>
                                        <Body>
                                            <Text
                                                style={{
                                                    fontFamily: 'IRANMarker',
                                                    textAlign: 'right',
                                                    alignSelf: 'flex-end',
                                                    fontSize: 20,
                                                    color: '#000',
                                                    fontWeight: 'bold',
                                                    padding: 1,
                                                }}>
                                                {this.state.title}
                                            </Text>
                                        </Body>
                                    </Left>
                                </CardItem>
                            ) : null}
                            {this.state.description != null &&
                            this.state.description !== '' ? (
                                <CardItem style={{marginTop: 5}}>
                                    <Left>
                                        <Text
                                            style={{
                                                fontFamily: 'IRANMarker',
                                                flex: 1,
                                                justifyContent: 'flex-start',
                                                textAlign: 'right',
                                                flexDirection: 'row-reverse',
                                                fontSize: 13,
                                                color: '#a7a7a7',
                                                padding: 1,
                                            }}>
                                            {this.state.description}
                                        </Text>
                                    </Left>
                                </CardItem>
                            ) : null}
                            {this.state.contract != null && this.state.contract !== '' ? (
                                <CardItem style={{marginTop: 5}}>
                                    <Body>
                                        <Text
                                            style={{
                                                fontFamily: 'IRANMarker',
                                                textAlign: 'right',
                                                alignSelf: 'flex-end',
                                                fontSize: 12,
                                                color: '#a7a7a7',
                                                padding: 1,
                                            }}>
                                            نوع مرکز : {this.state.contract}
                                        </Text>
                                    </Body>
                                </CardItem>
                            ) : null}
                            {this.state.facilities != null &&
                            typeof this.state.facilities != 'undefined' ? (
                                <CardItem style={{marginTop: 5}}>
                                    <Body style={{flexDirection: 'row-reverse'}}>
                                        <View>
                                            <Text
                                                style={{
                                                    fontFamily: 'IRANMarker',
                                                    fontSize: 14,
                                                    color: '#a7a7a7',
                                                    marginBottom: 1,
                                                }}>
                                                بخش های مرکز درمانی :
                                            </Text>
                                            {this.state.facilities.map((item, key) => (
                                                <View key={key}>
                                                    <Text
                                                        style={{
                                                            fontFamily: 'IRANMarker',
                                                            textAlign: 'right',
                                                            fontSize: 12,
                                                            margin: 2,
                                                            padding: 1,
                                                            color: '#a7a7a7',
                                                        }}>
                                                        {' '}
                                                        - {item.Title}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </Body>
                                </CardItem>
                            ) : null}

                            {this.state.address != null && this.state.address !== '' ? (
                                <CardItem style={{marginTop: 5}}>
                                    <Body>
                                        <Text
                                            style={{
                                                fontFamily: 'IRANMarker',
                                                textAlign: 'right',
                                                alignSelf: 'flex-end',
                                                fontSize: 12,
                                                color: '#a7a7a7',
                                                padding: 1,
                                            }}>
                                            آدرس : {this.state.address}
                                        </Text>
                                    </Body>
                                </CardItem>
                            ) : null}

                            {this.state.phoneNumber != null &&
                            this.state.phoneNumber !== '' ? (
                                <CardItem style={{marginTop: 5}}>
                                    <Body>
                                        <Text
                                            style={{
                                                fontFamily: 'IRANMarker',
                                                textAlign: 'right',
                                                alignSelf: 'flex-end',
                                                fontSize: 12,
                                                color: '#a7a7a7',
                                                padding: 1,
                                            }}>
                                            تلفن : {this.state.phoneNumber}
                                        </Text>
                                    </Body>
                                </CardItem>
                            ) : null}

                            {this.state.morningStart != null &&
                            this.state.morningEnd != null &&
                            this.state.morningEnd !== '' &&
                            this.state.morningStart != null ? (
                                <CardItem style={{marginTop: 5}}>
                                    <Body>
                                        <Text
                                            style={{
                                                fontFamily: 'IRANMarker',
                                                textAlign: 'right',
                                                alignSelf: 'flex-end',
                                                fontSize: 12,
                                                color: '#a7a7a7',
                                                padding: 1,
                                            }}>
                                            {' '}
                                            ساعت کاری مرکز (شیفت صبح) : {
                                            this.state.morningStart
                                        } - {this.state.morningEnd}
                                        </Text>
                                    </Body>
                                </CardItem>
                            ) : null}
                            {this.state.eveningStart != null &&
                            this.state.eveningEnd != null &&
                            this.state.eveningEnd !== '' &&
                            this.state.eveningStart != null ? (
                                <CardItem style={{marginTop: 5}}>
                                    <Body>
                                        <Text
                                            style={{
                                                fontFamily: 'IRANMarker',
                                                textAlign: 'right',
                                                alignSelf: 'flex-end',
                                                fontSize: 12,
                                                color: '#a7a7a7',
                                                padding: 1,
                                            }}>
                                            {' '}
                                            ساعت کاری مرکز (شیفت عصر) : {
                                            this.state.eveningStart
                                        } - {this.state.eveningEnd}
                                        </Text>
                                    </Body>
                                </CardItem>
                            ) : null}
                            {this.state.nightStart != null &&
                            this.state.nightEnd != null &&
                            this.state.nightEnd !== '' &&
                            this.state.nightStart != null ? (
                                <CardItem style={{marginTop: 5}}>
                                    <Body>
                                        <Text
                                            style={{
                                                fontFamily: 'IRANMarker',
                                                textAlign: 'right',
                                                alignSelf: 'flex-end',
                                                fontSize: 12,
                                                color: '#a7a7a7',
                                                padding: 1,
                                            }}>
                                            {' '}
                                            ساعت کاری مرکز (شیفت شب) : {this.state.nightStart} -{' '}
                                            {this.state.nightEnd}{' '}
                                        </Text>
                                    </Body>
                                </CardItem>
                            ) : null}
                        </Card>
                        <Modal
                            style={{opacity: 0.7}}
                            width={300}
                            visible={this.state.progressModalVisible}
                            modalAnimation={
                                new SlideAnimation({
                                    slideFrom: 'bottom',
                                })
                            }>
                            <ModalContent
                                style={[
                                    styles.modalContent,
                                    {backgroundColor: 'rgba(47,246,246,0.02)'},
                                ]}>
                                <ActivityIndicator
                                    animating={true}
                                    size="small"
                                    color={'#23b9b9'}
                                />
                            </ModalContent>
                        </Modal>
                    </Content>
                </Root>
            </Container>
        );
    }
}

DetailsForMedicalCenterScreen.navigationOptions = {
    header: null,
    title: 'اطلاعات بیشتر',
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
        margin: 2,
        padding: 2,
        flexDirection: 'column',
    },
    headerMenuIcon: {
        padding: 5,
        fontSize: 30,
        color: '#fff',
    },
    headerText: {
        fontFamily: 'IRANMarker',
        padding: 5,
        fontSize: 18,
        color: '#fff',
    },
    header: {
        backgroundColor: '#23b9b9',
    },
    footer: {
        backgroundColor: '#23b9b9',
    },
    viewStyle: {
        width: '100%',
        height: '100%',
        backgroundColor: 'red',
        flexDirection: 'column',
    },
    row: {
        width: '100%',
        flex: 1,
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    top: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    bottom: {
        flex: 2,
        width: '100%',
        height: '100%',
        backgroundColor: 'red',
    },
    modalContent: {
        marginTop: 5,
        padding: 2,
        alignContent: 'center',
        backgroundColor: 'rgba(47,246,246,0.06)',
    },
});
