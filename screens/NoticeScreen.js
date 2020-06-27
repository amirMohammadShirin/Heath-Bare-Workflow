import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  AsyncStorage,
  Platform,
  RefreshControl,
} from 'react-native';
import {
  Container,
  Header,
  Spinner,
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
  Thumbnail,
} from 'native-base';
import Drawer from 'react-native-drawer';
import SideMenu from '../Menu/SideMenu';
import Modal, {ModalContent, SlideAnimation} from 'react-native-modals';

const GETNOTICES = '/api/GetNotices';

export default class NoticeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      animate: true,
      progressModalVisible: false,
      token: null,
      baseUrl: null,
      notices: null,
      picImage: null,
      imageObject: null,
      refreshing: false,
    };
  }

  async componentWillMount(): void {
    let image = this.props.navigation.getParam('imageObject');
    var token = await AsyncStorage.getItem('token');
    var baseUrl = await AsyncStorage.getItem('baseUrl');
    this.setState({baseUrl: baseUrl, token: token, imageObject: image}, () => {
      this.getNotices(false);
    });
  }

  async getNotices(isRefresh) {
    this.setState({progressModalVisible: !isRefresh, refreshing: isRefresh});
    await fetch(this.state.baseUrl + GETNOTICES, {
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
              {progressModalVisible: false, refreshing: false},
              () => {
                this.setState({notices: data}, () => {
                  console.log(JSON.stringify(data));
                });
              },
            );
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

  onRefresh = () => {
    this.setState({refreshing: true});
    this.getNotices(true);
  };

  renderList(value, index) {
    let isViewPatient = value.isViewPatient;
    let postContentText = value.title;
    let animate = false;
    let description = value.description;
    let showForActor = value.isViewActor;
    let postContentImage = value.image;
    let announceDate=value.announceDate
    // let announceDate = '1399/2/8';

    if (isViewPatient) {
      return (
        <View key={index}>
          <Card style={[styles.post]}>
            <CardItem header style={{backgroundColor: '#23b9b9'}}>
              <Body style={{flexDirection: 'row-reverse'}}>
                <Text style={[styles.postText, {color: '#fff', fontSize: 12}]}>
                  {postContentText}
                </Text>
              </Body>
            </CardItem>
            {postContentImage !== null ? (
              <CardItem>
                <Body>
                  <ActivityIndicator
                    color={'gray'}
                    animating={animate}
                    size={'small'}
                    style={{alignSelf: 'center'}}
                  />
                  <Image
                    onLoadEnd={() => {
                      this.setState({animate: animate});
                    }}
                    style={[styles.postImage]}
                    resizeMode={'center'}
                    source={{uri: 'data:image/png;base64, ' + postContentImage}}
                  />
                </Body>
              </CardItem>
            ) : null}
            <CardItem footer>
              <Body style={{flexDirection: 'row-reverse'}}>
                <Text style={[styles.postText, {color: '#9d9d9d',fontSize:9}]}>
                  {description}
                </Text>
              </Body>
            </CardItem>
            {announceDate != null ? (
              <CardItem bordered footer style={{borderColor: '#c0c0c0'}}>
                <Body
                  style={{
                    flexDirection: 'row-reverse',
                    backgroundColor: '#fff',
                  }}>
                  <Icon
                    type="FontAwesome5"
                    name="clock"
                    style={{
                      backgroundColor: '#fff',
                      textAlign: 'left',
                      alignContent: 'center',
                      marginLeft: 5,
                      fontSize: 12,
                      color: '#a8a8a8',
                    }}
                  />
                  <Text
                    style={{
                      backgroundColor: '#fff',
                      textAlign: 'left',
                      fontSize: 7,
                      fontFamily: 'IRANMarker',
                      color: '#a8a8a8',
                    }}>
                    در تاریخ {announceDate} بارگزاری شده است
                  </Text>
                </Body>
              </CardItem>
            ) : null}
          </Card>
        </View>
      );
    } else {
      null;
    }
  }

  render() {
    return (
      <Container scrollEnabled={false}>
        <Header style={{backgroundColor: '#23b9b9'}}>
          <Left style={{flex: 5}}>
            <Text style={styles.headerText}>اطلاع رسانی</Text>
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
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
              progressBackgroundColor="#fff"
              tintColor="#209b9b"
              colors={['#209b9b', 'rgba(34,166,166,0.72)']}
            />
          }
          padder
          style={styles.content}>
          {Platform.OS === 'android' && (
            <StatusBar
              barStyle={'dark-content'}
              backgroundColor={'#209b9b'}
              hidden={false}
            />
          )}

          <ScrollView scrollEnabled={true}>
            {this.state.notices != null && this.state.notices.length > 0
              ? this.state.notices.map(
                  (item, key) => this.renderList(item, key),
                 
                )
              : null}
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
        </Content>
      </Container>
    );
  }
}

NoticeScreen.navigationOptions = {
  header: null,
  title: 'اطلاع رسانی',
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
    backgroundColor: 'rgba(47,246,246,0.06)',
  },
  headerMenuIcon: {
    padding: 5,
    color: '#fff',
    fontSize: 30,
  },
  headerText: {
    padding: 5,
    fontSize: 18,
    color: '#fff',
    fontFamily: 'IRANMarker',
  },
  text: {
    textAlign: 'right',
    fontSize: 15,
  },
  card: {
    borderWidth: 1,
    borderColor: '#c7c7c7',
    borderRadius: 2,
    elevation: 8,
  },
  postText: {
    textAlign: 'right',
    marginTop: 10,
    padding: 1,
    fontSize: 10,
    fontFamily: 'IRANMarker',
  },
  post: {
    margin: 10,
    flex: 0,
    borderColor: '#23b9b9',
    borderWidth: 5,
    elevation: 8,
  },
  postImage: {
    height: 200,
    width: 300,
    flex: 1,
    alignSelf: 'center',
    resizeMode: 'stretch',
  },
  modalContent: {
    marginTop: 5,
    padding: 2,
    alignContent: 'center',
    backgroundColor: 'rgba(47,246,246,0.02)',
  },
});
