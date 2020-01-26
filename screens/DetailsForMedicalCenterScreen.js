import React, {Component} from 'react';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
    NativeModules
} from 'react-native';
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
    CardItem,
    Spinner
} from 'native-base';
import Modal, {ModalContent, SlideAnimation} from "react-native-modals";

const GETMEDICALCENTERBYID = '/api/GetMedicalCenterById';
const GETLOCATION = '/api/GetLocation';
const MySpinner = () => {
    return (
        <Spinner color={'#23b9b9'}/>
    );
}
export default class DetailsForMedicalCenterScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            id: null,
            title: null,
            description: null,
            contract: null,
            address: null,
            phoneNumber: null,
            morningStart: null,
            morningEnd: null,
            eveningStart: null,
            eveningEnd: null,
            nightStart: null,
            nightEnd: null,
            baseUrl: null,
            token: null,
            progressModalVisible: false,
            selectedMedicalCenter: null,
        }


    }

    async componentWillMount(): void {
        var token = await AsyncStorage.getItem('token');
        var baseUrl = await AsyncStorage.getItem('baseUrl')
        const medicalCenter = this.props.navigation.getParam('medicalCenter');
        console.log(JSON.stringify(this.props.navigation.state))
        await this.setState({baseUrl: baseUrl, token: token, selectedMedicalCenter: medicalCenter}, () => {
            this.getMedicalCenterDetails()
        })
    }


    async getLocation() {
        this.setState({progressModalVisible: true})
        const value = this.state.selectedMedicalCenter;
        let body = '{ Id: ' + JSON.stringify(value.Id) + ',Title:' +
            JSON.stringify(value.Title) + '}';
        console.log(body);
        await fetch(this.state.baseUrl + GETLOCATION, {
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
                        await this.setState({progressModalVisible: false}, async () => {
                            console.log((data.Latitude + ',' + data.Longitude))

                            await AsyncStorage.setItem("Latitude", data.Latitude)
                            await AsyncStorage.setItem("Longitude", data.Longitude)
                            // await AsyncStorage.setItem("Longitude", "51.425232")
                            // await AsyncStorage.setItem("Latitude", "35.715376")
                            // this.props.navigation.navigate('MapScreen')
                            NativeModules.NeshanFullScreenModule.navigateToNative(
                                data.Latitude, data.Longitude)

                        });

                    }
                } else {
                    this.setState({progressModalVisible: false}, () => {
                        // alert(JSON.stringify('خطا در دسترسی به سرویس'))
                        alert(JSON.stringify(responseData))
                    })

                }
            })
            .catch((error) => {
                console.error(error)
                // alert(error)
            })
    }

    onBackPressed() {
        let backRoute = this.props.navigation.getParam('backRoute')
        console.log(backRoute)
        if (backRoute === 'HomeScreen') {
            this.props.navigation.push('HomeScreen');
        } else {
            this.props.navigation.goBack(null)
        }
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

    async getMedicalCenterDetails() {
        this.setState({progressModalVisible: true})
        const value = this.state.selectedMedicalCenter;
        let body = '{ title: ' + JSON.stringify(value.Title) + ',id: ' + JSON.stringify(value.Id.toString()) + '}';
        await fetch(this.state.baseUrl + GETMEDICALCENTERBYID, {
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
                        this.setState({progressModalVisible: false}, () => {
                            this.setState({
                                id: data['Id'],
                                title: data['Title'],
                                description: data['Description'],
                                contract: data['Contract'],
                                address: data['Address'],
                                phoneNumber: data['PhoneNumber'],
                                morningStart: data['MorningStart'],
                                morningEnd: data['MorningEnd'],
                                eveningStart: data['EveningStart'],
                                eveningEnd: data['EveningEnd'],
                                nightStart: data['NightStart'],
                                nightEnd: data['NightEnd'],
                            })
                        })
                    }
                } else {
                    this.setState({progressModalVisible: false}, () => {
                        // alert(JSON.stringify('خطا در دسترسی به سرویس'))
                        alert(JSON.stringify(responseData))
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
                            {!this.state.progressModalVisible && <CardItem style={{marginTop: 5}}>
                                <Left>
                                    <Thumbnail circular
                                               large style={{
                                        alignSelf: 'center',
                                    }}

                                               resizeMethod={"resize"}

                                               defaultSource={require(
                                                   'D:\\E\\react native projects\\Health\\bare\\salamat\\assets\\images\\cross.png')}
                                               source={{uri: 'http://shsahresalem.tehrann.ir/Portals/0/UltraPhotoGallery/2633/206/2.sh%20(37).JPG'}}/>
                                    <Body style={{justifyContent: 'center', alignContent: 'center'}}>
                                        <Button bordered info style={{
                                            padding: 2,
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            backgroundColor: '#23b9b9',
                                            borderColor: '#23b9b9',
                                        }}
                                                onPress={async () => {
                                                     this.getLocation()
                                                    // NativeModules.NeshanFullScreenModule.navigateToNative(
                                                    //     this.state.selectedMedicalCenter.Id)
                                                    // NativeModules.NeshanFullScreenModule.test()

                                                }}
                                        >
                                            <Text style={{color: '#fff', fontFamily: 'IRANMarker',}}>مشاهده روی
                                                نقشه</Text>
                                        </Button>
                                    </Body>
                                </Left>
                            </CardItem>}

                            {(this.state.title != null && this.state.title !== '') ?
                                <CardItem style={{marginTop: 5}}>
                                    <Left>
                                        <Body>
                                            <Text style={{
                                                fontFamily: 'IRANMarker',
                                                textAlign: 'right',
                                                alignSelf: 'flex-end',
                                                fontSize: 20,
                                                fontWeight: 'bold',
                                                padding: 1
                                                // }}>{this.props.navigation.getParam('medicalCenter').Title}</Text>
                                            }}>{this.state.title}</Text>
                                        </Body>
                                    </Left>
                                </CardItem> : null}

                            {(this.state.description != null && this.state.description !==
                                '') ? <CardItem style={{marginTop: 5}}>
                                <Left>
                                    <Text style={{
                                        fontFamily: 'IRANMarker',
                                        flex: 1,
                                        justifyContent: 'flex-start',
                                        textAlign: 'right',
                                        flexDirection: 'row-reverse',
                                        fontSize: 13,
                                        color: '#000',
                                        padding: 1
                                    }}>
                                        {this.state.description}
                                    </Text>
                                </Left>
                            </CardItem> : null}

                            {(this.state.contract != null && this.state.contract !== '') ?
                                <CardItem style={{marginTop: 5}}>
                                    <Body>
                                        <Text style={{
                                            fontFamily: 'IRANMarker',
                                            textAlign: 'right',
                                            alignSelf: 'flex-end',
                                            fontSize: 12,
                                            color: '#a7a7a7',
                                            padding: 1
                                        }}>نوع مرکز : {this.state.contract}</Text>
                                    </Body>
                                </CardItem> : null}

                            {(this.state.address != null && this.state.address !== '') ?
                                <CardItem style={{marginTop: 5}}>
                                    <Body>
                                        <Text style={{
                                            fontFamily: 'IRANMarker',
                                            textAlign: 'right',
                                            alignSelf: 'flex-end',
                                            fontSize: 12,
                                            color: '#a7a7a7',
                                            padding: 1
                                        }}>آدرس : {this.state.address}</Text>
                                    </Body>
                                </CardItem> : null}


                            {(this.state.phoneNumber != null && this.state.phoneNumber !== '') ?
                                <CardItem style={{marginTop: 5}}>
                                    <Body>
                                        <Text style={{
                                            fontFamily: 'IRANMarker',
                                            textAlign: 'right',
                                            alignSelf: 'flex-end',
                                            fontSize: 12,
                                            color: '#a7a7a7',
                                            padding: 1
                                        }}>تلفن : {this.state.phoneNumber}</Text>
                                    </Body>
                                </CardItem> : null}

                            {(this.state.morningStart != null && this.state.morningEnd != null &&
                                this.state.morningEnd !== '' && this.state.morningStart != null) ?
                                <CardItem style={{marginTop: 5}}>
                                    <Body>
                                        <Text style={{
                                            fontFamily: 'IRANMarker',
                                            textAlign: 'right',
                                            alignSelf: 'flex-end',
                                            fontSize: 12,
                                            color: '#a7a7a7',
                                            padding: 1
                                        }}> ساعت کاری مرکز (شیفت صبح)
                                            : {this.state.morningStart} - {this.state.morningEnd}</Text>
                                    </Body>
                                </CardItem>
                                : null}
                            {(this.state.eveningStart != null && this.state.eveningEnd != null &&
                                this.state.eveningEnd !== '' && this.state.eveningStart != null) ?
                                <CardItem style={{marginTop: 5}}>
                                    <Body>
                                        <Text style={{
                                            fontFamily: 'IRANMarker',
                                            textAlign: 'right',
                                            alignSelf: 'flex-end',
                                            fontSize: 12,
                                            color: '#a7a7a7',
                                            padding: 1
                                        }}> ساعت کاری مرکز (شیفت عصر)
                                            : {this.state.eveningStart} - {this.state.eveningEnd}</Text>
                                    </Body>
                                </CardItem>
                                : null}
                            {(this.state.nightStart != null && this.state.nightEnd != null &&
                                this.state.nightEnd !== '' && this.state.nightStart != null) ?
                                <CardItem style={{marginTop: 5}}>
                                    <Body>
                                        <Text style={{
                                            fontFamily: 'IRANMarker',
                                            textAlign: 'right',
                                            alignSelf: 'flex-end',
                                            fontSize: 12,
                                            color: '#a7a7a7',
                                            padding: 1
                                        }}> ساعت کاری مرکز (شیفت شب)
                                            : {this.state.nightStart} - {this.state.nightEnd} </Text>
                                    </Body>
                                </CardItem>
                                : null}
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


DetailsForMedicalCenterScreen.navigationOptions = {
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
    },
    modalContent: {
        marginTop: 5,
        padding: 2,
        alignContent: 'center',
        backgroundColor: 'rgba(47,246,246,0.06)'
    }
});
