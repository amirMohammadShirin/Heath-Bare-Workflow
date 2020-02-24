import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage'
import {
    StyleSheet,
    View,
    Linking,
    StatusBar,
    Platform,
    ActivityIndicator,
    Dimensions,
    NativeModules,
    PermissionsAndroid, BackHandler, Alert
} from 'react-native';
import {Container, Header, Footer, Fab, Button, Left, Right, Icon, Text, Input, Content, Item} from 'native-base';

// import * as Permissions from 'expo-permissions'
// import * as Location from 'expo-location';
// import Constants from 'expo-constants'
// import {WebView} from 'react-native-webview';
// import * as IntentLauncher from 'expo-intent-launcher';
import Modal, {ModalButton, ModalContent, ModalFooter, ModalTitle, SlideAnimation} from "react-native-modals";
import MapView from 'react-native-maps';
import {Marker} from 'react-native-maps'
// import * as Font from 'expo-font';

let utmObj = require('utm-latlng');
let convertor = new utmObj();
// import DeviceInfo from 'react-native-device-info'
//
// const map = '<!DOCTYPE html>\n' +
//     '<html lang="en">\n' +
//     '<head>\n' +
//     '    <meta charset="UTF-8">\n' +
//     '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
//     '    <meta name="viewport" content="height=device-height, initial-scale=1.0">\n' +
//     '    <title>map</title>\n' +
//     '</head>\n' +
//     '<body>\n' +
//     '<div style="flex-direction: row;flex: 1;justify-content: center;align-content: center">\n' +
//     '    <div id="mapId" style="width: 96.5%;height: 96.5%;position: absolute">\n' +
//     '\n' +
//     '    </div>\n' +
//     '\n' +
//     '</div>\n' +
//     '</body>\n' +
//     '\n' +
//     '<script src="http://tmap.tehran.ir/app/pub/index.php/application/api/key/47b38134190e432ea74623de53f91c34"></script>\n' +
//     '<script>\n' +
//     '    var map = null;\n' +
//     '    var marker;\n' +
//     '\n' +
//     '\n' +
//     '\n' +
//     '\n' +
//     '\n' +
//     '    function LoadMap(panelId) {\n' +
//     '        map = new MPS.Map(panelId, {controls: [\'Navigation\',\'ZoomBar\',\'ScaleLine\',\'Navigator\'], zoom: 1});\n' +
//     '        marker = null;\n' +
//     '        map.setCenter(new MPS.LonLat(35.637911, 51.390477), 3);\n' +
//     '        var size = new MPS.Size(34, 34);\n' +
//     '        var offset = new MPS.Pixel(-size.w / 2,(-size.h));\n' +
//     '        var icon = new\n' +
//     '        MPS.Icon(\'https://i.dlpng.com/static/png/1465417-download-this-image-as-map-marker-png-600_498_preview.png\',\n' +
//     '            size, offset);\n' +
//     '        var marker = new MPS.Marker(new MPS.LonLat(35.637911, 51.390477), icon);\n' +
//     '        map.addMarker(marker);\n' +
//     '\n' +
//     '    }\n' +
//     '\n' +
//     '    LoadMap(\'mapId\');\n' +
//     '\n' +
//     '\n' +
//     '</script>\n\n' +
//     '\n' +
//     '\n' +
//     '</html>';
// const javascript = '<script src="http://tmap.tehran.ir/app/pub/index.php/application/api/key/47b38134190e432ea74623de53f91c34"></script>\n' +
//     '<script>\n' +
//     '    var map = null;\n' +
//     '    var marker;\n' +
//     '\n' +
//     '\n' +
//     '\n' +
//     '\n' +
//     '\n' +
//     '    function LoadMap(panelId) {\n' +
//     '        map = new MPS.Map(panelId, {controls: [\'Navigation\',\'ZoomBar\',\'ScaleLine\',\'Navigator\'], zoom: 1});\n' +
//     '        marker = null;\n' +
//     '        map.setCenter(new MPS.LonLat(35.637911, 51.390477), 3);\n' +
//     '        var size = new MPS.Size(34, 34);\n' +
//     '        var offset = new MPS.Pixel(-size.w / 2,(-size.h));\n' +
//     '        var icon = new\n' +
//     '        MPS.Icon(\'https://i.dlpng.com/static/png/1465417-download-this-image-as-map-marker-png-600_498_preview.png\',\n' +
//     '            size, offset);\n' +
//     '        var marker = new MPS.Marker(new MPS.LonLat(35.637911, 51.390477), icon);\n' +
//     '        map.addMarker(marker);\n' +
//     '\n' +
//     '    }\n' +
//     '\n' +
//     '    LoadMap(\'mapId\');\n' +
//     '\n' +
//     '\n' +
//     '</script>\n'

