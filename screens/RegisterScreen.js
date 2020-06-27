import React, {Component} from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  TextInput,
  Keyboard,
  Platform,
  BackHandler,
  Alert,
  AsyncStorage,
  ActivityIndicator,
} from 'react-native';
import {PermissionsAndroid} from 'react-native';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
// import DatePicker from 'react-native-jalaali-date-picker';
import DatePicker from '@mohamadkh75/react-native-jalali-datepicker';
import {Dialog} from 'react-native-simple-dialogs';
import ImagePicker from 'react-native-image-picker';
// let moment = require('moment');
var moment = require('moment-jalaali');
var resize = require('resize-base64');
import {
  Container,
  Header,
  Thumbnail,
  Content,
  CardItem,
  Textarea,
  Button,
  Footer,
  Right,
  Tabs,
  Icon,
  Title,
  Card,
  Tab,
  Root,
  Toast,
  Body,
} from 'native-base';
import Modal, {
  ModalButton,
  ModalContent,
  ModalFooter,
  ModalTitle,
  SlideAnimation,
} from 'react-native-modals';
import awaitAsyncGenerator from '@babel/runtime/helpers/esm/awaitAsyncGenerator';

const options = {
  title: '',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
  maxWidth: 160,
  maxHeight: 160,
};

const REGISTER = '/api/Register';
const AUTHENTICATE = '/Api/Authenticate';

export default class ReserveScreen extends Component {
  constructor(props) {
    super(props);
    if (Platform.OS === 'android') {
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }
    this.state = {
      imageObject: null,
      progressModalVisible: false,
      token: null,
      baseUrl: null,
      patientUsername: '',
      nationalCode: '',
      cellPhone: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: '',
      description: '',
      address: '',
      zipCode: '',
      patientPassword: '',
      file: null,
      fileName: null,
      selectedStartDate: null,
      red: '#db1c09',
      green: '#00b452',
      phoneNumberValidation: null,
      phoneNumberBackgroundColor: 'rgba(255,255,255,0)',
      minDate: new Date(),
      startDateModalVisible: false,
      imageFromDevice: null,
      radioProps: [{label: 'مرد', value: 11}, {label: 'زن', value: 12}],
    };
    this.onStartDateChange = this.onStartDateChange.bind(this);
  }

