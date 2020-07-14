import React, {Component} from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  Text,
  Keyboard,
  View,
  Platform,
  BackHandler,
} from 'react-native';
import ProgressiveText from '../component/progressiveText';
import {Alert} from 'react-native';
import {Dialog} from 'react-native-simple-dialogs';
import {
  List,
  Button,
  Body,
  Container,
  Content,
  Item,
  Header,
  Icon,
  Left,
  Right,
  Root,
  Input,
  Card,
  CardItem,
  ListItem,
  Thumbnail,
} from 'native-base';
import Modal, {
  ModalButton,
  ModalContent,
  ModalFooter,
  ModalTitle,
  SlideAnimation,
} from 'react-native-modals';
const SEARCHMEDICALCENTERALLFIELD = '/api/SearchMedicalCenterAllField';
const GETFAVORITEMEDICALCENTERS = '/api/GetFavoriteMedicalCenters';

export default class SearchMedicalCenter extends Component {
  constructor(props) {
    super(props);
    if (Platform.OS === 'android') {
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }
    this.state = {
      selectedMedicalCenter: {},
      title: '',
      description: '',
      visible: false,
      medicalCenterTitle: '',
      data: [],
      searchTerm: '',
      titleOfAlert: '',
      messageOfAlert: '',
      progressModalVisible: false,
      previousLength: -1,
      favoriteMedicalCenters: [],
      imageObject: null,
      isLoading: false,
    };
  }

  async goToDetailsScreen(value) {
    this.props.navigation.navigate('DetailsForMedicalCenterScreen', {
      medicalCenter: value,
      doctor: null,
      backRoute: 'SearchMedicalCenter',
      imageObject: this.state.imageObject,
    });
  }

  handleBackButtonClick() {
    // alert('pressed')

    console.log(JSON.stringify(this.props.navigation.state));

    if (this.props.navigation.state.isDrawerOpen) {
      this.props.navigation.closeDrawer();
    } else {
      if (!this.state.progressModalVisible) {
        if (this.state.visible) {
          this.setState({visible: false});
        }
      } else if (!this.state.progressModalVisible) {
        this.onBackPressed();
      }
    }
    return true;
  }

  onBackPressed() {
    this.props.navigation.goBack(null);
  }

  async componentWillMount(): void {
    let image = this.props.navigation.getParam('imageObject');
    if (Platform.OS === 'android') {
      BackHandler.addEventListener(
        'hardwareBackPress',
        this.handleBackButtonClick,
      );
    }
    var token = await AsyncStorage.getItem('token');
    var baseUrl = await AsyncStorage.getItem('baseUrl');
    await this.setState(
      {baseUrl: baseUrl, token: token, imageObject: image},
      () => {
        this.getFavoriteMedicalCenters();
      },
    );
  }

