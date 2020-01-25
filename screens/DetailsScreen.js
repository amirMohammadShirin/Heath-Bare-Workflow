import React, {Component} from 'react';
import {ActivityIndicator, AsyncStorage, Keyboard, StatusBar, StyleSheet, Text, TextInput, View} from 'react-native';
import {
    Button,
    Body,
    Container,
    Content,
    Card,
    Header,
    Icon,
    Left,
    Right,
    Root,
    Image,
    Thumbnail,
    CardItem, ListItem
} from 'native-base';
import Modal, {ModalContent, SlideAnimation} from "react-native-modals";

const GETDOCOTRBYID = '/api/GetDoctorById'
export default class DetailsScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            token: null,
            baseUrl: null,
            selectedDoctor: null,
            progressModalVisible: false,
            doctor: null,
            photoDetection: ''
        }


    }

    onBackPressed() {
        this.props.navigation.goBack()
    }

    getInitialState() {
        return {
            region: {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            },
        };
    }

    onRegionChange(region) {
        this.setState({region});
    }

    goToReserveScreen() {

        this.props.navigation.navigate('ReserveScreen', {
            doctor: this.state.doctor
        });

    }

    async componentWillMount(): void {
        var token = await AsyncStorage.getItem('token');
        var baseUrl = await AsyncStorage.getItem('baseUrl')
        const doctor = this.props.navigation.getParam('doctor');
        await this.setState({baseUrl: baseUrl, token: token, selectedDoctor: doctor}, () => {
            this.getDoctorDetails()
        })
    }

    async getDoctorDetails() {
        this.setState({progressModalVisible: true})
        const value = this.state.selectedDoctor;
        let body = '{ title: ' + JSON.stringify(value.LastName) + ',id: ' + JSON.stringify(value.Id.toString()) + '}';
        await fetch(this.state.baseUrl + GETDOCOTRBYID, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(this.state.token)
            },
            body: body
        }).then((response) => response.json())
            .then(async (responseData) => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        await this.setState({progressModalVisible: false}, () => {
                            console.log(JSON.stringify(data))
                            this.setState({
                                doctor: data[0],
                            }, async () => {
                                // alert(JSON.stringify(this.state.doctor))
                            })
                        })
                    }
                } else {
                    this.setState({progressModalVisible: false}, () => {
                        alert(JSON.stringify('خطا در دسترسی به سرویس'))
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
                <StatusBar translucent backgroundColor={"#219e9e"} barStyle={"light-content"}/>

                <Header span style={styles.header}>
                    <Left>
                        <Button transparent style={styles.headerMenuIcon}
                                onPress={() => this.onBackPressed()}>
                            <Icon style={styles.headerMenuIcon} name='arrow-back'
                                  onPress={() => this.onBackPressed()}/>
                        </Button>
                    </Left>
                    <Right>
                        <Text style={styles.headerText}>اطلاعات بیشتر</Text>
                    </Right>
                </Header>
                <Root>
                    <Content padder style={styles.content}>

                        <Card style={{padding: 5, borderColor: '#23b9b9', elevation: 8, borderWidth: 1}}>
                            {!this.state.progressModalVisible && this.state.doctor != null &&
                            <CardItem style={{marginTop: 5}}>
                                <Left>
                                    {(this.state.doctor.Gender !== null && this.state.doctor.Gender !==
                                        'زن') ?
                                        <Thumbnail large style={{
                                            alignSelf: 'center',
                                            borderColor: '#c5c5c5',
                                            borderWidth: 1,
                                            padding: 2
                                        }}
                                                   defaultSource={require(
                                                       'D:\\E\\react native projects\\Health\\bare\\salamat\\assets\\images\\doctor.png')}
                                                   source={{uri: 'http://sshahresalem.tehran.ir/Portals/0/Image/1397/%D8%AE%D8%A8%D8%B1/hamayesh/roze%20pezeshk/3.JPG'}}/> :
                                        <Thumbnail large style={{
                                            alignSelf: 'center',
                                            borderColor: '#c5c5c5',
                                            borderWidth: 1,
                                            padding: 2
                                        }}
                                                   defaultSource={require(
                                                       'D:\\E\\react native projects\\Health\\bare\\salamat\\assets\\images\\veil.png')}
                                                   source={{uri: 'http://sshahresalem.tehran.ir/Portals/0/Image/1397/%D8%AE%D8%A8%D8%B1/hamayesh/roze%20pezeshk/3.JPG'}}/>}
                                    <Body style={{justifyContent: 'center', alignContent: 'center'}}>
                                        <Button bordered info style={{
                                            padding: 2,
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            backgroundColor: '#23b9b9',
                                            borderColor: '#23b9b9'
                                        }}
                                                onPress={() => {
                                                    this.goToReserveScreen()
                                                }}
                                        >
                                            <Text style={{color: '#fff',fontFamily:'IRANMarker'}}>رزرو نوبت</Text>
                                        </Button>
                                    </Body>
                                </Left>
                            </CardItem>}
                            {this.state.doctor != null &&
                            <CardItem style={{marginTop: 5}}>
                                <Left>
                                    <Body style={{justifyContent: 'flex-end', alignContent: 'flex-end'}}>
                                        {(this.state.doctor != null) && <Text style={{
                                            fontFamily:'IRANMarker',
                                            textAlign: 'right',
                                            alignSelf: 'flex-end',
                                            fontSize: 20,
                                            fontWeight: 'bold'
                                        }}>{this.state.doctor.FirstName != null ? this.state.doctor.FirstName :
                                            ''} {this.state.doctor.LastName != null ? this.state.doctor.LastName :
                                            ''}</Text>}
                                    </Body>
                                </Left>
                            </CardItem>}

                            {this.state.doctor != null &&
                            <CardItem style={{marginTop: 5}}>
                                <Left style={{justifyContent: 'flex-end', alignContent: 'flex-end'}}>
                                    <Text style={{
                                        fontFamily:'IRANMarker',
                                        textAlign: 'right',
                                        alignSelf: 'flex-end',
                                        fontSize: 13,
                                        padding: 1,
                                        margin: 1,
                                        color: '#000'
                                    }}>{this.state.doctor.Description ? this.state.doctor.Description : null}</Text>
                                </Left>
                            </CardItem>}

                            {this.state.doctor != null &&
                            <CardItem style={{marginTop: 2}}>
                                <Body>
                                    {this.state.doctor.Age != null && <Text style={{
                                        fontFamily:'IRANMarker',
                                        textAlign: 'right',
                                        alignSelf: 'flex-end',
                                        fontSize: 12,
                                        color: '#a7a7a7'
                                    }}> سن : {this.state.doctor.Age}</Text>}
                                </Body>
                            </CardItem>}

                            {this.state.doctor != null &&
                            <CardItem style={{marginTop: 2}}>
                                <Body>
                                    <Text style={{
                                        fontFamily:'IRANMarker',
                                        textAlign: 'right',
                                        alignSelf: 'flex-end',
                                        fontSize: 12,
                                        color: '#a7a7a7'
                                    }}> جنسیت : {this.state.doctor.Gender}
                                    </Text>
                                </Body>
                            </CardItem>}
                            {this.state.doctor != null &&
                            <CardItem style={{marginTop: 2}}>
                                <Body>
                                    {<Text style={{
                                        fontFamily:'IRANMarker',
                                        textAlign: 'right',
                                        alignSelf: 'flex-end',
                                        fontSize: 12,
                                        color: '#a7a7a7'
                                    }}> آخرین مدرک تحصیلی : {this.state.doctor.Certificate}</Text>}
                                </Body>
                            </CardItem>}
                            {this.state.doctor != null &&
                            <CardItem style={{marginTop: 2}}>
                                <Body style={{flexDirection: 'row-reverse'}}>
                                    <View>
                                        <Text style={{
                                            fontFamily:'IRANMarker',
                                            textAlign: 'right',
                                            fontSize: 14,
                                            color: '#a7a7a7',
                                            marginBottom: 1
                                        }}>تخصص ها : </Text>

                                        {this.state.doctor.Skills.map((item, key) => (
                                            <View key={key}>
                                                <Text style={{
                                                    fontFamily:'IRANMarker',
                                                    textAlign: 'right',
                                                    fontSize: 12,
                                                    margin: 1,
                                                    padding: 1,
                                                    color: '#a7a7a7'
                                                }}> - {item.Title ? item.Title : null}</Text>
                                            </View>
                                        ))}

                                    </View>
                                </Body>
                            </CardItem>}
                            {this.state.doctor != null &&
                            <CardItem style={{marginTop: 2}}>
                                <Body style={{flexDirection: 'row-reverse'}}>
                                    <View>
                                        <Text style={{
                                            fontFamily:'IRANMarker',
                                            textAlign: 'right',
                                            fontSize: 14,
                                            color: '#a7a7a7',
                                            marginBottom: 1
                                        }}>آدرس مراکز درمانی : </Text>

                                        {this.state.doctor.MedicalCenters.map((item, key) => (
                                            <View key={key}>
                                                <Text style={{
                                                    fontFamily:'IRANMarker',
                                                    textAlign: 'right',
                                                    fontSize: 12,
                                                    margin: 2,
                                                    padding: 1,
                                                    color: '#a7a7a7'
                                                }}> - {item.Title ? item.Title : null} : {item.Address ? item.Address :
                                                    null}</Text>
                                            </View>
                                        ))}

                                    </View>
                                </Body>
                            </CardItem>}
                        </Card>

                        <Modal style={{opacity: 0.7}}
                               width={300}
                               visible={this.state.progressModalVisible}
                               modalAnimation={new SlideAnimation({
                                   slideFrom: 'bottom'
                               })}
                        >
                            <ModalContent style={[styles.modalContent, {backgroundColor: 'rgba(47,246,246,0.02)'}]}>
                                <ActivityIndicator animating={true} size="small" color={"#23b9b9"}/>
                            </ModalContent>
                        </Modal>

                    </Content>
                </Root>
            </Container>

        );
    }
}


DetailsScreen.navigationOptions = {
    header: null,
    title: 'اطلاعات بیشتر',
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
        margin: 2,
        padding: 2,
        flexDirection: 'column'
    },
    headerMenuIcon: {
        fontSize: 30,
        padding: 5,
        color: '#fff',
    },
    headerText: {
        fontFamily:'IRANMarker',
        padding: 5,
        fontSize: 18,
        color: '#fff',

    },
    header: {
        backgroundColor: '#23b9b9'
    },
    footer: {
        backgroundColor: '#23b9b9'
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
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
    top: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#000'
    },
    bottom: {
        flex: 2,
        width: '100%',
        height: '100%',
        backgroundColor: 'red'
    }
});
