import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    AsyncStorage,
    Keyboard,
    Alert, Platform, BackHandler
} from 'react-native';
import {
    Container,
    Header,
    Content,
    CardItem,
    Button,
    Left,
    Card,
    Right,
    Body,
    Icon,
    Text,
    Thumbnail,
    Badge,
    Root,
    ListItem,
    ActionSheet,
} from 'native-base';
import Modal, {ModalButton, ModalContent, ModalFooter, ModalTitle, SlideAnimation} from "react-native-modals";
import {NavigationActions} from "react-navigation";

const GETNOTICES = '/api/GetNotices';
const GETSERVICEPLANDETAIL = '/api/SearchServicePlanDetail';
const CANCEL_TEXT = 'انصراف';
const RESERVE = '/api/Reserve';

export default class ServicePlanResult extends Component {

    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        }
        this.state = {
            animate: true,
            progressModalVisible: false,
            token: null,
            baseUrl: null,
            notices: null,
            result: [],
            medicalCenterSearchWord: null,
            doctorSearchWord: null,
            skill: null,
            gender: null,
            startDate: null,
            endDate: null,
            selectedServicePlan: {},
            visible: false,
            modalContent: {},
            medicalCanters: [],
            days: [],
            times: [],
            selectedMedicalCenter: {Id: -100, Value: ' انتخاب مرکز درمانی'},
            selectedDay: {id: -100, value: ' انتخاب روز', Day: {}},
            selectedTime: {id: -100, value: 'انتخاب ساعت'},
            activeColor: '#23b9b9',
            inactiveColor: '#aaaaaa',
            reservationButtonColor: '#aaaaaa'
        }
    }


    handleBackButtonClick() {
        // alert('pressed')

        console.log(JSON.stringify(this.props.navigation.state))

        if (this.props.navigation.state.isDrawerOpen) {
            this.props.navigation.closeDrawer()
        } else {

            if (this.state.visible) {
                this.setState({visible: false})
            } else if (!this.state.progressModalVisible) {
                this.onBackPressed()
            }

        }
        return true;
    }

    async componentWillMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        }
        var token = await AsyncStorage.getItem('token');
        var baseUrl = await AsyncStorage.getItem('baseUrl');
        var result = await this.props.navigation.getParam('result');
        console.log(JSON.stringify(result));
        var medicalCenterSearchWord = await this.props.navigation.getParam('medicalCenterSearchWord')
        var doctorSearchWord = await this.props.navigation.getParam('doctorSearchWord')
        var skill = await this.props.navigation.getParam('skill')
        var gender = await this.props.navigation.getParam('gender')
        var startDate = await this.props.navigation.getParam('startDate')
        var endDate = await this.props.navigation.getParam('endDate')
        this.setState({
            baseUrl: baseUrl,
            token: token,
            result: result,
            medicalCenterSearchWord: medicalCenterSearchWord,
            doctorSearchWord: doctorSearchWord,
            skill: skill,
            gender: gender,
            startDate: startDate,
            endDate: endDate
        }, () => {
            // this.getNotices()
        })

    }

    async reserve(body) {
        this.setState({progressModalVisible: true/*, selectedMedicalCenter: null, selectedDay: null*/})
        console.log(JSON.stringify(body))
        await fetch(this.state.baseUrl + RESERVE, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(this.state.token)
            },
            body: JSON.stringify(body),
        }).then((response) => response.json())
            .then(async (responseData) => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        console.log("Data ----->  " + JSON.stringify(data))
                        await this.setState({progressModalVisible: false}, async () => {
                            Alert.alert(
                                data['Message'],
                                '',
                                [
                                    {
                                        text: "تایید", onPress: async () => {
                                            await this.closeModal()
                                        }
                                    }
                                ],
                                {
                                    cancelable: false,
                                }
                            )
                        })
                    }

                } else if (responseData['StatusCode'] === 701) {
                    this.setState({progressModalVisible: false}, () => {
                        alert(responseData['StatusMessage'])
                        console.log(JSON.stringify(responseData))
                        this.closeModal()
                    })

                } else if (responseData['StatusCode'] === 700) {
                    this.setState({progressModalVisible: false}, () => {
                        alert(responseData['StatusMessage'])
                        console.log(JSON.stringify(responseData))
                        this.closeModal()
                    })
                } else {
                    this.setState({progressModalVisible: false}, () => {
                        alert('خطا در اتصال به سرویس')
                        console.log(JSON.stringify(responseData))
                        this.closeModal()
                    })
                }
            })
            .catch((error) => {
                console.error(error)
                // alert(error)
            })
    }

    async generateReservationButton() {
        if (this.state.selectedMedicalCenter.Id === -100) {
            await this.setState({reservationButtonColor: this.state.inactiveColor}, () => {
                alert('لطفا مرکز درمانی مورد نظر خود را انتخاب کنید')

            })
            return false;
        }
        if (this.state.selectedServicePlan.ActorId === null) {
            await this.setState({reservationButtonColor: this.state.inactiveColor}, () => {
                alert('پزشک به درستی انتخاب نشده است')

            })
            return false;
        }
        if (this.state.selectedDay.Id === -100) {
            await this.setState({reservationButtonColor: this.state.inactiveColor}, () => {
                alert('روز مورد نظر خود را انتخاب کنید')

            })
            return false;
        }
        if (this.state.selectedTime.Id === -100) {
            await this.setState({reservationButtonColor: this.state.inactiveColor}, () => {
                alert('ساعت مورد نظر خود را انتخاب کنید')

            })
            return false;
        }
        await this.setState({reservationButtonColor: this.state.activeColor})
        return true;

    }

    generateDayTitle(day) {
        return day.Day.PersianDayName + '  ' + day.Day.PersianDate.substring(0, 10)
    }

    closeModal() {
        this.setState({
            visible: false,
            medicalCanters: [],
            days: [],
            times: [],
            selectedMedicalCenter: {Id: -100, Value: ' انتخاب مرکز درمانی'},
            selectedDay: {id: -100, value: ' انتخاب روز', Day: {}},
            selectedTime: {id: -100, value: 'انتخاب ساعت'}
        })
    }

    getMedicalCenterOptions(array) {
        let options = [];
        for (let item of array) {
            options.push(item.Value)
        }
        options.push(CANCEL_TEXT)
        return options;
    }

    getTimeOptions(array) {
        let options = [];
        for (let item of array) {
            if (item.Valid) {
                options.push(item.TimeSlice.substring(0, 5))
            }
        }
        options.push(CANCEL_TEXT)
        return options;
    }

    getDayOptions(array) {
        let options = [];
        for (let item of array) {
            options.push(this.generateDayTitle(item))
        }
        options.push(CANCEL_TEXT)
        return options;
    }


    getCancelButtonIndex(array) {
        return array.indexOf(CANCEL_TEXT)
    }

    async getServicePlanDetail(doctorId, medicalCenterId, startDate, endDate) {
        let body = {
            DoctorId: doctorId,
            MedicalCenterId: medicalCenterId,
            StartDate: startDate,
            EndDate: endDate
        }
        console.log("detaaaiiiiiil" + JSON.stringify(body))
        this.setState({progressModalVisible: true})
        await fetch(this.state.baseUrl + GETSERVICEPLANDETAIL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(this.state.token)
            },
            body: JSON.stringify(body),
        }).then((response) => response.json())
            .then(async (responseData) => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        console.log("Data ----->  " + JSON.stringify(data))
                        await this.setState({progressModalVisible: false}, async () => {
                            await this.setState({days: data}, () => {
                                console.log(JSON.stringify(this.state.days + this.state.days.length))
                                if (this.state.days.length <= 0) {
                                    Alert.alert(
                                        "روز خالی جهت نوبت دهی در این درمانگاه وجود ندارد",
                                        '',
                                        [
                                            {
                                                text: "بازگشت", onPress: async () => {
                                                    await this.closeModal()
                                                }
                                            }
                                        ],
                                        {
                                            cancelable: false,
                                        }
                                    )
                                }

                            })
                        })
                    }

                } else {
                    this.setState({progressModalVisible: false}, () => {
                        alert('خطا در اتصال به سرویس')
                        console.log(JSON.stringify(responseData))
                    })

                }
            })
            .catch((error) => {
                console.error(error)
                // alert(error)
            })
    }

    onBackPressed() {
        //this.props.navigation.navigate('ReserveScreen')
        // this.props.navigation.dispatch('ReserveScreen')
        // const navigateAction = NavigationActions.navigate({
        //     routeName: 'ServicePlanResultScreen',
        //     params: {},
        //
        //     // navigate can have a nested navigate action that will be run inside the child router
        //     action: NavigationActions.navigate({routeName: 'ReserveScreen'}),
        // });
        // this.props.navigation.dispatch(navigateAction);
        this.props.navigation.push('ReserveScreen');
    }


    findDay(input) {
        let options = [];
        for (let item of this.state.days) {
            if (item.Day.PersianDayName + '  ' + item.Day.PersianDate.substring(0, 10) === input) {
                return Day;
            }
        }
    }

    render() {
        return (
            <Container>
                <Header style={{backgroundColor: '#23b9b9'}}>
                    <Left>
                        <Button transparent style={styles.headerMenuIcon}
                                onPress={() => this.onBackPressed()}>
                            <Icon style={styles.headerMenuIcon} name='arrow-back'
                                  onPress={() => this.onBackPressed()}/>
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
                        <Card>
                            <CardItem style={{flexDirection: 'row-reverse', justifyContent: 'flex-start'}}>
                                <Right style={{flexDirection: 'row-reverse', justifyContent: 'flex-start'}}>
                                    <Text style={styles.filterText}>
                                        فیلتر ها
                                    </Text>
                                </Right>
                            </CardItem>
                            <CardItem style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignContent: 'stretch',
                                flexWrap: 'wrap',
                            }}>

                                {this.state.medicalCenterSearchWord != null && <Badge style={styles.badgeStyle}>
                                    <Text style={styles.badgeText}>{this.state.medicalCenterSearchWord}</Text>
                                </Badge>}
                                {this.state.doctorSearchWord != null && <Badge style={styles.badgeStyle}>
                                    <Text style={styles.badgeText}>{this.state.doctorSearchWord}</Text>
                                </Badge>}
                                {this.state.skill != null && <Badge style={styles.badgeStyle}>
                                    <Text style={styles.badgeText}>{this.state.skill}</Text>
                                </Badge>}
                                {this.state.gender != null && <Badge style={styles.badgeStyle}>
                                    <Text style={styles.badgeText}>{this.state.gender}</Text>
                                </Badge>}
                                {this.state.startDate != null && <Badge style={styles.badgeStyle}>
                                    <Text style={styles.badgeText}>{this.state.startDate.format('jYYYY-jM-jD')}</Text>
                                </Badge>}
                                {this.state.endDate != null && <Badge style={styles.badgeStyle}>
                                    <Text style={styles.badgeText}>{this.state.endDate.format('jYYYY-jM-jD')}</Text>
                                </Badge>}

                            </CardItem>
                        </Card>
                        <ScrollView style={{flex: 1, width: '100%', height: '100%'}}>

                            {(this.state.result != null) ? this.state.result.map((item, key) => (
                                <View key={key} style={{borderBottomColor: '#e9e9e9', borderBottomWidth: 1}}>
                                    <TouchableOpacity>
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
                                                  onPress={async () => {
                                                      if (item.MedicalCenters.length === 1) {
                                                          await this.setState({
                                                              selectedServicePlan: item,
                                                              medicalCanters: item.MedicalCenters,
                                                              selectedMedicalCenter: item.MedicalCenters[0],
                                                          }, async () => {
                                                              await this.getServicePlanDetail(
                                                                  this.state.selectedServicePlan.DoctorId,
                                                                  this.state.selectedMedicalCenter.Id,
                                                                  this.state.startDate,
                                                                  this.state.endDate
                                                              ).then(this.state.days.length > 0)
                                                              {
                                                                  this.setState({visible: true})
                                                              }
                                                          })
                                                      } else {
                                                          await this.setState({
                                                              selectedServicePlan: item,
                                                              medicalCanters: item.MedicalCenters,
                                                              visible: true
                                                          })
                                                      }
                                                  }
                                                  }

                                        >
                                            <Body
                                                style={{height: '100%', marginRight: 5, alignSelf: 'center', flex: 1}}>
                                                <Text style={{
                                                    color: '#000',
                                                    textAlign: 'right',
                                                    fontSize: 15,
                                                    marginRight: 1,
                                                    marginTop: 5,

                                                }}>{item.Doctor}</Text>
                                                {item.Description != "" ? <Text style={{
                                                        color: '#a9a9a9',
                                                        textAlign: 'right',
                                                        fontSize: 12,
                                                        marginTop: 5,
                                                        marginRight: 1
                                                    }}>{item.Description}</Text> :
                                                    <Text style={{
                                                        color: '#a9a9a9',
                                                        textAlign: 'right',
                                                        fontSize: 12,
                                                        marginTop: 5,
                                                        marginRight: 1
                                                    }}>توضیحات در مورد پزشک</Text>}
                                            </Body>
                                            <Right>
                                                {item.Gender == 12 ? <Thumbnail
                                                        style={{
                                                            borderColor: '#c5c5c5',
                                                            borderWidth: 1,
                                                            padding: 2
                                                        }}
                                                        circular
                                                        defaultSource={require(
                                                            'D:\\E\\react native projects\\Health\\bare\\salamat\\assets\\images\\veil.png')}
                                                        source={{uri: 'http://shsahresalem.tehran.ir/Portals/0/Image/1397/%D8%AE%D8%A8%D8%B1/hamayesh/roze%20pezeshk/3.JPG'}}/> :
                                                    <Thumbnail
                                                        style={{
                                                            borderColor: '#c5c5c5',
                                                            borderWidth: 1,
                                                            padding: 2
                                                        }}
                                                        circular
                                                        defaultSource={require(
                                                            'D:\\E\\react native projects\\Health\\bare\\salamat\\assets\\images\\doctor.png')}
                                                        source={{uri: 'http://shsahresalem.tehran.ir/Portals/0/Image/1397/%D8%AE%D8%A8%D8%B1/hamayesh/roze%20pezeshk/3.JPG'}}/>
                                                }

                                            </Right>
                                        </ListItem>
                                    </TouchableOpacity>
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

                        <Modal
                            width={300}
                            onTouchOutside={async () => {
                                await this.closeModal()
                            }}
                            visible={this.state.visible}
                            modalTitle={
                                <ModalTitle style={styles.modalTitle} textStyle={styles.modalTitleText}
                                            title={this.state.selectedServicePlan.Doctor != null ?
                                                this.state.selectedServicePlan.Doctor : null}/>}
                            modalAnimation={new SlideAnimation({
                                slideFrom: 'bottom'
                            })}
                            footer={
                                <ModalFooter style={styles.modalFooter}>
                                    <TouchableOpacity
                                        style={[styles.modalCancelButton, {
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignContent: 'center'
                                        }]}
                                        // textStyle={[styles.modalCancelButtonText]}
                                        // text="انصراف"
                                        onPress={async () => {
                                            await this.closeModal()
                                        }
                                        }
                                    >
                                        <Text style={[styles.modalCancelButtonText,
                                            {alignSelf: 'center', textAlignVertical: 'center',fontFamily:'IRANMarker'}]}>انصراف</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalSuccessButton, {
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignContent: 'center'
                                        }]}
                                        //textStyle={styles.modalSuccessButtonText}
                                        //text="رزرو نوبت"
                                        onPress={() => {

                                            if (this.state.selectedMedicalCenter.Id === -100) {
                                                this.setState({reservationButtonColor: this.state.inactiveColor},
                                                    () => {
                                                        alert('لطفا مرکز درمانی مورد نظر خود را انتخاب کنید')

                                                    })
                                                return;
                                            }
                                            if (this.state.selectedServicePlan.ActorId === null) {
                                                this.setState({reservationButtonColor: this.state.inactiveColor},
                                                    () => {
                                                        alert('پزشک به درستی انتخاب نشده است')

                                                    })
                                                return
                                            }
                                            if (this.state.selectedDay.Id === -100) {
                                                this.setState({reservationButtonColor: this.state.inactiveColor},
                                                    () => {
                                                        alert('روز مورد نظر خود را انتخاب کنید')

                                                    })
                                                return
                                            }
                                            if (this.state.selectedTime.Id === -100) {
                                                this.setState({reservationButtonColor: this.state.inactiveColor},
                                                    () => {
                                                        alert('ساعت مورد نظر خود را انتخاب کنید')

                                                    })
                                                return
                                            }

                                            let body = {
                                                MedicalCenterId: this.state.selectedMedicalCenter.Id.toString(),
                                                ActorId: this.state.selectedServicePlan.DoctorId.toString(),
                                                ReserveDate: this.state.selectedDay.Day.Day.Date.toString()
                                                    .substring(0, 9),
                                                StartTime: this.state.selectedTime.value.toString()
                                            }
                                            this.reserve(body)
                                            console.log(JSON.stringify(body))
                                        }

                                        }
                                    >
                                        <Text style={styles.modalSuccessButtonText}>رزرو نوبت</Text>
                                    </TouchableOpacity>
                                </ModalFooter>
                            }
                        >
                            <ModalContent style={styles.modalContent}>
                                {this.state.medicalCanters.length > 0 && <View style={{minHeight: 60, maxHeight: 65}}>
                                    {this.state.selectedMedicalCenter.Id === -100 ? <Button
                                            onPress={() => {
                                                Keyboard.dismiss()
                                                ActionSheet.show(
                                                    {
                                                        options: this.getMedicalCenterOptions(this.state.medicalCanters),
                                                        cancelButtonIndex: this.getCancelButtonIndex(
                                                            this.getMedicalCenterOptions(this.state.medicalCanters)),
                                                        title: "انتخاب مرکز درمانی"
                                                    },
                                                    buttonIndex => {
                                                        if (this.state.medicalCanters.length > 0) {
                                                            if (buttonIndex <= this.state.medicalCanters.length - 1)
                                                                this.setState(
                                                                    {selectedMedicalCenter: this.state.medicalCanters[buttonIndex]},
                                                                    async () => {
                                                                        await this.getServicePlanDetail(
                                                                            this.state.selectedServicePlan.DoctorId,
                                                                            this.state.selectedMedicalCenter.Id,
                                                                            this.state.startDate,
                                                                            this.state.endDate
                                                                        )
                                                                    });
                                                        }
                                                    }
                                                )
                                            }}
                                            bordered style={{
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 2,
                                            margin: 1,
                                            flex: 3,
                                            borderWidth: 1,
                                            borderColor: '#fff',

                                        }}>
                                            <Text style={{
                                                fontFamily:'IRANMarker',
                                                padding: 1,
                                                textAlign: 'center',
                                                borderRadius: 2,
                                                flex: 2,
                                                fontSize: 13,
                                                color: '#23b9b9',
                                                borderWidth: 1,
                                                borderColor: '#23b9b9',

                                            }}>{this.state.selectedMedicalCenter.Value}</Text>
                                        </Button> :
                                        <Button

                                            bordered style={{
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 2,
                                            margin: 1,
                                            flex: 3,
                                            borderWidth: 1,
                                            borderColor: '#fff',

                                        }}>
                                            <Text style={{
                                                fontFamily:'IRANMarker',
                                                padding: 1,
                                                textAlign: 'center',
                                                borderRadius: 2,
                                                flex: 2,
                                                fontSize: 13,
                                                color: '#23b9b9',
                                                borderWidth: 1,
                                                borderColor: '#23b9b9',

                                            }}>{this.state.selectedMedicalCenter.Value}</Text>
                                        </Button>
                                    }
                                </View>}
                                {this.state.selectedMedicalCenter.Id != -100 && this.state.days.length > 0 &&
                                <View style={{minHeight: 60, maxHeight: 65}}>
                                    <Button
                                        onPress={() => {
                                            Keyboard.dismiss()
                                            ActionSheet.show(
                                                {
                                                    options: this.getDayOptions(this.state.days),
                                                    cancelButtonIndex: this.getCancelButtonIndex(
                                                        this.getDayOptions(this.state.days)),
                                                    title: "انتخاب روز"
                                                },
                                                buttonIndex => {
                                                    if (this.state.days.length > 0) {
                                                        if (buttonIndex <= this.state.days.length - 1)
                                                            this.setState(
                                                                {
                                                                    selectedDay: {
                                                                        id: 0,
                                                                        value: this.generateDayTitle(
                                                                            this.state.days[buttonIndex]),
                                                                        Day: this.state.days[buttonIndex]
                                                                    }
                                                                }, () => {
                                                                    this.setState(
                                                                        {times: this.state.selectedDay.Day.Times})
                                                                });
                                                    }
                                                }
                                            )
                                        }}
                                        bordered style={{
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        margin: 1,
                                        flex: 3,
                                        borderWidth: 1,
                                        borderColor: '#fff',

                                    }}>
                                        <Text style={{
                                            fontFamily:'IRANMarker',
                                            padding: 1,
                                            textAlign: 'center',
                                            borderRadius: 2,
                                            flex: 2,
                                            fontSize: 13,
                                            color: '#23b9b9',
                                            borderWidth: 1,
                                            borderColor: '#23b9b9',

                                        }}>{this.state.selectedDay.value}</Text>
                                    </Button>
                                </View>}
                                {this.state.selectedTime.id != 100 && this.state.times.length > 0 &&
                                <View style={{minHeight: 60, maxHeight: 65}}>
                                    <Button
                                        onPress={() => {
                                            Keyboard.dismiss()
                                            ActionSheet.show(
                                                {
                                                    options: this.getTimeOptions(this.state.times),
                                                    cancelButtonIndex: this.getCancelButtonIndex(
                                                        this.getTimeOptions(this.state.times)),
                                                    title: "انتخابی ساعت"
                                                },
                                                buttonIndex => {
                                                    if (this.state.times.length > 0) {
                                                        if (buttonIndex <= this.state.times.length - 1)
                                                            this.setState(
                                                                {
                                                                    selectedTime: {
                                                                        Id: 0,
                                                                        value: this.state.times[buttonIndex].TimeSlice.substring(
                                                                            0, 5)
                                                                    }
                                                                });
                                                    }
                                                }
                                            )
                                        }}
                                        bordered style={{
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        margin: 1,
                                        flex: 3,
                                        borderWidth: 1,
                                        borderColor: '#fff',

                                    }}>
                                        <Text style={{
                                            fontFamily:'IRANMarker',
                                            padding: 1,
                                            textAlign: 'center',
                                            borderRadius: 2,
                                            flex: 2,
                                            fontSize: 13,
                                            color: '#23b9b9',
                                            borderWidth: 1,
                                            borderColor: '#23b9b9',

                                        }}>{this.state.selectedTime.value}</Text>
                                    </Button>
                                </View>}
                            </ModalContent>

                        </Modal>
                    </Content>
                </Root>
            </Container>
        );


    }


}

ServicePlanResult.navigationOptions = {
    header: null,
    title: 'اطلاع رسانی',
    gesturesEnabled: false,
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
    },
    headerText: {
        padding: 5,
        fontSize: 20,
        color: '#fff',

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
        fontSize: 13,

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
    modalTitle: {
        backgroundColor: '#23b9b9',
    },
    modalTitleText: {
        color: '#fff',
        textAlign: 'right'
    },
    modalFooter: {
        minHeight: 60,
        maxHeight: 70,
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
        fontSize: 15,
        textAlign: 'center'
    },
    modalCancelButtonText: {
        color: '#23b9b9',
        fontSize: 15,
        textAlign: 'center'
    },
});
