import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
    StyleSheet,
    View,
    Linking,
    StatusBar,
    Platform,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity,
    TouchableHighlight,
    PermissionsAndroid,
    BackHandler,
    Alert,
} from 'react-native';
import {
    Container,
    Header,
    Footer,
    Fab,
    Button,
    Left,
    Right,
    Icon,
    Text,
    Content,
    Card,
    CardItem,
    Body,
} from 'native-base';
import {Dialog} from 'react-native-simple-dialogs';
import MyModal, {
    ModalButton,
    ModalContent,
    ModalFooter,
    ModalTitle,
    SlideAnimation,
} from 'react-native-modals';

const INITIAL_REGION = {
    latitude: 35.715753,
    longitude: 51.426004,
    latitudeDelta: 0.8,
    longitudeDelta: 0.1,
};

import MapView from 'react-native-maps';
import {Marker} from 'react-native-maps';

const GETALLLOCATIONS = '/GetMedicalCentersLocation';
const MunicipalityMedicalCenterDefinitionId = 2;
const MunicipalityMedicalCenterDefinitionTitle = 'درمانگاه شهرداری';
const MunicipalityMedicalCenterColor = '#23c4c4';
const ClinicDefinitionId = 23;
const ClinicDefinitionTitle = 'مطب';
const ClinicColor = '#3191f7';
const HospitalDefinitionId = 5;
const HospitalDefinitionTitle = 'بیمارستان';
const HospitalColor = '#d13e19';
const MyCluster = props => {
    const {count} = props;
    return (
        <View style={styles.cluster}>
            <Text>{count}</Text>
        </View>
    );
};

