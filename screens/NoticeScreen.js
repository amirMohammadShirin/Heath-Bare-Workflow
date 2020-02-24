import React, {Component} from 'react';
import {StyleSheet, View, Image, ScrollView, ActivityIndicator, StatusBar, AsyncStorage, Platform} from 'react-native';
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
import Drawer from "react-native-drawer";
import SideMenu from "../Menu/SideMenu";
import Modal, {ModalContent, SlideAnimation} from "react-native-modals";

const GETNOTICES = '/api/GetNotices';

class Post extends Component {
    constructor(props) {
        super(props);
        this.state = {
            animate: props.animate,
            postContentImage: props.postContentImage,
            postContentText: props.postContentText,
            showForPatient: props.showForPatient,
            showForActor: props.showForActor
            // keyValue: props.myKey
        }
    }

    render() {
        if (this.state.showForPatient) {
            return (

                <Card style={[styles.post]}>
                    <CardItem header>
                        <Body>
                            <ActivityIndicator color={'gray'} animating={this.state.animate} size={"small"}
                                               style={{alignSelf: 'center'}}/>
                            <Image
                                onLoadEnd={() => {
                                    this.setState({animate: !this.state.animate})
                                }}
                                style={[styles.postImage]}
                                defaultSource={require(
                                    'D:\\E\\react native projects\\Health\\bare\\salamat\\assets\\images\\pic.png')}
                                source={{uri: this.state.postContentImage}}/>
                        </Body>
                    </CardItem>
                    <CardItem footer>
                        <Body style={{flexDirection: 'row-reverse'}}>
                            <Text style={styles.postText}>{this.state.postContentText}</Text>
                        </Body>
                    </CardItem>
                    {/*<CardItem>*/}
                    {/*    <Left>*/}
                    {/*        <Button transparent>*/}
                    {/*            <Icon type='FontAwesome' name="heart" style={{color: '#ba150b'}}/>*/}
                    {/*            <Text style={{color: '#ba150b'}}>{props.likes} نفر پسندیده اند</Text>*/}
                    {/*        </Button>*/}
                    {/*    </Left>*/}
                    {/*</CardItem>*/}
                </Card>
            );
        }

    }
}


export default class NoticeScreen extends Component {

    constructor(props) {


        super(props);
        this.state = {
            animate: true,
            progressModalVisible: false,
            token: null,
            baseUrl: null,
            notices: null
        }
    }

    async componentWillMount(): void {
        var token = await AsyncStorage.getItem('token');
        var baseUrl = await AsyncStorage.getItem('baseUrl')
        this.setState({baseUrl: baseUrl, token: token}, () => {
            this.getNotices()
        })
    }


    async getNotices() {
        this.setState({progressModalVisible: true})
        await fetch(this.state.baseUrl + GETNOTICES, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(this.state.token)
            },
        }).then((response) => response.json())
            .then((responseData) => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        this.setState({progressModalVisible: false}, () => {
                            this.setState({notices: data})
                        })
                    }
                } else {
                    this.setState({progressModalVisible: false}, () => {
                        alert('خطا در اتصال به سرویس')
                    })

                }
            })
            .catch((error) => {
                console.error(error)
                // alert(error)
            })
    }


    render() {
        return (
            <Container>
                <Header style={{backgroundColor: '#23b9b9'}}>
                    <Left style={{flex: 5}}>
                        <Text style={styles.headerText}>اطلاع رسانی</Text>
                    </Left>
                    <Right style={{flex: 1}}>
                        <Button transparent style={styles.headerMenuIcon}
                                onPress={() => this.props.navigation.openDrawer()}>
                            <Icon style={styles.headerMenuIcon} name='menu'
                                  onPress={() => this.props.navigation.openDrawer()}/>
                        </Button>
                    </Right>

                </Header>
                <Content padder style={styles.content}>
                    {Platform.OS === 'android' &&
                    <StatusBar barStyle={"dark-content"} backgroundColor={'#209b9b'}
                               hidden={false}/>
                    }
                    {/*<Card style={styles.card}>*/}
                    {/*    <CardItem>*/}
                    {/*        <Body>*/}
                    {/*            <Text style={styles.text}>*/}

                    {/*                بازدید وزیر بهداشت و سرپرست شهرداری تهران از طرح*/}
                    {/*                معاینات کودکان کار (1398/7/20)*/}
                    {/*            </Text>*/}
                    {/*        </Body>*/}
                    {/*    </CardItem>*/}
                    {/*    <CardItem>*/}
                    {/*        <Body>*/}
                    {/*            <Text style={styles.text}>*/}
                    {/*                ارائه خدمات بهداشتی درمانی شرکت شهر سالم در ایام*/}
                    {/*                تعطیلات نوروز (1398/7/25)*/}
                    {/*            </Text>*/}
                    {/*        </Body>*/}
                    {/*    </CardItem>*/}
                    {/*    <CardItem>*/}
                    {/*        <Body>*/}
                    {/*            <Text style={styles.text}>*/}
                    {/*                تکمیل چرخه خدمت در مراکز بهداشتی درمانی شرکت*/}
                    {/*                شهر سالم (1398/6/31)*/}
                    {/*            </Text>*/}
                    {/*        </Body>*/}
                    {/*    </CardItem>*/}
                    {/*</Card>*/}
                    <ScrollView>
                        {this.state.notices != null ?
                            this.state.notices.map((item, key) => (
                                /*<MyPost animate={this.state.animate} postContentText={item.text}*/
                                /*        postContentImage={item.image}*/
                                /*        likes={Math.round(Math.random() * 10) + 1}/>*/
                                <View key={key}>
                                    <Post animate={this.state.animate} postContentText={item.title}
                                          showForPatient={item.isViewPatient} showForActor={item.isViewActor}
                                          postContentImage={'http://shahresalem.tehran.ir/Portals/0/UltraPhotoGallery/2633/206/2.sh%20(2).JPG'}/>
                                </View>
                            )) : null}
                    </ScrollView>
                    <Modal style={{opacity: 0.7}}
                           width={300}
                           visible={this.state.progressModalVisible}
                           modalAnimation={new SlideAnimation({
                               slideFrom: 'bottom'
                           })}
                    >
                        <ModalContent style={styles.modalContent}>
                            <ActivityIndicator animating={true} size="small" color={"#23b9b9"}/>
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
        backgroundColor: '#23b9b9'
    },
    headerTitleStyle: {
        color: '#fff',

    },
    headerLeft: null
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: 'rgba(47,246,246,0.06)',
    },
    headerMenuIcon: {
        padding: 5,
        color: '#fff',
        fontSize: 30
    },
    headerText: {
        padding: 5,
        fontSize: 18,
        color: '#fff',
        fontFamily: 'IRANMarker'
    },
    text: {
        textAlign: 'right',
        fontSize: 15
    },
    card: {
        borderWidth: 1,
        borderColor: '#c7c7c7',
        borderRadius: 2,
        elevation: 8
    },
    postText: {
        textAlign: 'right',
        marginTop: 10,
        padding: 1,
        fontSize: 10,
        fontFamily: 'IRANMarker'

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
        alignSelf: 'center'
    },
    modalContent: {
        marginTop: 5,
        padding: 2,
        alignContent: 'center',
        backgroundColor: 'rgba(47,246,246,0.02)'
    }
});