  goToHomeScreen = async body => {
    console.log('National Code Body : ' + JSON.stringify(body));
    const baseUrl = this.state.baseUrl;
    await fetch(baseUrl + AUTHENTICATE, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(body),
    })
      .then(async response => response.json())
      .then(async responseData => {
        console.log(JSON.stringify(responseData));
        if (responseData['StatusCode'] === 200) {
          if (responseData['Data'] != null) {
            try {
              let data = responseData['Data'];
              let token = data['token'];
              let userInfo = data['userinfo'];
              await AsyncStorage.setItem('token', token);
              await AsyncStorage.setItem('nationalCode', body.nationalCode);
              await AsyncStorage.setItem('username', body.username);
              console.log(
                'token : ' +
                  token +
                  '\n' +
                  'username : ' +
                  body.username +
                  '\n' +
                  'nationalCode : ' +
                  body.nationalCode,
              );
              this.setState({progressModalVisible: false}, () => {
                console.log('inserted');
                this.props.navigation.navigate('HomeScreen', {
                  user: {userInfo},
                  baseUrl: baseUrl,
                  imageObject: this.state.imageObject,
                });
              });
            } catch (e) {
              // alert(e)
              console.error(e);
            }
          }
        } else if (responseData['StatusCode'] === 600) {
          this.setState({progressModalVisible: false}, () => {
            // alert('کاربر یافت نشد')
            this.props.navigation.navigate('RegisterScreen', {
              imageObject: this.state.imageObject,
            });
          });
        } else if (responseData['StatusCode'] === 601) {
          this.setState({progressModalVisible: false}, () => {
            alert('کد ملی وارد شده معتبر نمی باشد');
          });
        } else if (
          responseData['StatusCode'] >= 501 &&
          responseData['StatusCode'] <= 600
        ) {
          alert(responseData['Data']);
        } else if (responseData['StatusCode'] === 400) {
          this.setState({progressModalVisible: false}, () => {
            alert('خطا در اتصال به سرویس');
            // alert(JSON.stringify(responseData));
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  async registerUser(body) {
    this.setState({progressModalVisible: true}, async () => {
      await fetch(this.state.baseUrl + REGISTER, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + new String(this.state.token),
        },
        body: JSON.stringify(body),
      })
        .then(async response => response.json())
        .then(async responseData => {
          if (responseData['StatusCode'] === 200) {
            if (responseData['Data'] != null) {
              let data = responseData['Data'];
              await this.setState({progressModalVisible: false}, async () => {
                // await this.setState({data: data})
                await this.goToHomeScreen(data);
              });
            }
          } else if (responseData['StatusCode'] === 601) {
            await this.setState({progressModalVisible: false}, () => {
              alert('کد ملی وارد شده معتبر نمیباشد');
            });
          } else if (responseData['StatusCode'] === 602) {
            await this.setState({progressModalVisible: false}, () => {
              alert('کد ملی وارد شده قبلا در سیستم ثبت شده است');
            });
          } else if (
            responseData['StatusCode'] >= 501 &&
            responseData['StatusCode'] <= 600
          ) {
            await this.setState({progressModalVisible: false});
            alert(responseData['Data']);
          } else {
            await this.setState({progressModalVisible: false}, () => {
              alert(JSON.stringify('خطا در دسترسی به سرویس'));
              console.log(JSON.stringify(responseData));
            });
          }
        })
        .catch(error => {
          console.error(error);
          // alert(error)
        });
    });
  }

  async componentWillMount(): void {
    let image = this.props.navigation.getParam('imageObject');
    let nationalCode = this.props.navigation.getParam('nationalCode');
    let phoneNumber = this.props.navigation.getParam('phoneNumber');
    this.phoneNumberValidation(phoneNumber);
    this.setState({
      imageObject: image,
      nationalCode: nationalCode,
      cellPhone: phoneNumber,
    });
    if (Platform.OS === 'android') {
      BackHandler.addEventListener(
        'hardwareBackPress',
        this.handleBackButtonClick,
      );
    }
    const token = await AsyncStorage.getItem('token');
    const baseUrl = await AsyncStorage.getItem('baseUrl');

    this.setState({baseUrl: baseUrl, token: token});
  }

  handleBackButtonClick() {
    // alert('pressed')

    console.log(JSON.stringify(this.props.navigation.state));

    if (this.props.navigation.state.isDrawerOpen) {
      this.props.navigation.closeDrawer();
    } else {
      if (!this.state.progressModalVisible) {
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
    }
    return true;
  }

  onStartDateChange(date) {
    this.setState({selectedStartDate: date});
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

  // myCheckPermissions() {
  //     if (Platform.OS === 'android') {
  //         if (PermissionsAndroid.check(PermissionsAndroid.RESULTS.CAMERA) &&
  //             PermissionsAndroid.check(PermissionsAndroid.RESULTS.READ_EXTERNAL_STORAGE) &&
  //             PermissionsAndroid.check(PermissionsAndroid.RESULTS.WRITE_EXTERNAL_STORAGE)) {
  //             return true;
  //         } else {
  //             return false;
  //         }
  //     } else {
  //         return false;
  //     }
  // }

  phoneNumberValidation(value) {
    const regex = RegExp('^(\\+98|0)?9\\d{9}$');
    let phone = new String(value);
    let status = regex.test(phone);
    if (status) {
      this.setState({
        phoneNumberValidation: true,
        phoneNumberBackgroundColor: this.state.green,
      });
      return status;
    } else {
      this.setState({
        phoneNumberValidation: false,
        phoneNumberBackgroundColor: this.state.red,
      });
      return status;
    }
  }

  showToast() {
    Toast.show({
      text: 'برای انتخاب عکس پروفایل تصویر دوربین را لمس کنید ',
      textStyle: {
        fontFamily: 'IRANMarker',
        fontSize: 10,
      },
      duration: 4000,
      type: 'warning',
    });
  }

  async componentDidMount(): void {
    if (Platform.OS === 'android') {
      const cameraPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: '',
          message: 'Allow Salamat to Access your Camera',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      // if (cameraPermission === PermissionsAndroid.RESULTS.GRANTED) {
      //     console.log('You can use the camera');
      //     console.log('You can use the camera');
      // } else {
      //     console.log('Camera permission denied');
      // }
      const storagePermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: '',
          message: 'Allow Salamat to Access your Storage',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
    }
  }

  catch(err) {
    console.warn(err);
  }

  render() {
    return (
      <Root>
        <Container>
          <Header style={{backgroundColor: '#23b9b9'}}>
            <Right>
              <Text style={styles.headerText}>ثبت نام</Text>
            </Right>
          </Header>
          <Content padder style={styles.content}>
            {Platform.OS === 'android' && (
              <StatusBar
                barStyle={'dark-content'}
                backgroundColor={'#209b9b'}
                hidden={true}
              />
            )}
            <View style={styles.body}>
              <View style={styles.card}>
                <Card
                  style={{
                    backgroundColor: 'rgba(234,234,234,0.21)',
                    borderWidth: 1,
                    borderBottomColor: '#1a8787',
                  }}>
                  <CardItem
                    bordered
                    style={[
                      styles.row,
                      {
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignContent: 'center',
                        backgroundColor: '#23b9b9',
                        borderBottomColor: '#fff',
                        borderBottomWidth: 1,
                      },
                    ]}>
                    {this.state.imageFromDevice != null ? (
                      // <Thumbnail large source={{uri: this.state.imageFromDevice}}/> :
                      <Button
                        transparent
                        bordered
                        onPress={() => this.showImagePicker()}
                        large
                        style={{
                          backgroundColor: 'rgba(255,255,255,0)',
                          borderWidth: 0,
                          borderColor: 'rgba(255,255,255,0)',
                        }}
                        source={{uri: this.state.imageFromDevice}}>
                        <Thumbnail
                          large
                          source={{uri: this.state.imageFromDevice}}
                        />
                      </Button>
                    ) : (
                      <Button
                        style={{
                          backgroundColor: 'rgb(169,169,169)',
                          width: 75,
                          height: 75,
                          padding: 5,
                          borderRadius: 75 / 2,
                          justifyContent: 'center',
                        }}
                        onPress={async () => {
                          this.showImagePicker();
                        }}>
                        <Icon
                          name={'camera'}
                          type={'FontAwesome5'}
                          color={'#949494'}
                        />
                      </Button>
                    )}
                  </CardItem>
                  <CardItem style={styles.row}>
                    <Text style={styles.label}>نام</Text>
                    <TextInput
                      value={this.state.firstName}
                      onChangeText={text => this.setState({firstName: text})}
                      style={[styles.textInput]}
                      multiline={false}
                    />
                  </CardItem>
                  <CardItem style={styles.row}>
                    <Text style={styles.label}>نام خانوادگی</Text>
                    <TextInput
                      value={this.state.lastName}
                      onChangeText={text => this.setState({lastName: text})}
                      style={[styles.textInput]}
                      multiline={false}
                    />
                  </CardItem>
                  <CardItem style={styles.row}>
                    <Text style={styles.label}>کد ملی</Text>
                    <TextInput
                      keyboardType={'numeric'}
                      value={this.state.nationalCode}
                      onChangeText={text => this.setState({nationalCode: text})}
                      style={[styles.textInput]}
                      multiline={false}
                    />
                  </CardItem>

                  <CardItem style={styles.row}>
                    <Text style={styles.label}>کد پستی</Text>
                    <TextInput
                      keyboardType={'numeric'}
                      value={this.state.zipCode}
                      onChangeText={text => this.setState({zipCode: text})}
                      style={[styles.textInput]}
                      multiline={false}
                    />
                  </CardItem>

                  {false && (
                    <CardItem style={styles.row}>
                      <Text style={styles.label}>نام کاربری</Text>
                      <TextInput
                        value={this.state.patientUsername}
                        onChangeText={text =>
                          this.setState({patientUsername: text})
                        }
                        style={[styles.textInput]}
                        multiline={false}
                      />
                    </CardItem>
                  )}
                  {false && (
                    <CardItem style={styles.row}>
                      <Text style={styles.label}>رمز عبور</Text>
                      <TextInput
                        secureTextEntry={true}
                        value={this.state.patientPassword}
                        onChangeText={text =>
                          this.setState({patientPassword: text})
                        }
                        style={[styles.textInput]}
                        multiline={false}
                      />
                    </CardItem>
                  )}
                  <CardItem style={styles.row}>
                    <Text style={styles.label}>موبایل</Text>
                    <TextInput
                      keyboardType={'numeric'}
                      value={this.state.cellPhone}
                      onChangeText={text =>
                        this.setState({cellPhone: text}, () => {
                          this.phoneNumberValidation(text);
                        })
                      }
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: this.state
                            .phoneNumberBackgroundColor,
                          color: '#fff',
                        },
                      ]}
                      multiline={false}
                    />
                  </CardItem>
                  <CardItem style={[styles.row]}>
                    <Text style={[styles.label, {}]}>تاریخ تولد</Text>
                    <Button
                      bordered
                      onPress={async () => {
                        Keyboard.dismiss();
                        await this.setState({startDateModalVisible: true});
                      }}
                      style={{
                        textAlign: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 2,
                        flex: 2,
                        borderWidth: 0,
                        backgroundColor: 'rgba(255,255,255,0)',
                        borderColor: 'rgba(255,255,255,0)',
                      }}>
                      <Text style={styles.birthDate}>
                        {this.state.selectedStartDate == null
                          ? 'انتخاب تاریخ'
                          : this.state.selectedStartDate}
                        {/* {this.state.selectedStartDate == null
                          ? 'انتخاب تاریخ'
                          : this.state.selectedStartDate.format('jYYYY-jM-jD')} */}
                      </Text>
                    </Button>
                  </CardItem>
                  <CardItem style={styles.row}>
                    <Text style={styles.label}>جنسیت</Text>
                    <RadioForm
                      style={{
                        margin: 2,
                        padding: 2,
                      }}
                      selectedButtonColor={'#1f9292'}
                      radio_props={this.state.radioProps}
                      initial={11}
                      formHorizontal={true}
                      labelHorizontal={true}
                      buttonColor={'#23b9b9'}
                      animation={true}
                      labelStyle={styles.radioLabel}
                      onPress={value => {
                        this.setState({gender: value});
                      }}
                    />
                  </CardItem>
                  <CardItem style={styles.row}>
                    <Textarea
                      value={this.state.address}
                      onChangeText={text => this.setState({address: text})}
                      style={styles.textArea}
                      rowSpan={3}
                      bordered
                      placeholder="آدرس"
                    />
                    {/*<Text style={styles.label}>توضیحات</Text>*/}
                    {/*<TextInput*/}
                    {/*    value={this.state.description}*/}
                    {/*    onChangeText={(text) => this.setState({description: text})}*/}
                    {/*    style={[styles.textInput]}*/}
                    {/*    multiline={false}*/}
                    {/*/>*/}
                  </CardItem>
                  <CardItem style={styles.row}>
                    <Textarea
                      value={this.state.description}
                      onChangeText={text => this.setState({description: text})}
                      style={styles.textArea}
                      rowSpan={3}
                      bordered
                      placeholder="توضیحات"
                    />
                    {/*<Text style={styles.label}>آدرس</Text>*/}
                    {/*<TextInput*/}
                    {/*    value={this.state.address}*/}
                    {/*    onChangeText={(text) => this.setState({address: text})}*/}
                    {/*    style={[styles.textInput]}*/}
                    {/*    multiline={false}*/}
                    {/*/>*/}
                  </CardItem>
                </Card>

                <Dialog
                  contentStyle={{backgroundColor: 'transparent'}}
                  dialogStyle={{
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    borderWidth: 0,
                    elevation: 0,
                  }}
                  animationType={'fade'}
                  visible={this.state.startDateModalVisible}
                  onTouchOutside={() =>
                    this.setState({startDateModalVisible: false})
                  }>
                  <View>
                    {false && (
                      <DatePicker
                        defDateString={
                          this.state.selectedStartDate != null
                            ? this.state.selectedStartDate
                            : moment([1950, 2, 21])
                        }
                        refDate={moment([1951, 3, 21])}
                        style={{marginTop: 5}}
                        btnUnderlayColor={'#23b9b9'}
                        TitleDateStyle={{backgroundColor: '#23b9b9'}}
                        onChangeDate={date => {
                          this.setState({
                            selectedStartDate: date,
                            birthDate: date,
                          });
                        }}
                      />
                    )}
                    <DatePicker
                      style={{
                        width: wp('95%'),
                        height: hp('80%'),
                        alignSelf: 'center',
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: '#209b9b',
                        borderRadius: 10,
                        elevation: 4,
                      }}
                      selected="1399/1/18"
                      // selected={() => this.state.selectedStartDate != null ?  this.state.selectedStartDate :  "1399/1/18" }
                      dateSeparator="/"
                      minDate="1300/1/18"
                      maxDate="1400/1/18"
                      headerContainerStyle={{height: '15%'}}
                      yearMonthBoxStyle={{
                        width: '30%',
                        height: '75%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderRadius: 10,
                      }}
                      yearMonthTextStyle={{
                        fontSize: 18,
                        color: '#209b9b',
                        fontFamily: 'IRANMarker',
                      }}
                      iconContainerStyle={{width: `${100 / 7}%`}}
                      backIconStyle={{
                        width: 20,
                        height: 20,
                        resizeMode: 'center',
                        tintColor: '#808e9b',
                      }}
                      nextIconStyle={{
                        width: 20,
                        height: 20,
                        resizeMode: 'center',
                        tintColor: '#209b9b',
                      }}
                      eachYearStyle={{
                        width: 110,
                        height: 82,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#209b9b',
                        marginTop: '1.5%',
                        marginBottom: 5,
                        marginHorizontal: '1.5%',
                        borderRadius: 10,
                        elevation: 3,
                      }}
                      eachYearTextStyle={{
                        fontSize: 13,
                        color: 'white',
                        fontFamily: 'IRANMarker',
                      }}
                      eachMonthStyle={{
                        width: `${88 / 3}%`,
                        height: `${88 / 4}%`,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#209b9b',
                        marginBottom: '3%',
                        borderRadius: 10,
                        elevation: 3,
                      }}
                      eachMonthTextStyle={{
                        fontSize: 13,
                        color: 'white',
                        fontFamily: 'IRANMarker',
                      }}
                      weekdaysContainerStyle={{height: '10%'}}
                      weekdayStyle={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      weekdayTextStyle={{
                        fontSize: 13,
                        fontFamily: 'IRANMarker',
                        color: '#808e9b',
                        marginBottom: 5,
                      }}
                      borderColor="#209b9b"
                      dayStyle={{
                        width: `${100 / 7}%`,
                        justifyContent: 'center',
                        alignItems: 'center',
                        aspectRatio: 1 / 1,
                      }}
                      selectedDayStyle={{
                        width: '70%',
                        aspectRatio: 1 / 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 100,
                      }}
                      selectedDayColor="#209b9b"
                      dayTextStyle={{fontSize: 15, fontFamily: 'IRANMarker'}}
                      selectedDayTextColor="white"
                      dayTextColor="#209b9b"
                      disabledTextColor="#209b9b"
                      // onDateChange={date => console.warn(date)}
                      onDateChange={date =>
                        this.setState({
                          selectedStartDate: date,
                          birthDate: date,
                        })
                      }
                    />
                    <CardItem style={{backgroundColor: 'transparent'}}>
                      <Body
                        style={{
                          flexDirection: 'row',
                          backgroundColor: 'transparent',
                          flexWrap: 'nowrap',
                          justifyContent: 'center',
                        }}>
                        <Button
                          style={styles.modalCancelButton}
                          onPress={() => {
                            this.setState({startDateModalVisible: false});
                          }}>
                          <Text style={styles.modalCancelButtonText}>
                            انصراف
                          </Text>
                        </Button>
                        <Button
                          style={styles.modalSuccessButton}
                          onPress={() => {
                            this.setState({startDateModalVisible: false});
                          }}>
                          <Text style={styles.modalSuccessButtonText}>
                            انتخاب
                          </Text>
                        </Button>
                      </Body>
                    </CardItem>
                  </View>
                </Dialog>

                <Modal
                  style={{opacity: 0.9}}
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
              </View>
            </View>
          </Content>
          <Footer style={styles.footer}>
            <Button
              style={styles.button}
              onPress={() => {
                if (
                  //this.state.patientUsername === '' ||
                  this.state.nationalCode === '' ||
                  this.state.cellPhone === '' ||
                  this.state.firstName === '' ||
                  this.state.lastName === '' ||
                  this.state.birthDate === '' ||
                  this.state.gender === '' ||
                  //this.state.patientPassword === '' ||
                  this.state.selectedStartDate === null ||
                  this.state.file == null ||
                  this.state.fileName == null
                ) {
                  if (this.state.nationalCode === '') {
                    alert('لطفا کد ملی خود را وارد کنید');
                  } else if (this.state.cellPhone === '') {
                    alert('لطفا شماره موبایل خود را وارد کنید');
                  } else if (this.state.firstName === '') {
                    alert('لطفا نام خود را وارد کنید');
                  } else if (this.state.lastName === '') {
                    alert('لطفا نام خانوادگی خود را وارد کنید');
                  } else if (this.state.birthDate === '') {
                    alert('لطفا تاریخ تولد خود را وارد کنید');
                  } else if (this.state.gender === '') {
                    alert('لطفا جنسیت خود را وارد کنید');
                  } else if (
                    this.state.file === '' ||
                    this.state.fileName == null
                  ) {
                    Alert.alert(
                      '',
                      'لطفا عکس پروفایل خود را انتخاب کنید',
                      [
                        {
                          text: 'باشه',
                          onPress: () => this.showToast(),
                          style: 'cancel',
                        },
                      ],
                      {cancelable: false},
                    );
                    // alert('لطفا عکس پروفایل خود را انتخاب کنید');
                    // this.showToast();
                  }
                } else {
                  if (!this.phoneNumberValidation(this.state.cellPhone)) {
                    alert('شماره موبایل وارد شده معتبر نیست');
                  } else {
                    //myString.replace(/\D/g,'');
                    let date = moment(
                      this.state.selectedStartDate,
                      'jYYYY/jM/jD',
                    );
                    let body = {
                      fileName: this.state.fileName,
                      file: this.state.file,
                      patientUsername: this.state.cellPhone,
                      nationalCode: this.state.nationalCode,
                      cellPhone: this.state.cellPhone,
                      firstName: this.state.firstName,
                      lastName: this.state.lastName,
                      // birthDate: this.state.selectedStartDate.format("YYYY/MM/DD"),
                      birthDate: date.format('YYYY-M-D'),
                      gender: this.state.gender,
                      description: this.state.description,
                      address: this.state.address,
                      zipCode: this.state.zipCode,
                    };
                    console.log(JSON.stringify(body));
                    this.registerUser(body);
                  }
                }
              }}>
              <Text
                style={[
                  {color: '#fff', fontSize: 15, fontFamily: 'IRANMarker'},
                ]}>
                ثبت نام
              </Text>
            </Button>
          </Footer>
        </Container>
      </Root>
    );
  }
}

ReserveScreen.navigationOptions = {
  header: null,
  title: 'نوبت دهی',
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
    paddingTop: 5,
    paddingBottom: 5,
    color: '#fff',
  },
  headerText: {
    fontSize: 20,
    padding: 5,
    marginTop: 5,
    color: '#fff',
  },
  headerIcon: {
    paddingTop: 5,
    paddingBottom: 5,
    fontSize: 15,
    color: '#fff',
  },
  icons: {
    color: '#fff',
    fontSize: 20,
  },
  tabsText: {
    fontSize: 10,
    color: '#fff',
  },
  viewStyle: {
    flex: 1,
    flexDirection: 'column',
  },
  row: {
    backgroundColor: 'rgba(255,255,255,0)',
    width: '100%',
    flex: 1,
    marginBottom: 5,
    alignSelf: 'center',
    flexDirection: 'row-reverse',
  },
  textInput: {
    fontFamily: 'IRANMarker',
    textAlign: 'center',
    flex: 2,
    fontSize: 13,
    padding: 3,
    margin: 2,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 3,
    // borderColor: '#eeeeee',
    // borderWidth: 1,
    color: '#23b9b9',
    borderWidth: 1,
    borderColor: '#23b9b9',
  },
  label: {
    color: '#000',
    fontFamily: 'IRANMarker',
    padding: 1,
    flex: 1,
    margin: 1,
    fontSize: 15,
    textAlign: 'right',
  },
  modalTitle: {
    backgroundColor: '#23b9b9',
  },
  modalTitleText: {
    color: '#fff',
  },
  modalFooter: {
    padding: 2,
    backgroundColor: 'rgba(47,246,246,0.06)',
  },
  modalCancelButton: {
    backgroundColor: '#fff',
    borderRadius: 3,
    borderColor: '#23b9b9',
    borderWidth: 1,
    padding: 2,
    margin: 5,
    width: 100,
    maxWidth: 105,
    justifyContent: 'center',
  },
  modalSuccessButton: {
    backgroundColor: '#23b9b9',
    borderRadius: 3,
    padding: 2,
    margin: 5,
    alignSelf: 'flex-start',
    width: 100,
    maxWidth: 105,
    justifyContent: 'center',
  },
  modalSuccessButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalCancelButtonText: {
    color: '#23b9b9',
    fontSize: 15,
  },
  dateModalContent: {
    backgroundColor: 'rgba(47,246,246,0.06)',
  },
  modalContent: {
    marginTop: 5,
    padding: 2,
    alignContent: 'center',
    backgroundColor: 'rgba(47,246,246,0.06)',
  },
  footer: {
    backgroundColor: '#fff',
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
  birthDate: {
    fontFamily: 'IRANMarker',
    padding: 1,
    textAlign: 'center',
    borderRadius: 2,
    flex: 1,
    fontSize: 13,
    color: '#23b9b9',
    borderWidth: 1,
    borderColor: '#23b9b9',
  },
  radioLabel: {
    marginRight: 5,
    fontFamily: 'IRANMarker',
  },
  textArea: {
    fontFamily: 'IRANMarker',
    padding: 5,
    margin: 2,
    flex: 1,
    textAlign: 'right',
  },
});
