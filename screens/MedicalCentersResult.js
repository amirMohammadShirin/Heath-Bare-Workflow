import React, {Component} from 'react';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
    StyleSheet,
    Text,
    Keyboard,
    View,
    ScrollView, Platform, BackHandler,
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
const cross = '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';
export default class MedicalCentersResult extends Component {

    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        }
        this.state = {
            selectedMedicalCenter: {},
            result: null,
            visible: false,
            Facility: null,
            Service: null,
            ServiceDetail: null,
            IsContract: null,
            props: props,
            crossImage: null,
            imageObject:null
        };


    }


    async goToDetailsScreen(value) {
        this.props.navigation.navigate('DetailsForMedicalCenterScreen', { medicalCenter: value, doctor: null,imageObject:this.state.imageObject })
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
        let image = this.props.navigation.getParam('imageObject');
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        }
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
            IsContract: IsContract,
            imageObject:image
        }, () => {
            // alert(JSON.stringify(this.state.filters))
        })

    }

    handleBackButtonClick() {
        // alert('pressed')

        console.log(JSON.stringify(this.props.navigation.state))

        if (this.props.navigation.state.isDrawerOpen) {
            this.props.navigation.closeDrawer()
        } else {

            if (!this.state.progressModalVisible) {
                if (this.state.visible) {
                    this.setState({ visible: false })
                } else {
                    this.onBackPressed()
                }
            }

        }
        return true;
    }

    onBackPressed() {
        this.props.navigation.goBack(null);
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
                                this.props.navigation.navigate('SearchMedicalCenter',{imageObject:this.state.imageObject})
                            }}>
                            <Icon style={styles.headerMenuIcon} name='arrow-back'
                                onPress={() => {
                                    this.props.navigation.navigate('SearchMedicalCenter',{imageObject:this.state.imageObject})
                                }} />
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
                                            this.setState({ selectedMedicalCenter: item, visible: true })
                                        }
                                        }

                                    >
                                        <Body style={{height: '100%', marginRight: 5, alignSelf: 'center'}}>
                                            <Text style={{
                                                fontFamily: 'IRANMarker',
                                                color: '#000',
                                                textAlign: 'right',
                                                fontSize: 15,
                                                marginRight: 1,
                                                marginTop: 5,

                                            }}>{item.Title}</Text>
                                            <Text style={{
                                                fontFamily: 'IRANMarker',
                                                color: '#a9a9a9',
                                                textAlign: 'right',
                                                fontSize: 12,
                                                marginTop: 5,
                                                marginRight: 1
                                            }}>{item.Description}</Text>
                                        </Body>
                                        <Right>
                                        <Thumbnail circular
                                                  source={{ uri: (item.image!=null && typeof item.image !== 'undefined') ? item.image : this.state.imageObject.cross }}
                                                  //    defaultSource={{uri: 'data:image/png;base64,'+cross}}
                                            />
                                             </Right>
                                    </ListItem>
                                </View>
                            )) : null}

                        </ScrollView>

                        <Modal
                            width={300}
                            onTouchOutside={() => {
                                this.setState({ visible: false });
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
                                            this.setState({ visible: false })
                                            this.props.navigation.navigate('SearchDoctorScreen',
                                                { medicalCenter: (this.state.selectedMedicalCenter) , imageObject:this.state.imageObject })
                                        }}
                                    />
                                    <ModalButton
                                        style={[styles.modalSuccessButton]}
                                        textStyle={[styles.modalSuccessButtonText]}
                                        text="اطلاعات بیشتر"
                                        onPress={async () => {
                                            await this.setState({ visible: false })
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
        fontFamily: 'IRANMarker',
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
        fontFamily: 'IRANMarker',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'right'
    },
    modalCancelButtonText: {
        fontFamily: 'IRANMarker',
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
        color: '#fff',
        fontSize: 13
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