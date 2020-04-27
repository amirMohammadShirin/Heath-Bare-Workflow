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
  NativeModules,
  Modal,
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
  Input,
  Content,
  Item,
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
import MapView from 'react-native-maps';
import {Marker} from 'react-native-maps';

const GETALLLOCATIONS = '/api/GetMedicalCentersLocation';

class MyMarker extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Marker coordinate={this.props.coordinate}>
        <Icon
          type={'FontAwesome5'}
          name={'map-marker-alt'}
          style={{color: '#23b9b9', fontSize: 45}}
        />
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
      selectedMedicalCenter: null,
      imageObject: null,
    };
  }

  handleBackButtonClick() {
    // alert('pressed')


    if (this.props.navigation.state.isDrawerOpen == true) {
      this.props.navigation.closeDrawer();
    } else if (this.state.visible == true){
      this.setState({visible:false})
    }else {
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
    this.setState({progressModalVisible: true});
    await fetch(this.state.baseUrl + GETALLLOCATIONS, {
      method: 'GET',

      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',

        Authorization: 'Bearer ' + new String(this.state.token),
      },
    })
      .then(response => response.json())
      .then(async responseData => {
        if (responseData['StatusCode'] === 200) {
          if (responseData['Data'] != null) {
            let data = responseData['Data'];
            this.setState({progressModalVisible: false}, async () => {
              this.setState({medicalCenters: data}, () => {
                console.log(JSON.stringify(this.state.medicalCenters));
              });
            });
          }
        } else if (responseData['StatusCode'] === 400) {
          alert(JSON.stringify('خطا در دسترسی به سرویس'));
          // alert(JSON.stringify(JSON.stringify(responseData)))
        }
      })
      .catch(error => {
        console.error(error);
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
    let image = this.props.navigation.getParam('imageObject');

    if (Platform.OS === 'android') {
      BackHandler.addEventListener(
        'hardwareBackPress',
        this.handleBackButtonClick,
      );
    }
    let token = await AsyncStorage.getItem('token');
    let baseUrl = await AsyncStorage.getItem('baseUrl');

    // if (Platform.OS === 'android' && !Constants.isDevice) {
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
        token: token,
        imageObject: image,
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
        message:
          'Salamat App needs access to your Location ',
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
    const deviceWidth = Dimensions.get('window').width;
    const deviceHeight = Dimensions.get('window').height;

    if (Platform.OS === 'android') {
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
              provider="google"
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
              {this.state.medicalCenters.map((value, index) => (
                <View key={index}>
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
                </View>
              ))}
            </MapView>

            {this.state.selectedMedicalCenter != null && (
              <Dialog
                contentStyle={{backgroundColor: 'transparent'}}
                dialogStyle={{backgroundColor: 'transparent',borderColor:'transparent',borderWidth:0,elevation:0}}
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
                                imageObject: this.state.imageObject,
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
                                imageObject: this.state.imageObject,
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
            <View style={{flex: 1}} />
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
              <Icon type="FontAwesome" name="phone" style={{color: '#fff'}} />
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
                // width: '100%',
                // height: '100%'
              }}
              initialRegion={{
                latitude: 35.715559,
                longitude: 51.425621,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}>
              {this.state.medicalCenters.map((value, index) => (
                <View key={index}>
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
                </View>
              ))}
            </MapView>

            {this.state.selectedMedicalCenter != null && (
              <Dialog
                contentStyle={{backgroundColor: 'transparent'}}
                dialogStyle={{backgroundColor: 'transparent',borderColor:'transparent',borderWidth:0,elevation:0}}
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
                                imageObject: this.state.imageObject,
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
                                imageObject: this.state.imageObject,
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
            <View style={{flex: 1}} />
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
              <Icon type="FontAwesome" name="phone" style={{color: '#fff'}} />
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
    padding: 5,
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
    // justifyContent: 'center',
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
