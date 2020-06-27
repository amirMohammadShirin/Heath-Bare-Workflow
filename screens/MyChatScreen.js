import React, {Component} from 'react';
3;
import Autocomplete from 'react-native-autocomplete-input';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Keyboard,
  StatusBar,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import DatePicker from '@mohamadkh75/react-native-jalali-datepicker';
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
import {from} from 'jalali-moment';

export default class MyChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fontLoaded: false,
      refreshing: false,
      doctorQuery: null,
      medicalCenterQuery: null,
      doctorSelected: false,
      medicalCenterSelected: false,
      doctorData: ['علی رحیمی', 'علی رضا رحیمیان', 'آرمان رضایی', 'رحیم حسینی'],
      medicalCenterData: [
        'درمانگاه استخر',
        'درمانگاه استخر',
        'درمانگاه استخر',
        'درمانگاه استخر',
        'درمانگاه منطقه 5 شهرداری',
        'مطب دکتر',
        'درمانگاه منطقه 11 شهرداری',
        ' درمانگاه',
      ],
    };
  }

  filterDoctorData(text) {
    if (text !== null) {
      let mainData = this.state.doctorData;
      let data = [];
      for (var item of mainData) {
        if (item.includes(text)) {
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
        if (item.includes(text)) {
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

  render() {
    if (true) {
      const {doctorQuery} = this.state;
      const doctorData = this.filterDoctorData(doctorQuery);
      const {medicalCenterQuery} = this.state;
      const medicalCenterData = this.filterMedicalCenterData(
        medicalCenterQuery,
      );
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
              <Text style={styles.headerText}>ارسال پیام</Text>
            </Right>
          </Header>
          <Content padder>
            {Platform.OS === 'android' && (
              <StatusBar
                barStyle={'dark-content'}
                backgroundColor={'#209b9b'}
                hidden={false}
              />
            )}
            <Autocomplete
              listStyle={styles.autocompleteListStyle}
              listContainerStyle={
                !this.state.doctorSelected
                  ? styles.autocompleteListContainerStyleSelected
                  : [
                      styles.autocompleteListContainerStyleSelected,
                      {maxHeight: 0},
                    ]
              }
              keyboardShouldPersistTaps={'always'}
              style={styles.autocompleteInputStyle}
              data={doctorData}
              placeholder={'نام پزشک'}
              placeholderTextColor={'#b7b7b7'}
              defaultValue={doctorQuery}
              onChangeText={text => {
                if (text.length === 0) {
                  this.setState({
                    doctorQuery: null,
                    doctorSelected: false,
                  });
                } else {
                  this.setState({doctorQuery: text});
                }
              }}
              renderItem={({item, i}) => (
                <TouchableOpacity
                  style={styles.autocompleteResultStyle}
                  onPress={() =>
                    this.setState({
                      doctorQuery: item,
                      doctorSelected: true,
                    })
                  }>
                  <View style={styles.autocompleteIconViewStyle}>
                    <Icon
                      type="FontAwesome"
                      name="user-md"
                      style={styles.autocompleteIconStyle}
                    />
                  </View>
                  <Text style={styles.autocompleteResultTextStyle}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <Autocomplete
              listStyle={styles.autocompleteListStyle}
              listContainerStyle={
                !this.state.medicalCenterSelected
                  ? styles.autocompleteListContainerStyleSelected
                  : [
                      styles.autocompleteListContainerStyleSelected,
                      {maxHeight: 0},
                    ]
              }
              keyboardShouldPersistTaps={'always'}
              style={styles.autocompleteInputStyle}
              data={medicalCenterData}
              placeholder={'نام مرکز'}
              placeholderTextColor={'#b7b7b7'}
              defaultValue={medicalCenterQuery}
              onChangeText={text => {
                if (text.length === 0) {
                  this.setState({
                    medicalCenterQuery: null,
                    medicalCenterSelected: false,
                  });
                } else {
                  this.setState({medicalCenterQuery: text});
                }
              }}
              renderItem={({item, i}) => (
                <TouchableOpacity
                  style={styles.autocompleteResultStyle}
                  onPress={() =>
                    this.setState({
                      medicalCenterQuery: item,
                      medicalCenterSelected: true,
                    })
                  }>
                  <View style={styles.autocompleteIconViewStyle}>
                    <Icon
                      type="FontAwesome"
                      name="h-square"
                      style={styles.autocompleteIconStyle}
                    />
                  </View>
                  <Text style={styles.autocompleteResultTextStyle}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </Content>
          <Footer style={styles.footer}>
            <Fab
              direction="up"
              containerStyle={styles.chatInput}
              style={{backgroundColor: '#23b9b9'}}
              position="bottomRight"
              onPress={() => alert('Sent')}>
              <Icon name="paper-plane" type="FontAwesome" />
            </Fab>
          </Footer>
        </Container>
      );
    } else {
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
              <Text style={styles.headerText}>ارسال پیام</Text>
            </Right>
          </Header>
          <Content padder>
            {Platform.OS === 'android' && (
              <StatusBar
                barStyle={'dark-content'}
                backgroundColor={'#209b9b'}
                hidden={false}
              />
            )}
            <View
              style={{
                margin: 5,
                borderWidth: 2,
                borderRadius: 5,
                backgroundColor: '#24d1d1',
                borderColor: '#20a0a0',
              }}>
              <Card transparent>
                <CardItem
                  style={{
                    backgroundColor: 'rgba(255,255,255,0)',
                    flexDirection: 'row-reverse',
                  }}>
                  <Right
                    style={{
                      backgroundColor: 'rgba(255,255,255,0)',
                      flex: 3,
                      justifyContent: 'flex-end',
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 18,
                        fontWeight: 'bold',
                      }}>
                      ارسال پیام به پزشک
                    </Text>
                  </Right>
                  <Left style={{flex: 1}}>
                    <Icon
                      type={'FontAwesome5'}
                      name={'envelope'}
                      style={{
                        color: '#fff',
                        alignSelf: 'flex-end',
                        fontSize: 25,
                      }}
                    />
                  </Left>
                </CardItem>
              </Card>
            </View>
            <Form
              style={{
                borderWidth: 1,
                borderColor: '#23b9b9',
                marginTop: 30,
                padding: 5,
                flex: 1,
              }}>
              <Item
                style={{
                  padding: 1,
                  fontSize: 15,
                  marginBottom: 5,
                  marginTop: 5,
                }}>
                <Icon
                  active
                  name="person"
                  style={{fontSize: 15, textAlign: 'right'}}
                />
                <Input placeholder="گیرنده پیام" style={{textAlign: 'right'}} />
              </Item>
              <Textarea
                rowSpan={7}
                bordered
                placeholder="متن پیام"
                style={{textAlign: 'right', padding: 3, fontSize: 15}}
              />
            </Form>
          </Content>
          <Footer style={styles.footer}>
            <Fab
              direction="up"
              containerStyle={styles.chatInput}
              style={{backgroundColor: '#23b9b9'}}
              position="bottomRight"
              onPress={() => alert('Sent')}>
              <Icon name="paper-plane" type="FontAwesome" />
            </Fab>
          </Footer>
        </Container>
      );
    }
  }
}

MyChatScreen.navigationOptions = {
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
    margin: 5,
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
  titleText: {
    color: '#fff',
    textAlign: 'left',
    alignSelf: 'flex-end',
    fontWeight: 'bold',
  },
  contentText: {
    color: '#000',
    textAlign: 'left',
    alignSelf: 'flex-end',
    marginTop: 5,
    fontSize: 15,
  },
  chatInput: {
    padding: 2,
    marginTop: 10,
    marginBottom: 10,
  },
  footer: {
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'pink',
    alignItems: 'center',
    justifyContent: 'center',
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  autocompleteInputStyle: {
    color: '#000',
    fontFamily: 'IRANMarker',
    padding: 2,
    marginRight: 2,
    fontSize: 10,
    textAlign: 'right',
  },
  autocompleteResultTextStyle: {
    flex: 10,
    color: '#c7c7c7',
    fontFamily: 'IRANMarker',
    fontSize: 9,
    padding: 2,
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
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    paddingRight: 10,
    paddingLeft: 10,
    minHeight: 0,
    maxHeight: 70,
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
    color: '#c7c7c7',
    fontSize: 13,
  },
});