export default class HomeScreen extends Component {
    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        }
        this.state = {
            settingVisible: false,
            active: true,
            errorMessage: '',
            user: null,
            baseUrl: null,
            progressModalVisible: false,
            fontLoaded: false,
            visible: false,
            token: null,
            medicalCenters: [],
            selectedMedicalCenter: null,
            showMunicipality: true,
            showClinic: false,
            showHospital: false,
            municipalityMedicalCenters: [],
            clinics: [],
            settingProgressModalVisible: false,
            hospitals: [],
            region: {
                latitude: 35.715559,
                longitude: 51.425621,
                latitudeDelta: 0.5,
                longitudeDelta: 1.3,
            },
            tracksViewChanges: true,
            hub: null,

        };
    }

    renderCustomClusterMarker = count => <MyCluster count={count}/>;

    handleBackButtonClick() {
        if (this.props.navigation.state.isDrawerOpen == true) {
            this.props.navigation.closeDrawer();
        } else if (this.state.visible == true) {
            this.setState({visible: false});
        } else {
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
        }
        return true;
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

    async getAllLocations() {
        const baseUrl = this.state.baseUrl;
        const hub = this.state.hub;
        const token = this.state.token;
        console.log(token)
        let Body = {
            method: 'GET',
            Url: GETALLLOCATIONS,
            UserName: '',
            NationalCode: '',
            Body: null
        }
        this.setState({progressModalVisible: true});
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
                        let hospitals = [];
                        let municipalityMedicalCenters = [];
                        let clinics = [];
                        data.forEach(element => {
                            if (element.CenterDefinitionId === HospitalDefinitionId) {
                                hospitals.push(element);
                            } else if (
                                element.CenterDefinitionId ===
                                MunicipalityMedicalCenterDefinitionId
                            ) {
                                municipalityMedicalCenters.push(element);
                            } else {
                                clinics.push(element);
                            }
                        });
                        this.setState({progressModalVisible: false}, async () => {
                            this.setState(
                                {
                                    medicalCenters: data,
                                    municipalityMedicalCenters: municipalityMedicalCenters,
                                    hospitals: hospitals,
                                    clinics: clinics,
                                },
                                () => {
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
                } else if (responseData['StatusCode'] === 400) {
                    alert(JSON.stringify('خطا در دسترسی به سرویس'));
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    _getLocationAsync = async () => {
        try {
            let {status} = await Permissions.askAsync(Permissions.LOCATION);
            if (status !== 'granted') {
                this.setState({errorMessage: 'Permission to access location denied'});
            }
            let location = await Location.getCurrentPositionAsync({});
            this.setState({location});
        } catch (error) {
            // let status = location.getProviderStatusAsync();
            // if (!status.locationServicesEnabled) {
            //     Alert.alert(
            //     Alert.alert(
            //         '',
            //         'لطفا به برنامه برای دسترسی به موقعیت فعلی خود دسترسی دهید'
            //         ,
            //         [
            //             {
            //                 text: 'انصراف',
            //                 styles: 'cancel'
            //             },
            //             {text: 'تایید', onPress: () => this.openSettings()},
            //         ],
            //         {cancelable: true},
            //     );
            // }
        }
    };

    async componentWillMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener(
                'hardwareBackPress',
                this.handleBackButtonClick,
            );
        }
        const token = await AsyncStorage.getItem('token');
        let hub = await AsyncStorage.getItem('hub');
        let baseUrl = await AsyncStorage.getItem('baseUrl');

        if (Platform.OS === 'android') {
            this.setState({
                errorMessage: 'try on device',
            });
        } else {
            this._getLocationAsync();
        }
        this.setState(
            {
                user: this.props.navigation.getParam('user'),
                baseUrl: baseUrl,
                hub: hub,
                token: token
            },
            async () => {
                await this.getAllLocations();
            },
        );
    }

    async componentDidMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener(
                'hardwareBackPress',
                this.handleBackButtonClick,
            );
        }
        const LocationPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: 'Salamat App Camera Permission',
                message: 'Salamat App needs access to your Location ',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
        );
    }

    componentWillUnmount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener(
                'hardwareBackPress',
                this.handleBackButtonClick,
            );
        }
    }

    render() {
        if (Platform.OS === 'android') {
            return (
                <Container>
                    <Header style={styles.header}>
                        <Left style={{flex: 5}}>
                            <Text style={[styles.headerText, {fontFamily: 'IRANMarker'}]}>
                                نرم افزار سلامت
                            </Text>
                        </Left>
                        <Right style={{flex: 1}}>
                            <Button
                                transparent
                                style={styles.headerMenuIcon}
                                onPress={() => this.props.navigation.openDrawer()}>
                                <Icon
                                    style={styles.headerMenuIcon}
                                    name="menu"
                                    onPress={() => this.props.navigation.openDrawer()}
                                />
                            </Button>
                        </Right>
                    </Header>


                    {true && (
                        <Content
                            scrollEnabled={true}
                            style={{flex: 1, backgroundColor: '#fff'}}>
                            {Platform.OS === 'android' && (
                                <StatusBar
                                    barStyle={'dark-content'}
                                    backgroundColor={'#209b9b'}
                                    hidden={false}
                                />
                            )}
                            <MapView
                                maxZoomLevel={19}
                                minZoomLevel={9}
                                provider="google"
                                style={{
                                    flex: 1,
                                    width: Dimensions.get('window').width,
                                    height: Dimensions.get('window').height,
                                }}
                                superClusterOptions={{
                                    radius: 15,
                                    maxZoom: 15,
                                    minZoom: 1,
                                    nodeSize: 10,
                                }}
                                Clustering={false}
                                region={this.state.region}>
                                {this.state.showMunicipality &&
                                this.state.municipalityMedicalCenters.map(value => (
                                    <Marker
                                        title={value.Title}
                                        onCalloutPress={() => {
                                            if (value.IsActiveForReservation) {
                                                this.setState({selectedMedicalCenter: value}, () => {
                                                    this.setState({visible: true});
                                                });
                                            }
                                        }}
                                        coordinate={{
                                            latitude: this.getLatLong(value.Location, 'latitude'),
                                            longitude: this.getLatLong(value.Location, 'longitude'),
                                        }}>
                                        <Icon
                                            type={'FontAwesome5'}
                                            name={'map-marker-alt'}
                                            style={
                                                value.IsActiveForReservation
                                                    ? {
                                                        color: MunicipalityMedicalCenterColor,
                                                        fontSize: 45,
                                                    }
                                                    : {color: 'gray', fontSize: 40}
                                            }
                                        />
                                    </Marker>
                                ))}
                            </MapView>

                            <Dialog
                                contentStyle={{backgroundColor: 'transparent'}}
                                dialogStyle={{
                                    backgroundColor: 'transparent',
                                    borderColor: 'transparent',
                                    borderWidth: 0,
                                    elevation: 0,
                                }}
                                animationType={'fade'}
                                visible={this.state.settingVisible}
                                onTouchOutside={() => this.setState({settingVisible: false})}>
                                <View>
                                    <Card style={{borderBottomColor: 'gray', borderWidth: 1}}>
                                        <CardItem header style={{backgroundColor: '#209b9b'}}>
                                            <Body style={{flexDirection: 'row-reverse'}}>
                                                <Text style={[styles.modalTitleText, {flex: 7}]}>
                                                    فیلتر های مراکز درمانی
                                                </Text>
                                                <ActivityIndicator
                                                    color={'#187878'}
                                                    animating={this.state.settingProgressModalVisible}
                                                />
                                            </Body>
                                        </CardItem>
                                        <CardItem style={{backgroundColor: '#fff'}}>
                                            <Right>
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        this.setState(
                                                            {settingProgressModalVisible: true},
                                                            () => {
                                                                this.setState({
                                                                    showHospital: !this.state.showHospital,
                                                                    settingProgressModalVisible: false,
                                                                });
                                                            },
                                                        )
                                                    }>
                                                    <View
                                                        style={
                                                            this.state.showHospital
                                                                ? [
                                                                    styles.activeIconSetting,
                                                                    {
                                                                        backgroundColor: HospitalColor,
                                                                        borderColor: HospitalColor,
                                                                    },
                                                                ]
                                                                : [
                                                                    styles.deActiveIconSetting,
                                                                    {
                                                                        borderColor: HospitalColor,
                                                                        backgroundColor: '#fff',
                                                                    },
                                                                ]
                                                        }
                                                    />
                                                </TouchableOpacity>
                                            </Right>
                                            <Body style={styles.settingCardBodyStyle}>
                                                <Text style={styles.settingCardBodyTextStyle}>
                                                    {HospitalDefinitionTitle}
                                                </Text>
                                            </Body>
                                        </CardItem>
                                        <CardItem style={{backgroundColor: '#fff'}}>
                                            <Right>
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        this.setState(
                                                            {settingProgressModalVisible: true},
                                                            () => {
                                                                this.setState({
                                                                    showMunicipality: !this.state
                                                                        .showMunicipality,
                                                                    settingProgressModalVisible: false,
                                                                });
                                                            },
                                                        )
                                                    }>
                                                    <View
                                                        style={
                                                            this.state.showMunicipality
                                                                ? [
                                                                    styles.activeIconSetting,
                                                                    {
                                                                        backgroundColor: MunicipalityMedicalCenterColor,
                                                                        borderColor: MunicipalityMedicalCenterColor,
                                                                    },
                                                                ]
                                                                : [
                                                                    styles.deActiveIconSetting,
                                                                    {
                                                                        borderColor: MunicipalityMedicalCenterColor,
                                                                        backgroundColor: '#fff',
                                                                    },
                                                                ]
                                                        }
                                                    />
                                                </TouchableOpacity>
                                            </Right>
                                            <Body style={styles.settingCardBodyStyle}>
                                                <Text style={styles.settingCardBodyTextStyle}>
                                                    {MunicipalityMedicalCenterDefinitionTitle}
                                                </Text>
                                            </Body>
                                        </CardItem>
                                        <CardItem style={{backgroundColor: '#fff'}}>
                                            <Right>
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        this.setState(
                                                            {settingProgressModalVisible: true},
                                                            () => {
                                                                this.setState({
                                                                    showClinic: !this.state.showHospital,
                                                                    settingProgressModalVisible: false,
                                                                });
                                                            },
                                                        )
                                                    }>
                                                    <View
                                                        style={
                                                            this.state.showClinic
                                                                ? [
                                                                    styles.activeIconSetting,
                                                                    {
                                                                        backgroundColor: ClinicColor,
                                                                        borderColor: ClinicColor,
                                                                    },
                                                                ]
                                                                : [
                                                                    styles.deActiveIconSetting,
                                                                    {
                                                                        borderColor: ClinicColor,
                                                                        backgroundColor: '#fff',
                                                                    },
                                                                ]
                                                        }
                                                    />
                                                </TouchableOpacity>
                                            </Right>
                                            <Body style={styles.settingCardBodyStyle}>
                                                <Text style={styles.settingCardBodyTextStyle}>
                                                    {ClinicDefinitionTitle}
                                                </Text>
                                            </Body>
                                        </CardItem>
                                    </Card>
                                </View>
                            </Dialog>
                            {this.state.selectedMedicalCenter != null && (
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
                                        <Card style={{borderBottomColor: 'gray', borderWidth: 1}}>
                                            <CardItem header style={{backgroundColor: '#209b9b'}}>
                                                <Body>
                                                    <Text style={styles.modalTitleText}>
                                                        {this.state.selectedMedicalCenter.Title}
                                                    </Text>
                                                </Body>
                                            </CardItem>
                                            <CardItem header style={{backgroundColor: '#fff'}}>
                                                <Body
                                                    style={{
                                                        minHeight: 50,
                                                        maxHeight: 150,
                                                        flexDirection: 'row-reverse',
                                                    }}>
                                                    <Text
                                                        numberOfLines={2}
                                                        style={[
                                                            styles.modalCancelButtonText,
                                                            {
                                                                color: '#23b9b9',
                                                                fontSize: 10,
                                                                textAlign: 'right',
                                                            },
                                                        ]}>
                                                        {this.state.selectedMedicalCenter.Description}
                                                    </Text>
                                                </Body>
                                            </CardItem>
                                            <CardItem footer style={{backgroundColor: '#fff'}}>
                                                <Body style={{flexDirection: 'row'}}>
                                                    <Button
                                                        style={styles.modalCancelButton}
                                                        onPress={() => {
                                                            this.setState({visible: false});
                                                            this.props.navigation.navigate(
                                                                'MapSearchDoctorScreen',
                                                                {
                                                                    medicalCenter: this.state
                                                                        .selectedMedicalCenter,
                                                                },
                                                            );
                                                        }}>
                                                        <Text style={styles.modalCancelButtonText}>
                                                            جستجوی پزشک
                                                        </Text>
                                                    </Button>
                                                    <Button
                                                        style={styles.modalSuccessButton}
                                                        onPress={() => {
                                                            this.setState({visible: false});
                                                            this.props.navigation.push(
                                                                'DetailsForMedicalCenterScreen',
                                                                {
                                                                    medicalCenter: this.state
                                                                        .selectedMedicalCenter,
                                                                    backRoute: 'HomeScreen',
                                                                },
                                                            );
                                                        }}>
                                                        <Text style={styles.modalSuccessButtonText}>
                                                            اطلاعات بیشتر
                                                        </Text>
                                                    </Button>
                                                </Body>
                                            </CardItem>
                                        </Card>
                                    </View>
                                </Dialog>
                            )}
                            <MyModal
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
                            </MyModal>
                            {/*</View>*/}
                        </Content>
                    )}
                    <Footer style={styles.footer}>
                        <View style={{flex: 1}}/>
                        <Fab
                            active={this.state.active}
                            direction="up"
                            style={{
                                backgroundColor: '#b9282b',
                                borderColor: '#b9282b',
                                borderWidth: 1,
                            }}
                            position="bottomRight"
                            onPress={() => Linking.openURL('tel:1842')}>
                            <Icon type="FontAwesome" name="phone" style={{color: '#fff'}}/>
                        </Fab>
                    </Footer>
                </Container>
            );
        } else {
            return (
                <Container>
                    <Header style={styles.header}>
                        <Left style={{flex: 5}}>
                            <Text style={[styles.headerText, {fontFamily: 'IRANMarker'}]}>
                                نرم افزار سلامت
                            </Text>
                        </Left>
                        <Right style={{flex: 1}}>
                            <Button
                                transparent
                                style={styles.headerMenuIcon}
                                onPress={() => this.props.navigation.openDrawer()}>
                                <Icon
                                    style={styles.headerMenuIcon}
                                    name="menu"
                                    onPress={() => this.props.navigation.openDrawer()}
                                />
                            </Button>
                        </Right>
                    </Header>
                    <Content
                        scrollEnabled={true}
                        style={{flex: 1, backgroundColor: '#fff'}}>
                        {Platform.OS === 'android' && (
                            <StatusBar
                                barStyle={'dark-content'}
                                backgroundColor={'#209b9b'}
                                hidden={false}
                            />
                        )}
                        <MapView
                            userLocationAnnotationTitle={'موقعیت من'}
                            showsMyLocationButton={true}
                            loadingEnabled={true}
                            loadingIndicatorColor={'#23b9b9'}
                            showsUserLocation={true}
                            minZoomLevel={0}
                            style={{
                                width: Dimensions.get('window').width,
                                height: Dimensions.get('window').height,
                            }}
                            initialRegion={{
                                latitude: 35.715559,
                                longitude: 51.425621,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}>
                            {this.state.medicalCenters.map((value, index) => (
                                <View>
                                    {value.CenterDefinitionId ==
                                    MunicipalityMedicalCenterDefinitionId &&
                                    value.IsActiveForReservation ? (
                                            <Marker
                                                title={value.Title}
                                                onCalloutPress={() =>
                                                    this.setState({selectedMedicalCenter: value}, () => {
                                                        this.setState({visible: true});
                                                    })
                                                }
                                                coordinate={{
                                                    latitude: this.getLatLong(value.Location, 'latitude'),
                                                    longitude: this.getLatLong(value.Location, 'longitude'),
                                                }}>
                                                <Icon
                                                    type={'FontAwesome5'}
                                                    name={'map-marker-alt'}
                                                    style={{color: '#23b9b9', fontSize: 45}}
                                                />
                                            </Marker>
                                        ) :
                                        null}
                                </View>
                            ))}
                        </MapView>

                        {this.state.selectedMedicalCenter != null && (
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
                                    <Card style={{borderBottomColor: 'gray', borderWidth: 1}}>
                                        <CardItem header style={{backgroundColor: '#209b9b'}}>
                                            <Body>
                                                <Text style={styles.modalTitleText}>
                                                    {this.state.selectedMedicalCenter.Title}
                                                </Text>
                                            </Body>
                                        </CardItem>
                                        <CardItem header style={{backgroundColor: '#fff'}}>
                                            <Body
                                                style={{
                                                    minHeight: 50,
                                                    maxHeight: 150,
                                                    flexDirection: 'row-reverse',
                                                }}>
                                                <Text
                                                    numberOfLines={2}
                                                    style={[
                                                        styles.modalCancelButtonText,
                                                        {
                                                            color: '#23b9b9',
                                                            fontSize: 10,
                                                            textAlign: 'right',
                                                        },
                                                    ]}>
                                                    {this.state.selectedMedicalCenter.Description}
                                                </Text>
                                            </Body>
                                        </CardItem>
                                        <CardItem footer style={{backgroundColor: '#fff'}}>
                                            <Body style={{flexDirection: 'row'}}>
                                                <Button
                                                    style={styles.modalCancelButton}
                                                    onPress={() => {
                                                        this.setState({visible: false});
                                                        this.props.navigation.navigate(
                                                            'MapSearchDoctorScreen',
                                                            {
                                                                medicalCenter: this.state.selectedMedicalCenter,
                                                            },
                                                        );
                                                    }}>
                                                    <Text style={styles.modalCancelButtonText}>
                                                        جستجوی پزشک
                                                    </Text>
                                                </Button>
                                                <Button
                                                    style={styles.modalSuccessButton}
                                                    onPress={() => {
                                                        this.setState({visible: false});
                                                        this.props.navigation.push(
                                                            'DetailsForMedicalCenterScreen',
                                                            {
                                                                medicalCenter: this.state.selectedMedicalCenter,
                                                                backRoute: 'HomeScreen',
                                                            },
                                                        );
                                                    }}>
                                                    <Text style={styles.modalSuccessButtonText}>
                                                        اطلاعات بیشتر
                                                    </Text>
                                                </Button>
                                            </Body>
                                        </CardItem>
                                    </Card>
                                </View>
                            </Dialog>
                        )}

                        <MyModal
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
                        </MyModal>
                        {/*</View>*/}
                    </Content>
                    <Footer style={styles.footer}>
                        <View style={{flex: 1}}/>
                        <Fab
                            active={this.state.active}
                            direction="up"
                            style={{
                                backgroundColor: '#b9282b',
                                borderColor: '#b9282b',
                                borderWidth: 1,
                            }}
                            position="bottomRight"
                            onPress={() => Linking.openURL('tel:1842')}>
                            <Icon type="FontAwesome" name="phone" style={{color: '#fff'}}/>
                        </Fab>
                    </Footer>
                </Container>
            );
        }
    }
}

HomeScreen.navigationOptions = {
    header: null,

    title: 'نرم افزار سلامت',
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
        width: '100%',
        height: '100%',
    },
    headerMenuIcon: {
        padding: 1,
        fontSize: 30,
        color: '#fff',
    },
    headerText: {
        padding: 5,
        fontSize: 18,
        color: '#fff',
        fontFamily: 'IRANMarker',
    },
    header: {
        backgroundColor: '#23b9b9',
    },
    footer: {
        backgroundColor: '#23b9b9',
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
    headerSettingIcon: {
        alignSelf: 'center',
        padding: 1,
        fontSize: 20,
        marginBottom: 5,
        color: '#fff',
    },
    settingCardBodyStyle: {
        flexDirection: 'row-reverse',
        flex: 7,
        padding: 2,
    },
    settingCardRightStyle: {
        backgroundColor: 'red',
        flex: 1,
        padding: 1,
        justifyContent: 'center',
    },
    activeIconSetting: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 5,
        marginLeft: 2,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
    },
    deActiveIconSetting: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 5,
        marginLeft: 2,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
    },
    settingCardBodyTextStyle: {
        color: '#828282',
        textAlign: 'right',
        fontFamily: 'IRANMarker',
        fontSize: 12,
    },
    cluster: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