const GETALLLOCATIONS = '/api/GetMedicalCentersLocation';

class MyMarker extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Marker

                coordinate={this.props.coordinate}>
                <Icon type={'FontAwesome5'} name={'map-marker-alt'}
                      style={{color: '#23b9b9', fontSize: 45}}/>
            </Marker>
        );
    }
}


export default class HomeScreen extends Component {


    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        }
        this.state = {
            active: true,
            errorMessage: '',
            user: null,
            baseUrl: null,
            progressModalVisible: false,
            fontLoaded: false,
            visible: false,
            token: null,
            medicalCenters: [],
            selectedMedicalCenter: null
        }

    }

    handleBackButtonClick() {
        // alert('pressed')

        console.log(JSON.stringify(this.props.navigation.state))

        if (this.props.navigation.state.isDrawerOpen) {
            this.props.navigation.closeDrawer()
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

    getLatLong(first, second, isLat) {
        let operator = new utmObj('WGS 84');
        let convert = operator.convertUtmToLatLng(parseFloat(first), parseFloat(second), 'WGS 84', 'WGS 84')
        console.log(JSON.stringify(convert))
        if (isLat) {
            return convert.lat;
        } else {
            return convert.lang;
        }


    }

    async getAllLocations() {
        await this.setState({progressModalVisible: true})
        await fetch(this.state.baseUrl + GETALLLOCATIONS, {
            method: 'GET',

            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',

                'Authorization': 'Bearer ' + new String(this.state.token)
            },

        }).then((response) => response.json())
            .then(async (responseData) => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                       await this.setState({progressModalVisible: false}, async () => {
                            this.setState({medicalCenters: data}, () => {
                                console.log(JSON.stringify(this.state.medicalCenters))
                            })
                        })

                    }
                } else {

                    // alert(JSON.stringify('خطا در دسترسی به سرویس'))
                    alert(JSON.stringify(JSON.stringify(responseData)))

                }
            })
            .catch((error) => {
                console.error(error)
            })
    }

    // openSettings = async () => {
    //     if (Platform.OS === 'ios') {
    //         await Linking.openURL('app-settings:');
    //     } else {
    //         await IntentLauncher.startActivityAsync(
    //             IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS
    //         );
    //     }
    //
    // }

    _getLocationAsync = async () => {
        try {
            let {status} = await Permissions.askAsync(Permissions.LOCATION);
            if (status !== 'granted') {
                this.setState({errorMessage: 'Permission to access location denied'})
            }
            let location = await Location.getCurrentPositionAsync({});
            this.setState({location})
        } catch (error) {
            let status = Location.getProviderStatusAsync();
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

    }

    async componentWillMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        }
        let token = await AsyncStorage.getItem('token');
        let baseUrl = await AsyncStorage.getItem('baseUrl');

        // if (Platform.OS === 'android' && !Constants.isDevice) {
        if (Platform.OS === 'android') {
            this.setState({
                errorMessage: 'try on device'
            })
        } else {
            this._getLocationAsync();
        }
        this.setState(
            {user: this.props.navigation.getParam('user'), baseUrl: baseUrl, token: token}, async () => {
                await this.getAllLocations()
            })
    }


    async componentDidMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        }
        const LocationPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
                title: 'Cool Photo App Camera Permission',
                message:
                    'Cool Photo App needs access to your camera ' +
                    'so you can take awesome pictures.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            }
        )

    }

    componentWillUnmount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        }

    }

    render() {

        return (

            <Container>

                <Header style={styles.header}>

                    {/*<Item style={{backgroundColor: 'rgba(255,255,255,0)', borderWidth: 0, flex: 1}}>*/}
                    {/*    {this.state.fontLoaded &&*/}
                    {/*    <Input*/}
                    {/*        style={{flex: 1, borderWidth: 0, backgroundColor: '#fff', borderRadius: 5}}*/}
                    {/*        placeholder=" جسجوی نام مرکز درمانی"/>}*/}
                    {/*</Item>*/}
                    <Left style={{flex: 5}}>
                        <Text style={[styles.headerText, {fontFamily: 'IRANMarker'}]}>نرم افزار سلامت</Text>
                    </Left>
                    <Right style={{flex: 1}}>
                        <Button transparent style={styles.headerMenuIcon}
                                onPress={() => this.props.navigation.openDrawer()}>
                            <Icon style={styles.headerMenuIcon} name='menu'
                                  onPress={() => this.props.navigation.openDrawer()}/>
                        </Button>
                    </Right>
                </Header>
                <Content scrollEnabled={true} style={{flex: 1, backgroundColor: '#fff'}}>

                    {Platform.OS === 'android' &&
                    <StatusBar barStyle={"dark-content"} backgroundColor={'#209b9b'}
                               hidden={false}/>
                    }

                    {/*<View style={{flex: 1, width: '100%', height: '100%'}}>*/}
                    {/*<WebView*/}
                    {/*    scalesPageToFit={true}*/}
                    {/*    startInLoadingState={true}*/}
                    {/*    javaScriptEnabled={true}*/}
                    {/*    domStorageEnabled={true}*/}
                    {/*    originWhitelist={['*']}*/}
                    {/*    mixedContentMode='always'*/}
                    {/*    scalesPageToFit={true}*/}
                    {/*    // onLoadStart={() => this.setState({progressModalVisible: true})}*/}
                    {/*    onLoadStart={() => this.setState({progressModalVisible: false})}*/}
                    {/*    onLoadEnd={() => this.setState({progressModalVisible: false})}*/}
                    {/*    originWhitelist={['*']}*/}
                    {/*    onLoadProgress={() => this.setState({progressModalVisible: !this.state.progressModalVisible})}*/}
                    {/*    source={{html: map}}*/}
                    {/*    injectedJavaScript={javascript}*/}
                    {/*/>*/}

                    <MapView
                        userLocationAnnotationTitle={"موقعیت من"}
                        showsMyLocationButton={true}
                        loadingEnabled={true}
                        loadingIndicatorColor={'#23b9b9'}
                        showsUserLocation={true}
                        minZoomLevel={0}
                        style={{
                            width: Dimensions.get('window').width,
                            height: Dimensions.get('window').height,
                            // width: '100%',
                            // height: '100%'
                        }}

                        initialRegion={{
                            latitude: 35.715559,
                            longitude: 51.425621,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}>

                        {this.state.medicalCenters.map((value, index) =>
                            <View key={index}>
                                <Marker

                                    title={value.Title}
                                    onCalloutPress={() => this.setState({selectedMedicalCenter: value}, () => {
                                        this.setState({visible: true})
                                    })}
                                    coordinate={{
                                        latitude: parseFloat(value.Latitude),
                                        longitude: parseFloat(value.Longitude),
                                    }}>
                                    <Icon type={'FontAwesome5'} name={'map-marker-alt'}
                                          style={{color: '#23b9b9', fontSize: 45}}/>
                                </Marker>
                            </View>
                        )
                        }

                        {this.state.selectedMedicalCenter != null && <Modal
                            width={300}
                            onTouchOutside={() => {
                                this.setState({visible: false});
                            }}
                            visible={this.state.visible}
                            modalTitle={
                                <ModalTitle style={styles.modalTitle} textStyle={styles.modalTitleText}
                                            title={this.state.selectedMedicalCenter.Title}/>}
                            modalAnimation={new SlideAnimation({
                                slideFrom: 'bottom'
                            })}
                            footer={
                                <ModalFooter style={styles.modalFooter}>
                                    <ModalButton
                                        style={[styles.modalCancelButton]}
                                        textStyle={styles.modalCancelButtonText}
                                        text="جستجوی پزشک"
                                        onPress={async () => {
                                            this.setState({visible: false})
                                            this.props.navigation.navigate('MapSearchDoctorScreen',
                                                {medicalCenter: this.state.selectedMedicalCenter})
                                        }}
                                    />
                                    <ModalButton
                                        style={[styles.modalSuccessButton]}
                                        textStyle={[styles.modalSuccessButtonText]}
                                        text="اطلاعات بیشتر"
                                        onPress={async () => {
                                            await this.setState({visible: false})
                                            this.props.navigation.push('DetailsForMedicalCenterScreen',
                                                {
                                                    medicalCenter: this.state.selectedMedicalCenter,
                                                    backRoute: 'HomeScreen'
                                                })
                                        }
                                        }
                                    />
                                </ModalFooter>
                            }
                        >
                            <ModalContent style={styles.modalContent}>
                                <View>
                                    <Text style={[styles.modalCancelButtonText,
                                        {
                                            color: '#23b9b9',
                                            fontSize: 15,

                                        }]}>{this.state.selectedMedicalCenter.Description != null ?
                                        this.state.selectedMedicalCenter.Description : ''}</Text>
                                </View>
                            </ModalContent>
                        </Modal>}
                    </MapView>


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
                    {/*</View>*/}

                </Content>
                <Footer style={styles.footer}>
                    <View style={{flex: 1}}>
                    </View>
                    <Fab
                        active={this.state.active}
                        direction="up"
                        style={{backgroundColor: '#b9282b', borderColor: '#b9282b', borderWidth: 1}}
                        position="bottomRight"
                        onPress={() => (Linking.openURL('tel:1842'))}>
                        <Icon type='FontAwesome' name="phone" style={{color: '#fff'}}/>
                    </Fab>

                </Footer>
            </Container>
        );
    }

}

