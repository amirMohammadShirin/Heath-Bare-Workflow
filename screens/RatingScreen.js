import React, {Component} from 'react';
import Modal, {
  ModalButton,
  ModalFooter,
  ModalTitle,
  SlideAnimation,
  ModalContent,
} from 'react-native-modals';
import Autocomplete from 'react-native-autocomplete-input';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Keyboard,
  StatusBar,
  Platform,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {Rating, AirbnbRating} from 'react-native-ratings';
import {
  Container,
  Header,
  Title,
  Content,
  Footer,
  Card,
  CardItem,
  Button,
  Left,
  Item,
  Input,
  Right,
  Body,
  Icon,
  Textarea,
  Form,
  Thumbnail,
  Fab,
} from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';

const GETMEDICALCENTERSNAMEFORRATE = '/api/GetMedicalCentersNameForRate';
const GETDOCTORSFULLNAMEFORRATE = '/api/GetDoctorsFullNameForRate';
export default class RatingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progressModalVisible: false,
      fullName: 'کاربر',
      textAreaValue: '',
      score: 3,
      fontLoaded: false,
      refreshing: false,
      medicalCentersShowData: true,
      doctorsShowData: true,
      doctorQuery: null,
      medicalCenterQuery: null,
      doctorSelected: false,
      medicalCenterSelected: false,
      doctorInputDisable: false,
      doctorData: [],
      medicalCenterData: [],
      reservationId: null,
    };
  }
  filterDoctorData(text) {
    if (text !== null) {
      let mainData = this.state.doctorData;
      let data = [];
      for (var item of mainData) {
        if (item.name.includes(text)) {
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
        if (item.name.includes(text)) {
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

  async componentWillMount() {
    this.setState({progressModalVisible: true});
    let fullName = this.props.navigation.getParam('fullName');
    let reservationId = this.props.navigation.getParam('reservationId');
    let doctorId = this.props.navigation.getParam('doctorId');
    let medicalCenterId = this.props.navigation.getParam('medicalCenterId');
    let doctor = this.props.navigation.getParam('doctor');
    let medicalCenter = this.props.navigation.getParam('medicalCenter');
    const token = await AsyncStorage.getItem('token');
    const baseUrl = await AsyncStorage.getItem('baseUrl');
    if (fullName !== null && typeof fullName !== 'undefined') {
      this.setState({fullName: fullName});
    }
    if (typeof medicalCenterId !== 'undefined' && medicalCenterId != null) {
      this.setState({
        medicalCenterId: medicalCenterId,
      });
    }
    if (typeof doctorId !== 'undefined' && doctorId != null) {
      this.setState({
        doctorId: doctorId,
      });
    }
    if (typeof medicalCenter !== 'undefined' && medicalCenter != null) {
      this.setState({
        medicalCenterQuery: medicalCenter,
        medicalCenterSelected: true,
      });
    }
    if (typeof reservationId !== 'undefined' && reservationId != null) {
      this.setState({
        reservationId: reservationId,
      });
    }
    if (typeof doctor !== 'undefined' && doctor != null) {
      this.setState({doctorQuery: doctor, doctorSelected: true});
    } else {
      this.setState(
        {
          token: token,
          baseUrl: baseUrl,
        },
        () => {
          // this.getMedicalCentersName();
        },
      );
    }
    this.setState({progressModalVisible: false});
  }

  async getDoctorsName() {
    await this.setState({progressModalVisible: true});
    await fetch(this.state.baseUrl + GETDOCTORSFULLNAME, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + new String(this.state.token),
      },
    })
      .then(response => response.json())
      .then(responseData => {
        if (responseData['StatusCode'] === 200) {
          if (responseData['Data'] != null) {
            let data = responseData['Data'];
            this.setState(
              {progressModalVisible: false, doctorData: data},
              () => {
                this.getMedicalCentersName();
              },
            );
          }
        } else {
          this.setState({progressModalVisible: false}, () => {
            alert('خطا در اتصال به سرویس');
          });
        }
      })
      .catch(error => {
        console.error(error);
        // alert(error)
      });
  }

  async getMedicalCentersName() {
    await this.setState({progressModalVisible: true});
    await fetch(this.state.baseUrl + GETMEDICALCENTERSNAMEFORRATE, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + new String(this.state.token),
      },
    })
      .then(response => response.json())
      .then(responseData => {
        if (responseData['StatusCode'] === 200) {
          if (responseData['Data'] != null) {
            let data = responseData['Data'];
            // console.log(data);
            this.setState(
              {progressModalVisible: false, medicalCenterData: data},
              () => {},
            );
          }
        } else {
          this.setState({progressModalVisible: false}, () => {
            alert('خطا در اتصال به سرویس');
          });
        }
      })
      .catch(error => {
        console.error(error);
        // alert(error)
      });
  }

  render() {
    const {doctorQuery} = this.state;
    const doctorData = this.filterDoctorData(doctorQuery);
    const {medicalCenterQuery} = this.state;
    const medicalCenterData = this.filterMedicalCenterData(medicalCenterQuery);
    return (
      <Container>
        <Header style={{backgroundColor: '#23b9b9'}}>
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
            <Text style={styles.headerText}>ثبت نظرات</Text>
          </Right>
        </Header>
        <Content padder scrollEnabled={false}>
          {Platform.OS === 'android' && (
            <StatusBar
              barStyle={'dark-content'}
              backgroundColor={'#209b9b'}
              hidden={false}
            />
          )}

          <Card style={[styles.mainCardStyle]}>
            {/* {this.props.navigation.getParam('medicalCenter') === null && (
              <View style={styles.row}>
                <Autocomplete
                  renderTextInput={() => {
                    return (
                      <TextInput
                        onFocus={() => this.setState({doctorsShowData: false})}
                        onEndEditing={() =>
                          this.setState({medicalCentersShowData: false})
                        }
                        placeholder={'نام مرکز'}
                        placeholderTextColor={'#b7b7b7'}
                        value={medicalCenterQuery}
                        onChangeText={text => {
                          if (text.length === 0) {
                            this.setState({
                              medicalCenterQuery: null,
                              medicalCenterSelected: false,
                              medicalCentersShowData: true,
                            });
                          } else if (
                            this.state.medicalCenterQuery != null &&
                            text.length < this.state.medicalCenterQuery.length
                          ) {
                            if (this.state.medicalCenterSelected) {
                              this.setState({
                                medicalCenterSelected: false,
                                medicalCenterQuery: text,
                              });
                            } else {
                              this.setState({medicalCenterQuery: text});
                            }
                          } else {
                            if (this.state.medicalCentersShowData) {
                              this.setState({medicalCenterQuery: text});
                            } else {
                              this.setState({
                                medicalCenterQuery: text,
                                medicalCentersShowData: true,
                              });
                            }
                          }
                        }}
                        style={styles.autocompleteInputStyle}
                      />
                    );
                  }}
                  hideResults={!this.state.medicalCentersShowData}
                  containerStyle={[
                    styles.autocompleteContainerStyle,
                    {zIndex: 40},
                  ]}
                  listStyle={styles.autocompleteListStyle}
                  listContainerStyle={
                    !this.state.medicalCenterSelected
                      ? styles.autocompleteListContainerStyleSelected
                      : [
                          styles.autocompleteListContainerStyleSelected,
                          // {maxHeight: 0},
                        ]
                  }
                  keyboardShouldPersistTaps={'always'}
                  style={styles.autocompleteInputStyle}
                  data={medicalCenterData}
                  renderItem={({item, i}) => (
                    <TouchableOpacity
                      style={styles.autocompleteResultStyle}
                      onPress={() =>
                        this.setState(
                          {
                            medicalCenterQuery: item.name,
                            medicalCenterSelected: true,
                            medicalCentersShowData: false,
                          },
                          () => {
                            Keyboard.dismiss();
                          },
                        )
                      }>
                      <View style={styles.autocompleteIconViewStyle}>
                        <Icon
                          type="FontAwesome"
                          name="h-square"
                          style={styles.autocompleteIconStyle}
                        />
                      </View>
                      <Text style={styles.autocompleteResultTextStyle}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />

                <Text style={[styles.label, {marginBottom: 8}]}>
                  {' '}
                  مرکز درمانی
                </Text>
              </View>
            )}
            {this.props.navigation.getParam('doctor') === null && (
              <View style={styles.row}>
                <Autocomplete
                  renderTextInput={() => {
                    return (
                      <TextInput
                        onFocus={() =>
                          this.setState({medicalCentersShowData: false})
                        }
                        onEndEditing={() =>
                          this.setState({doctorsShowData: false})
                        }
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
                          } else if (
                            this.state.doctorQuery != null &&
                            text.length < this.state.doctorQuery.length
                          ) {
                            if (this.state.doctorSelected) {
                              this.setState({
                                doctorSelected: false,
                                doctorQuery: text,
                              });
                            } else {
                              this.setState({
                                doctorQuery: text,
                              });
                            }
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
                  containerStyle={[
                    styles.autocompleteContainerStyle,
                    {zIndex: 30},
                  ]}
                  listStyle={styles.autocompleteListStyle}
                  listContainerStyle={
                    !this.state.doctorSelected
                      ? styles.autocompleteListContainerStyleSelected
                      : [styles.autocompleteListContainerStyleSelected]
                  }
                  keyboardShouldPersistTaps={'always'}
                  // style={styles.autocompleteInputStyle}
                  data={doctorData}
                  renderItem={({item, i}) => (
                    <TouchableOpacity
                      style={styles.autocompleteResultStyle}
                      onPress={() =>
                        this.setState(
                          {
                            doctorQuery: item.name,
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
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />

                <Text style={[styles.label, {marginBottom: 8}]}> پزشک</Text>
              </View>
            )} */}
            <Card transparent style={[styles.mainCardStyle]}>
              <CardItem style={styles.headerCardItemStyle}>
                <Right style={{flex: 5, padding: 2}}>
                  <Text style={styles.medicalCenterTextStyle}>
                    {this.state.medicalCenterSelected
                      ? this.state.medicalCenterQuery
                      : null}
                  </Text>
                  <Text style={styles.doctorTextStyle}>
                    {this.state.doctorSelected ? this.state.doctorQuery : null}
                  </Text>
                </Right>
                <Body style={{flex: 2}}>
                  <View style={styles.iconViewStyle}>
                    <Icon
                      type="FontAwesome5"
                      name="check-double"
                      style={styles.iconStyle}
                    />
                  </View>
                </Body>
              </CardItem>
              <CardItem>
                {this.state.medicalCenterSelected &&
                this.state.doctorSelected ? (
                  <Body>
                    <View style={styles.medicalCenterNameBodyStyle}>
                      <Text style={styles.RatingTextStyle}>
                        {this.state.fullName} عزیز به روند پیشروی درخواست خود چه
                        امتیازی می دهید ؟
                      </Text>
                    </View>
                  </Body>
                ) : (
                  <Body>
                    <View style={styles.medicalCenterNameBodyStyle}>
                      <Text style={styles.RatingTextStyle}>
                        {this.state.fullName} عزیز به روند پیشروی درخواست خود چه
                        امتیازی می دهید ؟
                      </Text>
                    </View>
                  </Body>
                )}
              </CardItem>
              <CardItem style={{flexDirection: 'column'}}>
                <AirbnbRating
                  onFinishRating={number => {
                    this.setState({score: number});
                    console.log(this.state.score);
                  }}
                  style={{
                    marginRight: 1,
                    marginLeft: 1,
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                  starContainerStyle={{
                    backgroundColor: '#fff',
                    paddingLeft: 10,
                    paddingRight: 10,
                    borderRadius: 20,
                    borderColor: '#d9d9d9',
                    borderWidth: 1,
                    elevation: 8,
                    shadowColor: '#000',
                  }}
                  count={5}
                  reviews={['بسیار ضعیف', 'ضعیف', 'متوسط', 'خوب', 'عالی']}
                  defaultRating={this.state.score}
                  size={20}
                  selectedColor={'#f1c40f'}
                  reviewColor={
                    this.state.score === 3
                      ? '#209b9b'
                      : this.state.score === 2
                      ? '#d11d1d'
                      : this.state.score === 1
                      ? '#b51b1b'
                      : this.state.score === 4
                      ? '#26c754'
                      : '#21b04a'
                  }
                />
              </CardItem>
              <CardItem>
                <Body>
                  <View style={styles.medicalCenterNameBodyStyle}>
                    <Text style={[styles.RatingTextStyle, {fontSize: 9}]}>
                      در صورت تمایل اطلاعات بیشتری در اختیار ما قرار دهید :
                    </Text>
                  </View>
                </Body>
              </CardItem>
              <CardItem>
                <Form style={{flex: 1}}>
                  <Textarea
                    style={styles.textArea}
                    rowSpan={4}
                    bordered
                    placeholder="نظر شما"
                    placeholderTextColor={'#d9d9d9'}
                    value={this.state.textAreaValue}
                    onChangeText={text => this.setState({textAreaValue: text})}
                  />
                </Form>
              </CardItem>
            </Card>
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
            style={styles.button}
            onPress={() => {
              let body = {
                MedicalCenterId: this.state.medicalCenterId,
                DoctorId: this.state.doctorId,
                Score: this.state.score,
                Description: this.state.textAreaValue,
                ReservationId: this.state.reservationId,
              };
              alert('نظر شما با موفقیت ثیت شد')
              Keyboard.dismiss();
              // alert(this.state.textAreaValue);
            }}>
            <Text
              style={[{color: '#fff', fontSize: 15, fontFamily: 'IRANMarker'}]}>
              ثبت نظر
            </Text>
          </Button>
        </Footer>
      </Container>
    );
  }
}

RatingScreen.navigationOptions = {
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
  header: {
    backgroundColor: '#23b9b9',
    height: 150,
  },

  footer: {
    backgroundColor: '#fff',
  },
  autocompleteContainerStyle: {
    flex: 3,
    left: 4,
    position: 'absolute',
    right: 110,
    top: 0,
    zIndex: 10,
  },
  autocompleteInputStyle: {
    color: '#23b9b9',
    fontFamily: 'IRANMarker',
    padding: 1,
    marginRight: 2,
    fontSize: 10,
    textAlign: 'right',
  },
  autocompleteResultTextStyle: {
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
    backgroundColor: '#fff',
    flexDirection: 'column',
    flex: 1,
    borderColor: '#d9d9d9',
    borderWidth: 1,
  },
  iconViewStyle: {
    backgroundColor: 'red',
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
    // backgroundColor: '#fff',
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
});
