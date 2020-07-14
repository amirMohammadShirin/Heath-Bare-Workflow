import React, {Component} from 'react';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
    StyleSheet,
    Text,
    Keyboard,
    View,
    ScrollView,
    Platform,
    BackHandler,
} from 'react-native';
import {Dialog} from 'react-native-simple-dialogs';
import {
    ActionSheet,
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
    List,
    Thumbnail,
} from 'native-base';
import Modal, {
    ModalButton,
    ModalContent,
    ModalFooter,
    ModalTitle,
    SlideAnimation,
} from 'react-native-modals';
import DefaultDoctorImage from "../component/DefaultDoctorImage";

export default class DoctorsResult extends Component {
    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        }
        this.state = {
            selectedDoctor: {},
            result: null,
            visible: false,
            Gender: null,
            Skill: null,
            Certificate: null,
        };
    }

    goToReserveScreen() {
        this.props.navigation.navigate('ReserveScreenFromDoctorScreen', {
            doctor: this.state.selectedDoctor,
        });
    }

    generateTitle(doctor) {
        if (doctor != null) {
            let title = doctor.FirstName + ' ' + doctor.LastName;
            return title;
        }
    }

    goToDetailsScreen(value) {
        this.props.navigation.navigate('DetailsScreen', {
            doctor: value,
            medicalCenter: null,
        });
    }

    handleBackButtonClick() {
        // alert('pressed')

        console.log(JSON.stringify(this.props.navigation.state));

        if (this.props.navigation.state.isDrawerOpen) {
            this.props.navigation.closeDrawer();
        } else {
            if (!this.state.visible) {
                this.onBackPressed();
            } else {
                this.setState({visible: false});
            }
        }
        return true;
    }

    async componentWillMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener(
                'hardwareBackPress',
                this.handleBackButtonClick,
            );
        }
        var token = await AsyncStorage.getItem('token');
        var baseUrl = await AsyncStorage.getItem('baseUrl');
        var result = await this.props.navigation.getParam('result');
        var Gender = await this.props.navigation.getParam('Gender');
        var Skill = await this.props.navigation.getParam('Skill');
        var Certificate = await this.props.navigation.getParam('Certificate');
        await this.setState(
            {
                baseUrl: baseUrl,
                token: token,
                result: result,
                Gender: Gender,
                Skill: Skill,
                Certificate: Certificate,
            },
            () => {
                console.log(JSON.stringify(this.state.result));
            },
        );
    }

    onBackPressed() {
        Keyboard.dismiss();
        if (
            typeof this.props.navigation.getParam('medicalCenter') !== 'undefined' ||
            typeof this.props.navigation.getParam('medicalCenter') != null
        ) {
            this.props.navigation.navigate('SearchDoctorScreen', {
                medicalCenter: typeof this.props.navigation.getParam('medicalCenter'),
            });
        } else {
            this.props.navigation.navigate('SearchDoctorScreen', {
            });
        }
    }

    render() {
        return (
            <Container>
                <Header style={styles.header}>
                    <Left>
                        <Button
                            transparent
                            style={styles.headerMenuIcon}
                            onPress={() => {
                                Keyboard.dismiss();
                                if (
                                    typeof this.props.navigation.getParam('medicalCenter') !==
                                    'undefined' ||
                                    typeof this.props.navigation.getParam('medicalCenter') != null
                                ) {
                                    this.props.navigation.navigate('SearchDoctorScreen', {
                                        medicalCenter: typeof this.props.navigation.getParam(
                                            'medicalCenter',
                                        ),
                                    });
                                } else {
                                    this.props.navigation.navigate('SearchDoctorScreen', {
                                    });
                                }
                            }}>
                            <Icon
                                style={styles.headerMenuIcon}
                                name="arrow-back"
                                onPress={() => {
                                    this.onBackPressed();
                                }}
                            />
                        </Button>
                    </Left>
                    <Right>
                        <Text style={[styles.headerText]}>نتایج جستجو</Text>
                    </Right>
                </Header>
                <Root>
                    {this.state.Gender == null &&
                    this.state.Skill === null &&
                    this.state.Certificate === null ? null : (
                        <Card>
                            <CardItem
                                style={{
                                    flexDirection: 'row-reverse',
                                    justifyContent: 'flex-start',
                                }}>
                                <Right
                                    style={{
                                        flexDirection: 'row-reverse',
                                        justifyContent: 'flex-start',
                                    }}>
                                    <Text style={styles.filterText}>فیلتر ها</Text>
                                </Right>
                            </CardItem>
                            <CardItem
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'stretch',
                                    flexWrap: 'wrap',
                                }}>
                                {this.state.Gender != null && (
                                    <Badge style={styles.badgeStyle}>
                                        <Text style={styles.badgeText}>{this.state.Gender}</Text>
                                    </Badge>
                                )}
                                {this.state.Skill != null && (
                                    <Badge style={styles.badgeStyle}>
                                        <Text style={styles.badgeText}>{this.state.Skill}</Text>
                                    </Badge>
                                )}
                                {this.state.Certificate != null && (
                                    <Badge style={styles.badgeStyle}>
                                        <Text style={styles.badgeText}>
                                            {this.state.Certificate}
                                        </Text>
                                    </Badge>
                                )}
                            </CardItem>
                        </Card>
                    )}
                    <Content scrollEnabled={true} padder style={styles.content}>
                        {Platform.OS === 'android' && (
                            <StatusBar
                                barStyle={'dark-content'}
                                backgroundColor={'#209b9b'}
                                hidden={false}
                            />
                        )}

                        <ScrollView style={{flex: 1, width: '100%', height: '100%'}}>
                            {this.state.result != null
                                ? this.state.result.map((item, key) => (
                                    <View
                                        key={key}
                                        style={{
                                            borderBottomColor: '#e9e9e9',
                                            borderBottomWidth: 1,
                                        }}>
                                        <ListItem
                                            avatar
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
                                                this.setState({selectedDoctor: item, visible: true});
                                            }}>
                                            <Body
                                                style={{
                                                    height: '100%',
                                                    marginRight: 5,
                                                    alignSelf: 'center',
                                                    flexDirection: 'column',
                                                }}>
                                                <Text style={styles.name}>
                                                    {this.generateTitle(item)}
                                                </Text>
                                                <Text style={styles.description}>
                                                    {item.Description !== null &&
                                                    item.Description !== ''
                                                        ? item.Description
                                                        : 'توضیحات در مورد پزشک'}
                                                </Text>
                                            </Body>
                                            {item.Gender !== 'زن' ? (
                                                <Right>
                                                    {(item.Image !== null) &&
                                                    (item.Image !== 'undefined') ?
                                                        <Thumbnail
                                                            circular
                                                            large
                                                            style={{
                                                                height: 70,
                                                                width: 70,
                                                                resizeMode: 'cover',
                                                            }}
                                                            source={{
                                                                uri:
                                                                    'data:image/png;base64, ' +
                                                                    item.Image
                                                            }}/>
                                                        :
                                                        <DefaultDoctorImage gender={'Man'}
                                                                            myStyle={{
                                                                                height: 70,
                                                                                width: 70,
                                                                                resizeMode: 'cover',
                                                                            }}
                                                        />
                                                    }
                                                </Right>
                                            ) : (
                                                <Right>
                                                    {(item.Image !== null) &&
                                                    (item.Image !== 'undefined') ?
                                                        <Thumbnail
                                                            circular
                                                            large
                                                            style={{
                                                                height: 70,
                                                                width: 70,
                                                                resizeMode: 'cover',
                                                            }}
                                                            source={{
                                                                uri:
                                                                    'data:image/png;base64, ' +
                                                                    item.Image
                                                            }}/>
                                                        :
                                                        <DefaultDoctorImage gender={'Woman'} myStyle={{
                                                            overflow: 'hidden',
                                                            height: 70,
                                                            width: 70,
                                                            resizeMode: 'cover',
                                                        }}/>
                                                    }
                                                </Right>
                                            )}
                                        </ListItem>
                                    </View>
                                ))
                                : null}
                        </ScrollView>

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
                                                {this.generateTitle(this.state.selectedDoctor)}
                                            </Text>
                                        </Body>
                                    </CardItem>
                                    <CardItem style={{backgroundColor: '#fff'}}>
                                        <Body
                                            style={{
                                                flexDirection: 'row-reverse',
                                            }}>
                                            <Text
                                                style={[
                                                    styles.modalCancelButtonText,
                                                    {
                                                        color: '#23b9b9',
                                                        fontSize: 10,
                                                        textAlign: 'right',
                                                    },
                                                ]}>
                                                {this.state.selectedDoctor.LastCertificate != null &&
                                                this.state.selectedDoctor.LastCertificate !== ''
                                                    ? this.state.selectedDoctor.LastCertificate
                                                    : ''}
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
                                                {this.state.selectedDoctor.Description != null &&
                                                this.state.selectedDoctor.Description !== ''
                                                    ? this.state.selectedDoctor.Description
                                                    : 'توضیحات در مورد پزشک'}
                                            </Text>
                                        </Body>
                                    </CardItem>
                                    <CardItem footer style={{backgroundColor: '#fff'}}>
                                        <Body style={{flexDirection: 'row'}}>
                                            <Button
                                                style={styles.modalCancelButton}
                                                onPress={() => {
                                                    this.setState({visible: false}, () => {
                                                        this.goToReserveScreen();
                                                    });
                                                }}>
                                                <Text style={styles.modalCancelButtonText}>
                                                    رزرو نوبت
                                                </Text>
                                            </Button>
                                            <Button
                                                style={styles.modalSuccessButton}
                                                onPress={() => {
                                                    this.setState({visible: false});
                                                    this.goToDetailsScreen(this.state.selectedDoctor);
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
                    </Content>
                </Root>
            </Container>
        );
    }
}
DoctorsResult.navigationOptions = {
    gesturesEnabled: false,
    header: null,
    title: 'جستجوی مرکز درمانی',
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
        margin: 5,
        padding: 5,
        paddingTop: 1,
        paddingBottom: 1,
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: '#e2e2e2',
    },
    headerMenuIcon: {
        padding: 5,
        color: '#fff',
        fontSize: 30,
    },
    headerText: {
        padding: 5,
        fontSize: 18,
        fontFamily: 'IRANMarker',
        color: '#fff',
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
        justifyContent: 'center',
    },
    modalTitleText: {
        fontFamily: 'IRANMarker',
        color: '#fff',
        textAlign: 'center',
        alignSelf: 'center'
    },
    modalFooter: {
        padding: 2,
        backgroundColor: 'rgba(47,246,246,0.06)',
    },
    modalCancelButton: {
        fontFamily: 'IRANMarker',
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 3,
        borderColor: '#23b9b9',
        borderWidth: 1,
        padding: 2,
        margin: 5,
        justifyContent: 'center'
    },
    modalSuccessButton: {
        flex: 1,
        backgroundColor: '#23b9b9',
        borderRadius: 3,
        padding: 2,
        margin: 5,
        justifyContent: 'center'
    },
    modalSuccessButtonText: {
        fontFamily: 'IRANMarker',
        color: '#fff',
        fontSize: 10,
        textAlign: 'center',
    },
    modalCancelButtonText: {
        fontFamily: 'IRANMarker',
        color: '#23b9b9',
        fontSize: 10,
        textAlign: 'center',
    },


    modalContent: {
        marginTop: 5,
        padding: 2,
        alignContent: 'center',
        backgroundColor: 'rgba(47,246,246,0.06)',
    },
    filterText: {
        fontFamily: 'IRANMarker',
        color: 'gray',
        textAlign: 'right',
        fontWeight: 'bold',
    },
    badgeStyle: {
        backgroundColor: '#23b9b9',
        elevation: 3,
        padding: 1,
        margin: 1,
    },
    badgeText: {
        color: '#fff',
        fontSize: 13,
    },
    titleStyle: {
        color: '#1f9292',
        fontSize: 13,
        textAlign: 'right',
    },
    rightIconStyle: {
        color: '#1f9292',
        fontSize: 15,
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
        borderColor: '#fff',
    },
    body: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
    },
    name: {
        fontFamily: 'IRANMarker',
        color: '#000',
        textAlign: 'right',
        fontSize: 15,
        marginTop: 10,
    },
    description: {
        fontFamily: 'IRANMarker',
        color: '#a9a9a9',
        textAlign: 'right',
        fontSize: 12,
        marginRight: 1,
        marginTop: 5,
    },
});
