import React, {Component} from 'react';
import {
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
import {
    Button,
    Body,
    Container,
    Content,
    Header,
    Icon,
    Left,
    Right,
    Root,
    CardItem,
    ListItem,
    Card,
    Badge,
    Thumbnail,
} from 'native-base';
import {Dialog} from 'react-native-simple-dialogs';
import DefaultMedicalCenterImage from "../component/DefaultMedicalCenterImage";

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
        };
    }

    async goToDetailsScreen(value) {
        this.props.navigation.navigate('DetailsForMedicalCenterScreen', {
            medicalCenter: value,
            doctor: null,
        });
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
        var Facility = await this.props.navigation.getParam('Facility');
        var Service = await this.props.navigation.getParam('Service');
        var ServiceDetails = await this.props.navigation.getParam('ServiceDetails');
        var IsContract = await this.props.navigation.getParam('IsContract');
        await this.setState(
            {
                baseUrl: baseUrl,
                token: token,
                result: result,
                Facility: Facility,
                Service: Service,
                ServiceDetails: ServiceDetails,
                IsContract: IsContract,
            },
            () => {
            },
        );
    }

    handleBackButtonClick() {
        console.log(JSON.stringify(this.props.navigation.state));

        if (this.props.navigation.state.isDrawerOpen) {
            this.props.navigation.closeDrawer();
        } else {
            if (!this.state.progressModalVisible) {
                if (this.state.visible) {
                    this.setState({visible: false});
                } else {
                    this.onBackPressed();
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
            directionalOffsetThreshold: 80,
        };
        return (
            <Container>
                <Header style={styles.header}>
                    <Left>
                        <Button
                            transparent
                            style={styles.headerMenuIcon}
                            onPress={() => {
                                this.props.navigation.navigate('SearchMedicalCenter');
                            }}>
                            <Icon
                                style={styles.headerMenuIcon}
                                name="arrow-back"
                                onPress={() => {
                                    this.props.navigation.navigate('SearchMedicalCenter');
                                }}
                            />
                        </Button>
                    </Left>
                    <Right>
                        <Text style={styles.headerText}>نتایج جستجو</Text>
                    </Right>
                </Header>
                <Root>
                    {this.state.Facility == null &&
                    this.state.Service == null &&
                    this.state.ServiceDetail == null &&
                    this.state.IsContract == null ? null : (
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
                                {this.state.Facility != null && (
                                    <Badge style={styles.badgeStyle}>
                                        <Text style={styles.badgeText}>{this.state.Facility}</Text>
                                    </Badge>
                                )}
                                {this.state.Service != null && (
                                    <Badge style={styles.badgeStyle}>
                                        <Text style={styles.badgeText}>{this.state.Service}</Text>
                                    </Badge>
                                )}
                                {this.state.ServiceDetails != null && (
                                    <Badge style={styles.badgeStyle}>
                                        <Text style={styles.badgeText}>
                                            {this.state.ServiceDetails}
                                        </Text>
                                    </Badge>
                                )}
                                {this.state.IsContract != null && (
                                    <Badge style={styles.badgeStyle}>
                                        <Text style={styles.badgeText}>
                                            {this.state.IsContract}
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
                                                this.setState({
                                                    selectedMedicalCenter: item,
                                                    visible: true,
                                                });
                                            }}>
                                            <Body
                                                style={{
                                                    height: '100%',
                                                    marginRight: 5,
                                                    alignSelf: 'center',
                                                }}>
                                                <Text style={styles.name}>{item.Title}</Text>
                                                <Text style={styles.description}>
                                                    {item.Description !== null &&
                                                    item.Description !== ''
                                                        ? item.Description
                                                        : 'توضیحات در مورد مرکز درمانی'}
                                                </Text>
                                            </Body>
                                            <Right>
                                                {item.Image != null &&
                                                typeof item.Image !== 'undefined' ? (
                                                    <Thumbnail
                                                        circular
                                                        large
                                                        style={{
                                                            //   borderWidth: 1,
                                                            //   borderColor: '#e0e0e0',
                                                            //   overflow: 'hidden',
                                                            height: 100,
                                                            width: 100,
                                                            resizeMode: 'cover',
                                                        }}
                                                        source={{
                                                            uri: 'data:image/png;base64, ' + this.state.image,
                                                        }}
                                                    />
                                                ) : (
                                                    <DefaultMedicalCenterImage myStyle={{
                                                        height: 70,
                                                        width: 70,
                                                        resizeMode: 'cover',
                                                    }}/>
                                                )}
                                            </Right>
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
                                                {this.state.selectedMedicalCenter.Title}
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
                                                {this.state.selectedMedicalCenter.Description != null
                                                    ? this.state.selectedMedicalCenter.Description
                                                    : ''}
                                            </Text>
                                        </Body>
                                    </CardItem>
                                    <CardItem footer style={{backgroundColor: '#fff'}}>
                                        <Body style={{flexDirection: 'row'}}>
                                            <Button
                                                style={styles.modalCancelButton}
                                                onPress={async () => {
                                                    this.setState({visible: false});
                                                    this.props.navigation.navigate('SearchDoctorScreen', {
                                                        medicalCenter: this.state.selectedMedicalCenter,
                                                    });
                                                }}>
                                                <Text style={styles.modalCancelButtonText}>
                                                    جستجوی پزشک
                                                </Text>
                                            </Button>
                                            <Button
                                                style={styles.modalSuccessButton}
                                                onPress={async () => {
                                                    await this.setState({visible: false});
                                                    await this.goToDetailsScreen(
                                                        this.state.selectedMedicalCenter,
                                                    );
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
MedicalCentersResult.navigationOptions = ({navigation}) => ({
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
        borderColor: '#e2e2e2',
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
    },
    modalTitleText: {
        fontFamily: 'IRANMarker',
        color: '#fff',
        textAlign: 'center',
        alignSelf: 'center',
    },
    modalFooter: {
        padding: 2,
        backgroundColor: 'rgba(47,246,246,0.06)',
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 3,
        borderColor: '#23b9b9',
        borderWidth: 1,
        padding: 2,
        margin: 5,
        justifyContent: 'center',
    },
    modalSuccessButton: {
        flex: 1,
        backgroundColor: '#23b9b9',
        borderRadius: 3,
        padding: 2,
        margin: 5,
        justifyContent: 'center',
    },
    modalSuccessButtonText: {
        fontFamily: 'IRANMarker',
        color: '#fff',
        fontWeight: 'bold',
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
        justifyContent: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
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
        fontSize: 13,
        marginTop: 10,
    },
    description: {
        fontFamily: 'IRANMarker',
        color: '#a9a9a9',
        textAlign: 'right',
        fontSize: 10,
        marginRight: 1,
        marginTop: 5,
    },
});
