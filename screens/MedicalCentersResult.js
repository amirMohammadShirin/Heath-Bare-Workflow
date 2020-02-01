import React, {Component} from 'react';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
    StyleSheet,
    Text,
    Keyboard,
    View,
    ScrollView, Platform,
} from 'react-native';
import {

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
    CardItem,
    ListItem,
    Card,
    Badge,
    Thumbnail
} from 'native-base';
import Modal, {ModalButton, ModalContent, ModalFooter, ModalTitle, SlideAnimation} from "react-native-modals";


const SEARCHMEDICALCENTERALLFIELD = '/api/SearchMedicalCenterAllField';
const GETFAVORITEMEDICALCENTERS = '/api/GetFavoriteMedicalCenters';
export default class MedicalCentersResult extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedMedicalCenter: {},
            result: null,
            visible: false,
            Facility: null,
            Service: null,
            ServiceDetail: null,
            IsContract: null,
            props: props
        };


    }


    async goToDetailsScreen(value) {
        this.props.navigation.navigate('DetailsForMedicalCenterScreen', {medicalCenter: value, doctor: null})
    }

    // onSwipeLeft(gestureState) {
    //     alert('swipeleft')
    // }
    //
    // onSwipe(gestureName, gestureState) {
    //     const {SWIPE_LEFT} = swipeDirections;
    //     if (gestureName === SWIPE_LEFT) {
    //         alert('onswipe')
    //     }
    // }

    async componentWillMount(): void {
        var token = await AsyncStorage.getItem('token');
        var baseUrl = await AsyncStorage.getItem('baseUrl')
        var result = await this.props.navigation.getParam('result')
        var Facility = await this.props.navigation.getParam('Facility')
        var Service = await this.props.navigation.getParam('Service')
        var ServiceDetails = await this.props.navigation.getParam('ServiceDetails')
        var IsContract = await this.props.navigation.getParam('IsContract')
        await this.setState({
            baseUrl: baseUrl,
            token: token,
            result: result,
            Facility: Facility,
            Service: Service,
            ServiceDetails: ServiceDetails,
            IsContract: IsContract
        }, () => {
            // alert(JSON.stringify(this.state.filters))
        })

    }

    render() {
        const config = {
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80
        };
        return (
            <Container>
                <Header style={styles.header}>
                    <Left>
                        <Button transparent style={styles.headerMenuIcon}
                                onPress={() => {
                                    this.props.navigation.navigate('SearchMedicalCenter')
                                }}>
                            <Icon style={styles.headerMenuIcon} name='arrow-back'
                                  onPress={() => {
                                      this.props.navigation.navigate('SearchMedicalCenter')
                                  }}/>
                        </Button>
                    </Left>
                    <Right>
                        <Text style={styles.headerText}>نتایج جستجو</Text>
                    </Right>
                </Header>
                <Root>
                    <Content scrollEnabled={false} padder style={styles.content}>
                        {Platform.OS === 'android' &&
                        <StatusBar barStyle={"dark-content"} backgroundColor={'#209b9b'}
                                   hidden={false}/>
                        }
                        {
                            <Card>
                                <CardItem style={{flexDirection: 'row-reverse', justifyContent: 'flex-start'}}>
                                    <Right style={{flexDirection: 'row-reverse', justifyContent: 'flex-start'}}>
                                        <Text style={styles.filterText}>
                                            فیلتر ها
                                        </Text>
                                    </Right>
                                    {/*<CardItem style={{flexDirection: 'row-reverse'}}>*/}
                                    {/*    <Body style={{flexDirection: 'row-reverse',justifyContent:'flex-start'}}>*/}
                                    {/*    </Body>*/}
                                    {/*</CardItem>*/}
                                </CardItem>
                                <CardItem style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'stretch',
                                    flexWrap: 'wrap',
                                }}>

                                    {this.state.Facility != null && <Badge style={styles.badgeStyle}>
                                        <Text style={styles.badgeText}>{this.state.Facility}</Text>
                                    </Badge>}
                                    {this.state.Service != null && <Badge style={styles.badgeStyle}>
                                        <Text style={styles.badgeText}>{this.state.Service}</Text>
                                    </Badge>}
                                    {this.state.ServiceDetails != null && <Badge style={styles.badgeStyle}>
                                        <Text style={styles.badgeText}>{this.state.ServiceDetails}</Text>
                                    </Badge>}
                                    {this.state.IsContract != null && <Badge style={styles.badgeStyle}>
                                        <Text style={styles.badgeText}>{this.state.IsContract}</Text>
                                    </Badge>}

                                </CardItem>
                            </Card>
                        }

                        <ScrollView style={{flex: 1, width: '100%', height: '100%'}}>

                            {(this.state.result != null) ? this.state.result.map((item, key) => (
                                <View key={key} style={{borderBottomColor: '#e9e9e9', borderBottomWidth: 1}}>
                                    <ListItem avatar noBorder
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
                                                  Keyboard.dismiss()
                                                  this.setState({selectedMedicalCenter: item, visible: true})
                                              }
                                              }

                                    >
                                        <Body style={{height: '100%', marginRight: 5, alignSelf: 'center'}}>
                                            <Text style={{
                                                fontFamily:'IRANMarker',
                                                color: '#000',
                                                textAlign: 'right',
                                                fontSize: 15,
                                                marginRight: 1,
                                                marginTop: 5,

                                            }}>{item.Title}</Text>
                                            <Text style={{
                                                fontFamily:'IRANMarker',
                                                color: '#a9a9a9',
                                                textAlign: 'right',
                                                fontSize: 12,
                                                marginTop: 5,
                                                marginRight: 1
                                            }}>{item.Description}</Text>
                                        </Body>
                                        <Right>
                                            <Thumbnail circular
                                                       defaultSource={require(
                                                           'D:\\E\\react native projects\\Health\\bare\\salamat\\assets\\images\\cross.png')}
                                                       source={{uri: 'http://shashresalem.tehran.ir/Portals/0/UltraPhotoGallery/2633/206/2.sh%20(37).JPG'}}/>
                                        </Right>
                                    </ListItem>
                                </View>
                            )) : null}

                        </ScrollView>

                        <Modal
                            width={300}
                            onTouchOutside={() => {
                                this.setState({visible: false});
                            }}
                            visible={this.state.visible}
                            modalTitle={
                                <ModalTitle style={styles.modalTitle} textStyle={styles.modalTitleText}
                                            title={this.state.selectedMedicalCenter.Title}/>}
                            modalAnimation={new SlideAnimation({
                                slideFrom: 'bottom'
                            })}
                            footer={
                                <ModalFooter style={styles.modalFooter}>
                                    <ModalButton
                                        style={[styles.modalCancelButton]}
                                        textStyle={styles.modalCancelButtonText}
                                        text="جستجوی پزشک"
                                        onPress={async () => {
                                            this.setState({visible: false})
                                            this.props.navigation.navigate('SearchDoctorScreen',
                                                {medicalCenter: (this.state.selectedMedicalCenter)})
                                        }}
                                    />
                                    <ModalButton
                                        style={[styles.modalSuccessButton]}
                                        textStyle={[styles.modalSuccessButtonText]}
                                        text="اطلاعات بیشتر"
                                        onPress={async () => {
                                            await this.setState({visible: false})
                                            await this.goToDetailsScreen(this.state.selectedMedicalCenter)
                                        }
                                        }
                                    />
                                </ModalFooter>
                            }
                        >
                            <ModalContent style={styles.modalContent}>
                                <View>
                                    <Text style={[styles.modalCancelButtonText,
                                        {
                                            fontSize: 13,
                                            fontWeight: 'bold'
                                        }]}>{this.state.selectedMedicalCenter.Description != null ?
                                        this.state.selectedMedicalCenter.Description : ''}</Text>
                                </View>
                            </ModalContent>
                        </Modal>
                    </Content>
                </Root>
            </Container>
        );


    }
}
MedicalCentersResult.navigationOptions = ({navigation}) => ({
    gesturesEnabled: false,
    header: null,
    title: 'جستجوی مرکز درمانی',
    headerStyle: {
        backgroundColor: '#23b9b9'
    },
    headerTitleStyle: {
        color: '#fff',

    },
    headerLeft: null
});
const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: '#fff',
        margin: 5,
        padding: 5,
        paddingTop: 1,
        paddingBottom: 1,
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: '#e2e2e2'
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
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    },
    modalTitle: {
        backgroundColor: '#23b9b9',
    },
    modalTitleText: {
        fontFamily:'IRANMarker',
        color: '#fff',
        textAlign: 'right'
    },
    modalFooter: {
        padding: 2,
        backgroundColor: 'rgba(47,246,246,0.06)'
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 3,
        borderColor: '#23b9b9',
        borderWidth: 1,
        padding: 2,
        margin: 5
    },
    modalSuccessButton: {
        flex: 1,
        backgroundColor: '#23b9b9',
        borderRadius: 3,
        padding: 2,
        margin: 5
    },
    modalSuccessButtonText: {
        fontFamily:'IRANMarker',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'right'
    },
    modalCancelButtonText: {
        fontFamily:'IRANMarker',
        color: '#23b9b9',
        fontSize: 12,
        textAlign: 'right'
    },
    modalContent: {
        marginTop: 5,
        padding: 2,
        alignContent: 'center',
        backgroundColor: 'rgba(47,246,246,0.06)'
    },
    filterText: {
        fontFamily: 'IRANMarker',
        color: 'gray',
        textAlign: 'right',
        fontWeight: 'bold'
    },
    badgeStyle: {
        backgroundColor: '#23b9b9',
        elevation: 3,
        padding: 1,
        margin: 1
    },
    badgeText: {
        fontFamily: 'IRANMarker',
        color: '#fff',
    },
    titleStyle: {
        color: '#1f9292',
        fontSize: 13,
        textAlign: 'right'
    },
    rightIconStyle: {
        color: '#1f9292',
        fontSize: 15
    },
    items: {
        padding: 2,
        margin: 2,
    },
    card: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#23a5a5',
        borderRadius: 1,
        elevation: 8,
        margin: 2,
    },
    cardHeader: {
        borderWidth: 1,
        borderBottomColor: '#1f9292',
        borderColor: '#fff'
    },
    body: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center'
    }
});