  async search(text) {
    await this.setState({progressModalVisible: false, isLoading: true});
    await fetch(this.state.baseUrl + SEARCHMEDICALCENTERALLFIELD, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + new String(this.state.token),
      },
      body: JSON.stringify({
        searchWord: text,
      }),
    })
      .then(response => response.json())
      .then(responseData => {
        if (responseData['StatusCode'] === 200) {
          if (responseData['Data'] != null) {
            let data = responseData['Data'];
            this.setState(
              {progressModalVisible: false, isLoading: false},
              () => {
                this.setState({data: data});
              },
            );
          }
        } else if (responseData['StatusCode'] === 400) {
          this.setState({progressModalVisible: false, isLoading: false}, () => {
            alert(JSON.stringify('خطا در دسترسی به سرویس'));
          });
        } else {
          this.setState({progressModalVisible: false, isLoading: false});
        }
      })
      .catch(error => {
        console.error(error);
        // alert(error)
      });
  }

  async getFavoriteMedicalCenters() {
    await this.setState({progressModalVisible: true});
    await fetch(this.state.baseUrl + GETFAVORITEMEDICALCENTERS, {
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
            await this.setState({progressModalVisible: false}, () => {
              this.setState({favoriteMedicalCenters: data});
            });
          }
        } else if (responseData['StatusCode'] === 400) {
          await this.setState({progressModalVisible: false});
          // alert(JSON.stringify('خطا در دسترسی به سرویس'))
          // alert(JSON.stringify(JSON.stringify(responseData)))
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  render() {
    return (
      <Container>
        <Header style={styles.header}>
          <Left style={{flex: 5}}>
            <Text style={styles.headerText}>جستجوی مرکز درمانی</Text>
          </Left>
          <Right style={{flex: 1}}>
            <Button
              transparent
              style={styles.headerMenuIcon}
              onPress={() => {
                Keyboard.dismiss();
                this.props.navigation.openDrawer();
              }}>
              <Icon
                style={styles.headerMenuIcon}
                name="menu"
                onPress={() => {
                  Keyboard.dismiss();
                  this.props.navigation.openDrawer();
                }}
              />
            </Button>
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
            <ProgressiveText
              placeholder="جستجوی نام مرکز،خدمات،منطقه و ..."
              placeholderTextColor={'#d0d0d0'}
              isLoading={this.state.isLoading}
              searchTerm={this.props.searchTerm}
              onChangeText={searchTerm => {
                {
                  if (searchTerm.length > this.state.previousLength) {
                    this.setState(
                      {
                        searchTerm: searchTerm,
                        previousLength: searchTerm.length,
                      },
                      async () => {
                        if (searchTerm.length === 0) {
                          await this.setState({data: []});
                        } else {
                          if (searchTerm.length >= 3) {
                            await this.search(searchTerm);
                          }
                        }
                      },
                    );
                  } else {
                    this.setState({
                      searchTerm: searchTerm,
                      previousLength: searchTerm.length,
                    });
                  }
                }
              }}
            />
            <View
              style={[styles.row, {flexDirection: this.state.flexDirection}]}>
              <Button
                transparent
                style={{alignSelf: 'flex-start', margin: 2, padding: 2}}
                onPress={() => {
                  Keyboard.dismiss();
                  this.props.navigation.navigate('AdvanceSearchScreen', {
                    medicalCenter: true,
                    doctor: false,
                    imageObject: this.state.imageObject,
                    // headerFontSize : 20
                  });
                }}>
                <Text
                  style={{
                    textAlign: 'right',
                    fontSize: 10,
                    color: '#23b9b9',
                    fontFamily: 'IRANMarker',
                  }}>
                  جستجوی پیشرفته
                </Text>
              </Button>
            </View>

            <List>
              {this.state.data != null && this.state.data.length >= 1 ? (
                this.state.data.map((item, key) => (
                  <View key={key}>
                    <View
                      key={key}
                      style={{
                        borderBottomColor: '#e9e9e9',
                        borderBottomWidth: 1,
                      }}>
                      <ListItem
                        noBorder
                        style={{
                          width: '100%',
                          alignSelf: 'center',
                          padding: 1,
                          marginTop: 2,
                          borderColor: '#fff',
                          justifyContent: 'center',
                          alignContent: 'center',
                          alignItems: 'center',
                        }}
                        onPress={() => {
                          Keyboard.dismiss();
                          this.setState({
                            selectedMedicalCenter: item,
                            visible: true,
                          });
                        }}>
                        <Body
                          style={{
                            height: '100%',
                            marginRight: 5,
                            alignSelf: 'center',
                          }}>
                          <Text
                            style={{
                              fontFamily: 'IRANMarker',
                              color: '#000',
                              textAlign: 'right',
                              fontSize: 13,
                              marginRight: 1,
                              marginTop: 5,
                              minHeight: 28,
                              maxHeight: 32,
                            }}>
                            {item.Title}
                          </Text>
                          {(item.Facility != null ||
                            item.ServiceDetail != null ||
                            item.Service != null) && (
                            <Text
                              style={{
                                fontFamily: 'IRANMarker',
                                color: '#23b9b9',
                                textAlign: 'right',
                                fontSize: 13,
                                fontWeight: 'bold',
                                marginTop: 5,
                                marginRight: 1,
                              }}>
                              {item.ServiceDetail != null
                                ? item.ServiceDetail + ' ، '
                                : null}
                              {item.Service != null
                                ? item.Service + ' ، '
                                : null}
                              {item.Facility}
                            </Text>
                          )}

                          {item.Phone != null && (
                            <Text
                              style={{
                                fontFamily: 'IRANMarker',
                                color: '#a9a9a9',
                                textAlign: 'right',
                                fontWeight: 'bold',
                                fontSize: 13,
                                marginTop: 5,
                                marginRight: 1,
                              }}>
                              {' '}
                              تلفن : {item.Phone}
                            </Text>
                          )}
                          {item.Address != null && (
                            <Text
                              style={{
                                fontFamily: 'IRANMarker',
                                color: '#a9a9a9',
                                textAlign: 'right',
                                fontWeight: 'bold',
                                fontSize: 13,
                                marginTop: 5,
                                marginRight: 1,
                              }}>
                              {item.Address}
                            </Text>
                          )}
                        </Body>
                      </ListItem>
                    </View>
                  </View>
                ))
              ) : this.state.data.length === 0 ? (
                this.state.favoriteMedicalCenters.map((item, key) => (
                  <View key={key}>
                    <ListItem
                      style={{
                        width: '100%',
                        height: 50,
                        alignSelf: 'center',
                        padding: 1,
                        marginTop: 2,
                      }}
                      onPress={() => {
                        Keyboard.dismiss();
                        this.setState({
                          selectedMedicalCenter: item,
                          visible: true,
                        });
                      }}>
                      <Body>
                        <Text
                          style={{
                            fontFamily: 'IRANMarker',
                            color: '#000',
                            width: '100%',
                            height: '100%',
                            textAlign: 'right',
                            fontSize: 13,
                            minHeight: 28,
                            maxHeight: 32,
                          }}>
                          {item.Title}
                        </Text>
                      </Body>
                    </ListItem>
                  </View>
                ))
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text style={{color: 'gray', fontFamily: 'IRANMarker'}}>
                    موردی یافت نشد
                  </Text>
                </View>
              )}
            </List>

            <Dialog
              dialogStyle={{
                backgroundColor: 'transparent',
                borderWidth: 0,
                borderColor: 'transparent',
                elevation: 0,
              }}
              animationType={'fade'}
              visible={this.state.visible}
              onTouchOutside={() => this.setState({visible: false})}>
              <View>
                <Card style={{borderBottomColor: 'gray', borderWidth: 1}}>
                  <CardItem header style={styles.modalTitle}>
                    <Body style={{alignContent: 'center'}}>
                      <Text style={styles.modalTitleText}>
                        {this.state.selectedMedicalCenter.Title}
                      </Text>
                    </Body>
                  </CardItem>
                  <CardItem style={{backgroundColor: '#fff'}}>
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
                        {this.state.selectedMedicalCenter.Description != null
                          ? this.state.selectedMedicalCenter.Description
                          : ''}
                      </Text>
                    </Body>
                  </CardItem>
                  <CardItem footer style={{backgroundColor: '#fff'}}>
                    <Body style={{flexDirection: 'row'}}>
                      <Button
                        style={styles.modalCancelButton}
                        onPress={async () => {
                          this.setState({visible: false});
                          this.props.navigation.navigate('SearchDoctorScreen', {
                            medicalCenter: this.state.selectedMedicalCenter,
                            imageObject: this.state.imageObject,
                          });
                        }}>
                        <Text style={styles.modalCancelButtonText}>
                          جستجوی پزشک
                        </Text>
                      </Button>
                      <Button
                        style={styles.modalSuccessButton}
                        onPress={async () => {
                          await this.setState({visible: false});
                          await this.goToDetailsScreen(
                            this.state.selectedMedicalCenter,
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

SearchMedicalCenter.navigationOptions = {
  header: null,
  title: 'جستجوی مرکز درمانی',
  headerStyle: {
    backgroundColor: '#23b9b9',
  },
  headerTitleStyle: {
    color: '#fff',
  },
  headerLeft: null,
  keyboardHandlingEnabled:true
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#23b9b9',
    borderWidth: 1,
    margin: 5,
    padding: 5,
    flexDirection: 'column',
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
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  modalTitle: {
    backgroundColor: '#23b9b9',
  },
  modalTitleText: {
    fontFamily: 'IRANMarker',
    color: '#fff',
    textAlign: 'center',
    alignSelf: 'center',
  },
  modalFooter: {
    padding: 2,
    backgroundColor: 'rgba(47,246,246,0.06)',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 3,
    borderColor: '#23b9b9',
    borderWidth: 1,
    padding: 2,
    margin: 5,
    justifyContent: 'center',
  },
  modalSuccessButton: {
    flex: 1,
    backgroundColor: '#23b9b9',
    borderRadius: 3,
    padding: 2,
    margin: 5,
    justifyContent: 'center',
  },
  modalSuccessButtonText: {
    fontFamily: 'IRANMarker',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'right',
  },
  modalCancelButtonText: {
    fontFamily: 'IRANMarker',
    color: '#23b9b9',
    fontSize: 10,
    textAlign: 'right',
  },
  modalContent: {
    marginTop: 5,
    padding: 2,
    alignContent: 'center',
    backgroundColor: 'rgba(47,246,246,0.06)',
  },
  //
  // modalSuccessButtonText: {
  //   flex: 1,
  //   color: '#fff',
  //   fontFamily: 'IRANMarker',
  //   fontWeight: 'bold',
  //   fontSize: 12,
  //   textAlign: 'center',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   textAlignVertical: 'center',
  // },
  // modalCancelButtonText: {
  //   flex: 1,
  //   color: '#23b9b9',
  //   fontSize: 10,
  //   justifyContent: 'center',
  //   fontFamily: 'IRANMarker',
  //   textAlign: 'center',
  // },
});