HomeScreen.navigationOptions = {
    header: null,

    title: 'نرم افزار سلامت',
    headerStyle: {
        backgroundColor: '#23b9b9'
    },
    headerTitleStyle: {
        color: '#fff',

    },
    headerLeft: null
}

const styles = StyleSheet.create({
    content: {
        width: '100%',
        height: '100%',

    },
    headerMenuIcon: {
        padding: 5,
        fontSize: 30,
        color: '#fff',
    },
    headerText: {
        padding: 5,
        fontSize: 18,
        color: '#fff',
        fontFamily: 'IRANIMarker'

    },
    header: {
        backgroundColor: '#23b9b9'
    },
    footer: {
        backgroundColor: '#23b9b9'
    },
    modalTitle: {
        backgroundColor: '#23b9b9',
    },
    modalTitleText: {
        color: '#fff',
        fontFamily: 'IRANIMarker'

    },
    modalFooter: {
        padding: 2,
        backgroundColor: 'rgba(47,246,246,0.06)'
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 3,
        borderColor: '#23b9b9',
        borderWidth: 1,
        padding: 2,
        margin: 5
    },
    modalSuccessButton: {
        flex: 1,
        backgroundColor: '#23b9b9',
        borderRadius: 3,
        padding: 2,
        margin: 5
    },
    modalSuccessButtonText: {
        color: '#fff',
        fontFamily: 'IRANIMarker',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'right'
    },
    modalCancelButtonText: {
        color: '#23b9b9',
        fontSize: 12,
        textAlign: 'right',
        fontFamily: 'IRANIMarker',
    },
    modalContent: {
        marginTop: 5,
        padding: 2,
        alignContent: 'center',
        backgroundColor: 'rgba(47,246,246,0.06)'
    }
});