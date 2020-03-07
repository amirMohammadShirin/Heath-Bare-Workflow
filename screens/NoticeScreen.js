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
//const pic= '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';

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
                                    this.setState({ animate: !this.state.animate })
                                }}
                                style={[styles.postImage]}
                                resizeMode={"center"}
                                source={{uri:this.state.postContentImage}}  
                                // defaultSource={{uri: 'data:image/png;base64,'+pic}}
                            /></Body>
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
            notices: null,
            picImage: null,
            imageObject: null
        }
    }

    async componentWillMount(): void {
        let image = this.props.navigation.getParam('imageObject');
        var token = await AsyncStorage.getItem('token');
        var baseUrl = await AsyncStorage.getItem('baseUrl')
        this.setState({ baseUrl: baseUrl, token: token ,imageObject : image}, () => {
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
                                        postContentImage={(item.image != null && typeof item.image !== 'undefined') ? item.image : this.state.imageObject.pic }
                                        /></View>
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
        alignSelf: 'center',
        tintColor:'#dddddd'
    },
    modalContent: {
        marginTop: 5,
        padding: 2,
        alignContent: 'center',
        backgroundColor: 'rgba(47,246,246,0.02)'
    }
});
