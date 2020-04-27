import React, {Component} from 'react';
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
} from 'react-native';
import Swipeable from 'react-native-swipeable-row';
import {
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
} from 'native-base';
import Modal, {
  ModalButton,
  ModalContent,
  ModalFooter,
  ModalTitle,
  SlideAnimation,
} from 'react-native-modals';
import PersianCalendarPicker from 'react-native-persian-calendar-picker';

const GETRESREVATIONREPORTS = '/api/GetReservationReports';
const DISABLERESERVATION = '/api/DisableReservation';
export default class ShowReservesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleModal: false,
      array: null,
      progressModalVisible: true,
      refreshing: false,
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
    var token = await AsyncStorage.getItem('token');
    var baseUrl = await AsyncStorage.getItem('baseUrl');
    this.setState({baseUrl: baseUrl, token: token}, () => {
      this.getReservationReports(false);
    });
  }
  async disableReservation(value) {
    this.setState({progressModalVisible: true});
    let body = {
      id: value.id,
      actor: value.actor,
      medicalCenter: value.medicalCenter,
      startTime: value.StartTime,
      type: value.type,
      date: value.date,
      status: value.status,
      statusValue: value.statusValue,
    };
    console.log('body : ' + JSON.stringify(body));
    fetch(this.state.baseUrl + DISABLERESERVATION, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + new String(this.state.token),
      },
      body: JSON.stringify(body),
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
        }

        // else if (responseData['StatusCode'] === 501) { //10010
        //     alert('عملیات لغو با شکست مواجه شد')
        // }
        else if (responseData['StatusCode'] === 501) {
          //10010
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
    this.setState({progressModalVisible: !refreshing});
    fetch(this.state.baseUrl + GETRESREVATIONREPORTS, {
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
            this.setState({array: data}, () => {
              this.setState({progressModalVisible: false, refreshing: false});
              console.log(JSON.stringify(this.state.array));
            });
          }
        } else {
          this.setState(
            {progressModalVisible: false, refreshing: false},
            () => {
              alert('خطا در اتصال به سرویس');
            },
          );
        }
      })
      .catch(error => {
        console.error(error);
        // alert(error)
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
          {/* <Swipeable> */}
          {/* <MyPost time={value.StartTime.substring(0, 5)} type={value.type} status={value.status}
                        medicalCenter={value.medicalCenter} actor={value.actor}
                        date={value.date.substring(0, 10)}
                        myColor={'#cfcfcf'}
                        headerColor={'rgba(215,1,0,0.75)'}
                        disable={false}

                    /> */}
          {/* </Swipeable> */}
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
          {/* <Swipeable
                        rightButtons={[<Button
                            style={{ height: '100%', margin: 2 }} danger>
                            <Icon type={'FontAwesome5'} name='calendar-times' />
                        </Button>]}
                    > */}
          {/* <MyPost
                        myValue={value}
                        time={value.StartTime} type={value.type} status={value.status}
                        medicalCenter={value.medicalCenter} actor={value.actor} date={value.date}
                        myColor={'#fff'}
                        headerColor={'rgba(0,138,50,0.78)'}
                        disable={true}
                    /> */}
          {/* </Swipeable> */}
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
                {/*<Icon type={'FontAwesome5'} name='calendar-times' style={{color: 'rgba(215,1,0,0.75)'}}/>*/}
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

  onRefresh = () => {
    this.setState({refreshing: true});
    console.log('refresh started');
    this.getReservationReports(true);
  };

  render() {
    return (
      <Container style={{backgroundColor: 'rgba(34,166,166,0.72)'}}>
        <Content
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
          {/* <Content onMomentumScrollEnd={() => this.getReservationReports()}> */}
          {Platform.OS === 'android' && (
            <StatusBar
              barStyle={'dark-content'}
              backgroundColor={'#209b9b'}
              hidden={false}
            />
          )}
          <View style={styles.container}>
            <ScrollView>
              {this.state.array != null &&
                this.state.array.map((value, index) =>
                  this.renderList(value, index),
                )}
            </ScrollView>
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
          </View>
        </Content>
        {/*<Footer style={{backgroundColor:'rgba(34,166,166,0.72)'}}>*/}
        {/*    <Fab*/}
        {/*        direction="up"*/}
        {/*        style={{backgroundColor: '#37a39d'}}*/}
        {/*        position="bottomRight"*/}
        {/*        onPress={() => this.getReservationReports()}>*/}
        {/*        <Icon name="refresh" type="FontAwesome" style={{color:'#fff'}}/>*/}

        {/*    </Fab>*/}
        {/*</Footer>*/}
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
  },
  modalSuccessButton: {
    backgroundColor: '#23b9b9',
    borderRadius: 3,
    padding: 2,
    margin: 5,
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
  modalContent: {
    marginTop: 5,
    padding: 2,
    alignContent: 'center',
    backgroundColor: 'rgba(47,246,246,0.02)',
  },
  title: {
    color: 'gray',
    textAlign: 'right',
    fontFamily: 'IRANMarker',
    fontSize: 13,
  },
  value: {
    color: 'gray',
    textAlign: 'right',
    fontFamily: 'IRANMarker',
    fontSize: 11,
  },
});
