import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  StatusBar,
  AsyncStorage,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import QuestionListItem from '../component/QuestionListItem'
import {
  Container,
  Header,
  Title,
  Content,
  Accordion,
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
} from 'native-base';
import {ListItem} from 'react-native-elements';
import Modal, {ModalContent, SlideAnimation} from 'react-native-modals';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';

const GETQUESTIONS = '/api/GetQuestions';
export default class GuidScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      baseUrl: null,
      questions: null,
      progressModalVisible: true,
      refreshing: false,
    };
  }

  async componentWillMount(): void {
    var token = await AsyncStorage.getItem('token');
    var baseUrl = await AsyncStorage.getItem('baseUrl');
    this.setState({baseUrl: baseUrl, token: token}, () => {
      this.getQuestions(false);
    });
  }

  async getQuestions(isRefresh) {
    this.setState({progressModalVisible: !isRefresh, refreshing: isRefresh});
    fetch(this.state.baseUrl + GETQUESTIONS, {
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
            this.setState({questions: data}, () => {
              this.setState({progressModalVisible: false, refreshing: false});
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

  SelectQuestion(selectedQuestion) {
    this.props.navigation.navigate('MoreInfo', {
      backRoute: 'GuideScreen',
      question: selectedQuestion,
    });
  }

  onRefresh = () => {
    this.getQuestions(true);
  };

  render() {
    return (
      <Container>
        <Header style={{backgroundColor: '#23b9b9'}}>
          <Left style={{flex: 5}}>
            <Text style={styles.headerText}>راهنما</Text>
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
          padder
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
              progressBackgroundColor="#fff"
              tintColor="#209b9b"
              colors={['#209b9b', 'rgba(34,166,166,0.72)']}
            />
          }>
          {Platform.OS === 'android' && (
            <StatusBar
              barStyle={'dark-content'}
              backgroundColor={'#209b9b'}
              hidden={false}
            />
          )}
          <Card style={styles.card} cardItemPadding={14}>
            <CardItem style={styles.cardHeader} header bordered>
              <Body style={styles.body}>
                <Text
                  style={[
                    styles.titleStyle,
                    {
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: '#23b9b9',
                      fontFamily: 'IRANMarker',
                    },
                  ]}>
                  سوالات متداول بیماران سامانه سلامت
                </Text>
              </Body>
            </CardItem>
            <List Indent style={{backgroundColor: '#fff'}}>
              {this.state.questions != null && Platform.OS === 'android' &&
                this.state.questions.map((l, i) => (
                    
                  <View key={i}>
                  
                    {/* <ListItem
                      containerStyle={{
                        backgroundColor: 'rgba(37,180,180,0.42)',
                      }}
                      noIndent
                      style={[styles.items]}
                      title={l.title}
                      titleStyle={styles.titleStyle}
                      bottomDivider
                      onPress={() => this.SelectQuestion(l)}
                      leftIcon={
                        <Icon
                          type="FontAwesome"
                          name="info-circle"
                          style={styles.leftIconStyle}
                        />
                      }
                    /> */}

                   <QuestionListItem
                       title={l.title}
                       onPress={() => this.SelectQuestion(l)}
                   />
                  </View>
                ))}
                {this.state.questions != null && Platform.OS === 'ios' &&
                this.state.questions.map((l, i) => (
                    
                  <View key={i}>
                  
                    <ListItem
                      containerStyle={{
                        backgroundColor: 'rgba(37,180,180,0.42)',
                      }}
                      noIndent
                      style={[styles.items]}
                      title={l.title}
                      titleStyle={styles.titleStyle}
                      bottomDivider
                      onPress={() => this.SelectQuestion(l)}
                      leftIcon={
                        <Icon
                          type="FontAwesome"
                          name="info-circle"
                          style={styles.leftIconStyle}
                        />
                      }
                    />

                   {/* <QuestionListItem
                       title={l.title}
                       onPress={() => this.SelectQuestion(l)}
                   /> */}
                  </View>
                ))}
            </List>
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
      </Container>
    );
  }
}

GuidScreen.navigationOptions = {
  header: null,
  title: 'راهنما',
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
    fontSize: 30,
    color: '#fff',
  },
  headerText: {
    fontFamily: 'IRANMarker',
    padding: 5,
    fontSize: 18,
    color: '#fff',
  },
  text: {
    textAlign: 'right',
    fontSize: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#23a5a5',
    borderRadius: 1,
    elevation: 8,
    margin: 2,
  },
  titleStyle: {
    fontFamily: 'IRANMarker',
    color: '#fff',
    fontSize: 13,
    textAlign: 'right',
  },
  leftIconStyle: {
    fontSize: 20,
    color: '#1f9292',
  },
  items: {
    padding: 2,
    margin: 2,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
  cardHeader: {
    borderWidth: 1,
    borderBottomColor: '#1f9292',
    borderColor: '#fff',
  },
  modalContent: {
    marginTop: 5,
    padding: 2,
    alignContent: 'center',
    backgroundColor: 'rgba(47,246,246,0.02)',
  },
});
