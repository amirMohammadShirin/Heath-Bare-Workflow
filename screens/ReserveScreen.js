import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    StatusBar,
    TextInput,
    AsyncStorage,
    ActivityIndicator,
    Keyboard, Platform, BackHandler
} from 'react-native';
import Modal, {ModalButton, ModalFooter, ModalTitle, SlideAnimation, ModalContent} from 'react-native-modals';
import PersianCalendarPicker from 'react-native-persian-calendar-picker';
import {
    Container,
    Header,
    Root,
    Content,
    Footer,
    Button,
    Left,
    Right,
    Icon,
    Card,
    ActionSheet, Body, Input
} from 'native-base';


//date.format('jYYYY-jM-jD [is] YYYY-M-D')

const CANCEL_TEXT = 'انصراف';
const GETGENDERS = '/api/GetGenders';
const GETSKILLS = '/api/GetSkills';
const SEARCHSERVICEPLAN = '/api/SearchServicePlan';
export default class ReserveScreen extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        }
        this.firstActionSheet = null;
        this.secondActionSheet = null;
        this.thirdActionSheet = null;
        this.state = {
            medicalCenterSearchWord: null,
            doctorSearchWord: null,
            //-----------------------Progress Modal States--------------------
            progressModalVisible: false,
            //-----------------------API States--------------------
            token: null,
            baseUrl: null,
            //-----------------------ActionSheets States--------------------
            selectedSkill: {id: -100, value: ' انتخاب تخصص'},
            selectedState: {id: -100, value: 'انتخاب منطقه'},
            selectedGender: {id: -100, value: ' انتخاب جنسیت'},
            //-----------------------Calendar Modal states---------------------------
            startDateModalVisible: false,
            endDateModalVisible: false,
            //-----------------------JalaliCalendar States------------------
            minDate: new Date(),
            selectedStartDate: null,
            selectedEndDate: null,
            //-----------------------BaseInfo States------------------------
            states: [
                {id: 0, value: '1'},
                {id: 1, value: '2'},
                {id: 2, value: '3'},
                {id: 3, value: '4'},
                {id: 4, value: '5'},
                {id: 5, value: '6'},
                {id: 6, value: '7'},
                {id: 7, value: '8'},
                {id: 8, value: '9'},
                {id: 9, value: '10'},
                {id: 10, value: '11'},
                {id: 11, value: '12'},
                {id: 12, value: '13'},
                {id: 13, value: '14'},
                {id: 14, value: '15'},
                {id: 15, value: '16'},
                {id: 16, value: '17'},
                {id: 17, value: '18'},
                {id: 18, value: '19'},
                {id: 19, value: '20'},
                {id: 20, value: '21'},
                {id: 21, value: '22'},
            ],
            skills: [],
            genders: [],
        };
        (this: any).onStartDateChange = this.onStartDateChange.bind(this);
        (this: any).onEndDateChange = this.onEndDateChange.bind(this);
    }


    handleBackButtonClick() {
        // alert('pressed')
        console.log(JSON.stringify(this.props.navigation.state))
        console.log('n0r00zi j00n')
        if (!this.state.progressModalVisible) {
            console.log('progress is not visible')
            if (this.state.startDateModalVisible) {
                console.log('startDate is visible')
                this.setState({startDateModalVisible: false})
            } else if (this.state.endDateModalVisible) {
                console.log('endDate iss visible')
                this.setState({endDateModalVisible: false})
            } else {
                this.onBackPressed()
            }
        }
        console.log('test')
        return true;
    }


    componentDidMount(): void {
        console.log('reserve did mounted')
    }

    async componentWillMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        }
        // alert("Medical : " + JSON.stringify(this.props.navigation.getParam('medicalCenter')))
        // alert("doctor : " + JSON.stringify(this.props.navigation.getParam('doctor')))
        const token = await AsyncStorage.getItem('token');
        const baseUrl = await AsyncStorage.getItem('baseUrl');
        const MEDICALCENTER = this.props.navigation.getParam('medicalCenter');
        const DOCTOR = this.props.navigation.getParam('doctor');
        this.setState({
            token: token,
            baseUrl: baseUrl,
            medicalCenterSearchWord: (typeof MEDICALCENTER != 'undefined' && MEDICALCENTER != null) ?
                MEDICALCENTER.Title :
                null,
            doctorSearchWord: (typeof DOCTOR != 'undefined' && DOCTOR != null) ? DOCTOR.FirstName + " " +
                DOCTOR.LastName : null
        }, () => {
            this.getSkills()
        });
        // if (typeof this.props.navigation.getParam('medicalCenter') !== "undefined" &&
        //     this.props.navigation.getParam('medicalCenter') != null &&
        //     typeof this.props.navigation.getParam('doctor') !== "undefined" &&
        //     this.props.navigation.getParam('doctor') != null) {
        //     const medicalCenter = this.props.navigation.getParam('medicalCenter');
        //     const doctor = this.props.navigation.getParam('doctor');
        //     try {
        //         const length = medicalCenter.Title.length;
        //         await this.setState({
        //             selectedMedicalCenter: medicalCenter,
        //             doctor: doctor,
        //             baseUrl: baseUrl,
        //             token: token,
        //         })
        //     } catch (e) {
        //         await this.setState({
        //                 baseUrl: baseUrl,
        //                 token: token,
        //             },
        //             () => {
        //
        //                 this.getSkills();
        //
        //             }
        //         )
        //     }
        //
        // }else if(typeof this.props.navigation.getParam('medicalCenter') !== "undefined" &&
        //     this.props.navigation.getParam('medicalCenter') != null){
        //     const medicalCenter = this.props.navigation.getParam('medicalCenter');
        //     try {
        //         const length = medicalCenter.Title.length;
        //         await this.setState({
        //             selectedMedicalCenter: medicalCenter,
        //             baseUrl: baseUrl,
        //             token: token,
        //         })
        //     } catch (e) {
        //         await this.setState({
        //                 baseUrl: baseUrl,
        //                 token: token,
        //             },
        //             () => {
        //
        //                 this.getSkills();
        //
        //             }
        //         )
        //     }
        // }
        // else if(typeof this.props.navigation.getParam('doctor') !== "undefined" &&
        //     this.props.navigation.getParam('doctor') != null){
        //     const doctor = this.props.navigation.getParam('doctor');
        //     try {
        //         await this.setState({
        //             doctor: doctor,
        //             baseUrl: baseUrl,
        //             token: token,
        //         })
        //     } catch (e) {
        //         await this.setState({
        //                 baseUrl: baseUrl,
        //                 token: token,
        //             },
        //             () => {
        //
        //                 this.getSkills();
        //
        //             }
        //         )
        //     }
        // }
        // else {
        //     await this.setState({
        //             baseUrl: baseUrl,
        //             token: token,
        //         },
        //         () => {
        //
        //             this.getSkills();
        //
        //         }
        //     )
        // }
    }


    async getSkills() {
        await this.setState({progressModalVisible: true})
        await fetch(this.state.baseUrl + GETSKILLS, {
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
                            this.setState({skills: data})
                            this.getGenders();
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

    async getGenders() {
        await this.setState({progressModalVisible: true})
        await fetch(this.state.baseUrl + GETGENDERS, {
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
                            this.setState({genders: data})
                            // this.getSkills();
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

    searchServicePlans(medicalCenterSearchWord, doctorSearchWord, skill, gender, startDate, endDate) {
        let body = {
            medicalCenterSearchWord: medicalCenterSearchWord != null ? medicalCenterSearchWord : null,
            doctorSearchWord: doctorSearchWord != null ? doctorSearchWord : null,
            skill: skill.id !== -100 ? skill.value : null,
            gender: gender.id !== -100 ? gender.id.toString() : null,
            startDate: startDate != null ? startDate : null,
            endDate: endDate != null ? endDate : null
        }
        console.log(JSON.stringify(body))
        console.log("start : " + typeof (body.startDate))
        console.log("end :" + typeof (body.endDate))
        // alert(JSON.stringify(body))
        if (body.startDate === null || body.endDate === null) {
            alert('لطفا بازه زمانی مورد نظر را انتخاب کنید')
        } else {
            this.setState({progressModalVisible: true})
            console.log(JSON.stringify(body))
            fetch(this.state.baseUrl + SEARCHSERVICEPLAN, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    Accept: 'application/json',
                    'Authorization': 'Bearer ' + new String(this.state.token)
                },
                body: JSON.stringify(body)
            }).then((response) => response.json())
                .then((responseData) => {
                    if (responseData['StatusCode'] === 200) {
                        if (responseData['Data'] != null) {
                            let data = responseData['Data'];
                            this.setState({progressModalVisible: false}, () => {
                                if (data.length <= 0) {
                                    alert('موردی یافت نشد')
                                } else {
                                    // alert(JSON.stringify(data))
                                    this.props.navigation.navigate('ServicePlanResultScreen', {
                                        result: data,
                                        medicalCenterSearchWord: medicalCenterSearchWord != null ?
                                            medicalCenterSearchWord :
                                            null,
                                        doctorSearchWord: doctorSearchWord != null ? doctorSearchWord : null,
                                        skill: skill.id !== -100 ? skill.value : null,
                                        gender: gender.id !== -100 ? gender.value : null,
                                        startDate: startDate != null ? startDate : null,
                                        endDate: endDate != null ? endDate : null
                                    })
                                }
                            })
                        }
                    } else if (responseData['StatusCode'] === 100019) {
                        this.setState({progressModalVisible: false}, () => {
                            alert('توالی تاریخ رعایت نشده است !')
                        })
                    } else if (responseData['StatusCode'] === 100020) {
                        this.setState({progressModalVisible: false}, () => {
                            alert('لطفا بازه تاریخی را کمتر از 5 ماه وارد کنید !')
                        })
                    } else {
                        this.setState({progressModalVisible: false}, () => {
                            // alert('خطا در اتصال به سرویس')
                            console.log(JSON.stringify(responseData))
                        })

                    }
                })
                .catch((error) => {
                    console.error(error)
                    // alert(error)
                })
        }
    }

    onStartDateChange(date) {
        this.setState({selectedStartDate: date});
    }

    onEndDateChange(date) {
        this.setState({selectedEndDate: date});
    }

    getOptions(array) {
        let options = [];
        for (let item of array) {
            options.push(item.value)
        }
        options.push(CANCEL_TEXT)
        return options;
    }

    getObject(array, title) {
        let obj = {id: 0, value: title};
        for (let item of array) {
            if (item.value === title) {
                obj.id = item.id
            }
            break
        }
        return obj;
    }

    getCancelButtonIndex(array) {
        return array.indexOf(CANCEL_TEXT)
    }

    getMaxDate() {
        let date = new Date();
        date.setMonth(this.state.minDate.getUTCMonth() + 3)
        return date;
    }

    onBackPressed() {
        console.log(this.props.navigation.state)
        const back = this.props.navigation.getParam('goBack');
        if (back != null && back === 'home') {

            this.props.navigation.push('HomeScreen')


        } else {
            this.props.navigation.goBack(null)
        }
    }

    render() {
        const MEDICALCENTER = this.props.navigation.getParam('medicalCenter');
        const DOCTOR = this.props.navigation.getParam('doctor');
        return (
            <Root>
                <Container>
                    {(typeof DOCTOR != 'undefined' || typeof MEDICALCENTER != 'undefined') && (MEDICALCENTER != null ||
                        DOCTOR != null) ?
                        <Header hasTabs style={{backgroundColor: '#23b9b9'}}>
                            <Left>
                                <Button transparent style={styles.headerMenuIcon}
                                        onPress={() => this.onBackPressed()}>
                                    <Icon style={styles.headerMenuIcon} name='arrow-back'
                                          onPress={() => this.onBackPressed()}/>
                                </Button>
                            </Left>
                            <Right>
                                <Text style={styles.headerText}>جستجوی نوبت</Text>
                            </Right>
                        </Header> :
                        <Header hasTabs style={{backgroundColor: '#23b9b9'}}>
                            <Left style={{flex: 5}}>
                                <Text style={styles.headerText}>جستجوی نوبت</Text>
                            </Left>
                            <Right style={{flex: 1}}>
                                <Button transparent style={styles.headerMenuIcon}
                                        onPress={() => {
                                            Keyboard.dismiss()
                                            this.props.navigation.openDrawer()
                                        }}>
                                    <Icon style={styles.headerMenuIcon} name='menu'
                                          onPress={() => {
                                              Keyboard.dismiss()
                                              this.props.navigation.openDrawer()
                                          }}/>
                                </Button>
                            </Right>
                        </Header>}

                    <Content padder style={styles.content}>
                        {Platform.OS === 'android' &&
                        <StatusBar barStyle={"dark-content"} backgroundColor={'#209b9b'}
                                   hidden={false}/>
                        }
                        <Card style={styles.card}>

                            <View style={styles.row}>
                                <TextInput placeholder={'نام مرکز'}
                                           onChangeText={(text) => this.setState({medicalCenterSearchWord: text})}
                                           value={this.state.medicalCenterSearchWord}
                                           style={styles.Input}/>
                                <Text style={[styles.label, {marginBottom: 8}]}> مرکز درمانی</Text>
                            </View>
                            <View style={styles.row}>
                                <TextInput placeholder={'نام پزشک'}
                                           onChangeText={(text) => this.setState({doctorSearchWord: text})}
                                           value={this.state.doctorSearchWord} style={styles.Input}/>
                                <Text style={[styles.label, {marginBottom: 8}]}> پزشک</Text>
                            </View>

                            <View style={styles.row}>
                                <Button
                                    onPress={() => {
                                        Keyboard.dismiss()
                                        ActionSheet.show(
                                            {
                                                options: this.getOptions(this.state.skills),
                                                cancelButtonIndex: this.getCancelButtonIndex(
                                                    this.getOptions(this.state.skills)),
                                                title: "انتخاب تخصص"
                                            },
                                            buttonIndex => {
                                                if (buttonIndex <= this.state.skills.length - 1)
                                                    this.setState({selectedSkill: this.state.skills[buttonIndex]});
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
                                    <Text style={styles.buttonsTexts}>{this.state.selectedSkill.value}</Text>
                                </Button>
                                <Text style={styles.label}>تخصص</Text>
                            </View>
                            <View style={styles.row}>
                                <Button
                                    onPress={() => {
                                        Keyboard.dismiss()
                                        ActionSheet.show(
                                            {
                                                options: this.getOptions(this.state.genders),
                                                cancelButtonIndex: this.getCancelButtonIndex(
                                                    this.getOptions(this.state.genders)),
                                                title: "انتخاب جنسیت"
                                            },
                                            buttonIndex => {
                                                if (buttonIndex <= this.state.genders.length - 1)
                                                    this.setState({selectedGender: this.state.genders[buttonIndex]});
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
                                    <Text style={styles.buttonsTexts}>{this.state.selectedGender.value}</Text>
                                </Button>
                                <Text style={styles.label}>جنسیت</Text>
                            </View>
                            {false && <View style={styles.row}>
                                <Button
                                    onPress={() => {
                                        Keyboard.dismiss()
                                        ActionSheet.show(
                                            {
                                                options: this.getOptions(this.state.states),
                                                cancelButtonIndex: this.getCancelButtonIndex(
                                                    this.getOptions(this.state.states)),
                                                title: "انتخاب منطقه"
                                            },
                                            buttonIndex => {
                                                if (buttonIndex <= this.state.states.length - 1)
                                                    this.setState({selectedState: this.state.states[buttonIndex]});
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
                                    <Text style={styles.buttonsTexts}
                                    >{this.state.selectedState.value}</Text>
                                </Button>
                                <Text style={styles.label}>منطقه</Text>
                            </View>}
                            <View style={styles.row}>
                                <Button
                                    onPress={() => {
                                        Keyboard.dismiss()
                                        this.setState({startDateModalVisible: true}, () => {

                                        })
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
                                    <Text style={styles.buttonsTexts}>{this.state.selectedStartDate == null ?
                                        'انتخاب تاریخ' :
                                        this.state.selectedStartDate.format('jYYYY-jM-jD')}</Text>
                                </Button>
                                <Text style={styles.label}>از تاریخ</Text>
                            </View>
                            <View style={styles.row}>
                                <Button
                                    onPress={() => {
                                        Keyboard.dismiss()
                                        this.setState({endDateModalVisible: true}, () => {
                                            Keyboard.dismiss()
                                        })
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

                                    <Text style={styles.buttonsTexts}>{this.state.selectedEndDate == null ?
                                        'انتخاب تاریخ' :
                                        this.state.selectedEndDate.format('jYYYY-jM-jD')}</Text>
                                </Button>
                                <Text style={styles.label}>تا تاریخ</Text>
                            </View>

                        </Card>

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


                        {/*<Card>*/}
                        {/*    <CardItem bordered style={{flexDirection: 'column'}}>*/}
                        {/*        <View style={[styles.row]}>*/}
                        {/*            <SearchableDropdown style={{alignSelf: 'flex-end', width: '100%',}}*/}
                        {/*                                multi={false}*/}
                        {/*                                onItemSelect={(item) => {*/}

                        {/*                                }}*/}
                        {/*                                containerStyle={{padding: 5}}*/}
                        {/*                                onRemoveItem={(item, index) => {*/}

                        {/*                                }}*/}
                        {/*                                itemStyle={{*/}
                        {/*                                    padding: 10,*/}
                        {/*                                    marginTop: 2,*/}
                        {/*                                    backgroundColor: '#fff',*/}
                        {/*                                    borderBottomColor: 'rgba(35,185,185,0.49)',*/}
                        {/*                                    borderTopColor: '#fff',*/}
                        {/*                                    borderRightColor: '#fff',*/}
                        {/*                                    borderLeftColor: '#fff',*/}
                        {/*                                    borderWidth: 1,*/}
                        {/*                                    borderRadius: 2,*/}
                        {/*                                }}*/}
                        {/*                                itemTextStyle={{*/}
                        {/*                                    color: 'rgba(34,34,34,0.72)',*/}
                        {/*                                    textAlign: 'right'*/}
                        {/*                                }}*/}
                        {/*                                itemsContainerStyle={{maxHeight: 200}}*/}
                        {/*                                items={medicalItems}*/}
                        {/*                                chip={false}*/}
                        {/*                                resetValue={false}*/}
                        {/*                                textInputProps={*/}
                        {/*                                    {*/}
                        {/*                                        placeholder: "جستجوی مرکز دزمانی",*/}
                        {/*                                        underlineColorAndroid: "transparent",*/}
                        {/*                                        placeholderTextColor: '#23b9b9',*/}
                        {/*                                        style: {*/}
                        {/*                                            padding: 12,*/}
                        {/*                                            borderWidth: 1,*/}
                        {/*                                            borderColor: '#ccc',*/}
                        {/*                                            borderRadius: 5,*/}
                        {/*                                            width: '100%',*/}
                        {/*                                            flex: 1*/}
                        {/*                                        },*/}
                        {/*                                        onTextChange: text => (this.search(text))*/}
                        {/*                                    }*/}
                        {/*                                }*/}
                        {/*                                listProps={*/}
                        {/*                                    {*/}
                        {/*                                        nestedScrollEnabled: true,*/}
                        {/*                                    }*/}
                        {/*                                }*/}
                        {/*            />*/}
                        {/*            <SearchableDropdown*/}
                        {/*                multi={false}*/}
                        {/*                onItemSelect={(item) => {*/}

                        {/*                }}*/}
                        {/*                containerStyle={{padding: 5}}*/}
                        {/*                onRemoveItem={(item, index) => {*/}

                        {/*                }}*/}
                        {/*                itemStyle={{*/}
                        {/*                    padding: 10,*/}
                        {/*                    marginTop: 2,*/}
                        {/*                    backgroundColor: '#fff',*/}
                        {/*                    borderBottomColor: 'rgba(35,185,185,0.49)',*/}
                        {/*                    borderTopColor: '#fff',*/}
                        {/*                    borderRightColor: '#fff',*/}
                        {/*                    borderLeftColor: '#fff',*/}
                        {/*                    borderWidth: 1,*/}
                        {/*                    borderRadius: 2,*/}
                        {/*                }}*/}
                        {/*                itemTextStyle={{*/}
                        {/*                    color: 'rgba(34,34,34,0.72)',*/}
                        {/*                    textAlign: 'right'*/}
                        {/*                }}*/}
                        {/*                itemsContainerStyle={{maxHeight: 200}}*/}
                        {/*                items={medicalItems}*/}
                        {/*                chip={false}*/}
                        {/*                resetValue={false}*/}
                        {/*                textInputProps={*/}
                        {/*                    {*/}
                        {/*                        placeholder: "منطقه",*/}
                        {/*                        underlineColorAndroid: "transparent",*/}
                        {/*                        placeholderTextColor: '#23b9b9',*/}
                        {/*                        style: {*/}
                        {/*                            padding: 12,*/}
                        {/*                            borderWidth: 1,*/}
                        {/*                            borderColor: '#ccc',*/}
                        {/*                            borderRadius: 5,*/}
                        {/*                            width: '100%',*/}
                        {/*                            flex: 1*/}
                        {/*                        },*/}
                        {/*                        onTextChange: text => (this.search(text))*/}
                        {/*                    }*/}
                        {/*                }*/}
                        {/*                listProps={*/}
                        {/*                    {*/}
                        {/*                        nestedScrollEnabled: true,*/}
                        {/*                    }*/}
                        {/*                }*/}
                        {/*            />*/}
                        {/*            <SearchableDropdown*/}
                        {/*                multi={false}*/}
                        {/*                onItemSelect={(item) => {*/}

                        {/*                }}*/}
                        {/*                containerStyle={{padding: 5}}*/}
                        {/*                onRemoveItem={(item, index) => {*/}

                        {/*                }}*/}
                        {/*                itemStyle={{*/}
                        {/*                    padding: 10,*/}
                        {/*                    marginTop: 2,*/}
                        {/*                    backgroundColor: '#fff',*/}
                        {/*                    borderBottomColor: 'rgba(35,185,185,0.49)',*/}
                        {/*                    borderTopColor: '#fff',*/}
                        {/*                    borderRightColor: '#fff',*/}
                        {/*                    borderLeftColor: '#fff',*/}
                        {/*                    borderWidth: 1,*/}
                        {/*                    borderRadius: 2,*/}
                        {/*                }}*/}
                        {/*                itemTextStyle={{*/}
                        {/*                    color: 'rgba(34,34,34,0.72)',*/}
                        {/*                    textAlign: 'right'*/}
                        {/*                }}*/}
                        {/*                itemsContainerStyle={{maxHeight: 200}}*/}
                        {/*                items={medicalItems}*/}
                        {/*                chip={false}*/}
                        {/*                resetValue={false}*/}
                        {/*                textInputProps={*/}
                        {/*                    {*/}
                        {/*                        placeholder: "خدمات",*/}
                        {/*                        underlineColorAndroid: "transparent",*/}
                        {/*                        placeholderTextColor: '#23b9b9',*/}
                        {/*                        style: {*/}
                        {/*                            padding: 12,*/}
                        {/*                            borderWidth: 1,*/}
                        {/*                            borderColor: '#ccc',*/}
                        {/*                            borderRadius: 5,*/}
                        {/*                            width: '100%',*/}
                        {/*                            flex: 1*/}
                        {/*                        },*/}
                        {/*                        onTextChange: text => (this.search(text))*/}
                        {/*                    }*/}
                        {/*                }*/}
                        {/*                listProps={*/}
                        {/*                    {*/}
                        {/*                        nestedScrollEnabled: true,*/}
                        {/*                    }*/}
                        {/*                }*/}
                        {/*            />*/}
                        {/*            <SearchableDropdown*/}
                        {/*                multi={false}*/}
                        {/*                onItemSelect={(item) => {*/}

                        {/*                }}*/}
                        {/*                containerStyle={{padding: 5}}*/}
                        {/*                onRemoveItem={(item, index) => {*/}

                        {/*                }}*/}
                        {/*                itemStyle={{*/}
                        {/*                    padding: 10,*/}
                        {/*                    marginTop: 2,*/}
                        {/*                    backgroundColor: '#fff',*/}
                        {/*                    borderBottomColor: 'rgba(35,185,185,0.49)',*/}
                        {/*                    borderTopColor: '#fff',*/}
                        {/*                    borderRightColor: '#fff',*/}
                        {/*                    borderLeftColor: '#fff',*/}
                        {/*                    borderWidth: 1,*/}
                        {/*                    borderRadius: 2,*/}
                        {/*                }}*/}
                        {/*                itemTextStyle={{*/}
                        {/*                    color: 'rgba(34,34,34,0.72)',*/}
                        {/*                    textAlign: 'right'*/}
                        {/*                }}*/}
                        {/*                itemsContainerStyle={{maxHeight: 200}}*/}
                        {/*                items={medicalItems}*/}
                        {/*                chip={false}*/}
                        {/*                resetValue={false}*/}
                        {/*                textInputProps={*/}
                        {/*                    {*/}
                        {/*                        placeholder: "سرویس",*/}
                        {/*                        underlineColorAndroid: "transparent",*/}
                        {/*                        placeholderTextColor: '#23b9b9',*/}
                        {/*                        style: {*/}
                        {/*                            padding: 12,*/}
                        {/*                            borderWidth: 1,*/}
                        {/*                            borderColor: '#ccc',*/}
                        {/*                            borderRadius: 5,*/}
                        {/*                            width: '100%',*/}
                        {/*                            flex: 1*/}
                        {/*                        },*/}
                        {/*                        onTextChange: text => (this.search(text))*/}
                        {/*                    }*/}
                        {/*                }*/}
                        {/*                listProps={*/}
                        {/*                    {*/}
                        {/*                        nestedScrollEnabled: true,*/}
                        {/*                    }*/}
                        {/*                }*/}
                        {/*            />*/}

                        {/*        </View>*/}
                        {/*    </CardItem>*/}


                        {/*    <CardItem bordered style={{flexDirection: 'column'}}>*/}
                        {/*        <View style={styles.viewStyle}>*/}
                        {/*            <View style={[styles.row]}>*/}
                        {/*                <SearchableDropdown style={{flex: 1, width: '100%',}}*/}
                        {/*                                    multi={false}*/}
                        {/*                                    onItemSelect={(item) => {*/}

                        {/*                                    }}*/}
                        {/*                                    containerStyle={{padding: 5}}*/}
                        {/*                                    onRemoveItem={(item, index) => {*/}

                        {/*                                    }}*/}
                        {/*                                    itemStyle={{*/}
                        {/*                                        padding: 10,*/}
                        {/*                                        marginTop: 2,*/}
                        {/*                                        backgroundColor: '#fff',*/}
                        {/*                                        borderBottomColor: 'rgba(35,185,185,0.49)',*/}
                        {/*                                        borderTopColor: '#fff',*/}
                        {/*                                        borderRightColor: '#fff',*/}
                        {/*                                        borderLeftColor: '#fff',*/}
                        {/*                                        borderWidth: 1,*/}
                        {/*                                        borderRadius: 2,*/}
                        {/*                                    }}*/}
                        {/*                                    itemTextStyle={{*/}
                        {/*                                        color: 'rgba(34,34,34,0.72)',*/}
                        {/*                                        textAlign: 'right'*/}
                        {/*                                    }}*/}
                        {/*                                    itemsContainerStyle={{maxHeight: 200}}*/}
                        {/*                                    items={medicalItems}*/}
                        {/*                                    chip={false}*/}
                        {/*                                    resetValue={false}*/}
                        {/*                                    textInputProps={*/}
                        {/*                                        {*/}
                        {/*                                            placeholder: " جستجوی پزشک",*/}
                        {/*                                            underlineColorAndroid: "transparent",*/}
                        {/*                                            placeholderTextColor: '#23b9b9',*/}
                        {/*                                            style: {*/}
                        {/*                                                padding: 12,*/}
                        {/*                                                borderWidth: 1,*/}
                        {/*                                                borderColor: '#ccc',*/}
                        {/*                                                borderRadius: 5,*/}
                        {/*                                                width: '100%'*/}
                        {/*                                            },*/}
                        {/*                                            // onTextChange: text => alert(text)*/}
                        {/*                                        }*/}
                        {/*                                    }*/}
                        {/*                                    listProps={*/}
                        {/*                                        {*/}
                        {/*                                            nestedScrollEnabled: true,*/}
                        {/*                                        }*/}
                        {/*                                    }*/}
                        {/*                />*/}
                        {/*            </View>*/}
                        {/*        </View>*/}
                        {/*    </CardItem>*/}

                        {/*    <CardItem footer bordered style={{flexDirection: 'column'}}>*/}
                        {/*        <Button success*/}
                        {/*                style={{alignContent: 'center', justifyContent: 'center', alignSelf: 'center'}}>*/}
                        {/*            <Text>رزرو نوبت</Text>*/}
                        {/*        </Button>*/}
                        {/*    </CardItem>*/}
                        {/*</Card>*/}

                        {/* ----------------------StartDate Modal---------------------------- */}

                        <Modal
                            onTouchOutside={() => {
                                this.setState({startDateModalVisible: false});
                            }}
                            visible={this.state.startDateModalVisible}
                            modalTitle={<ModalTitle style={styles.modalTitle} textStyle={styles.modalTitleText}
                                                    title="انتخاب تاریخ شروع"/>}
                            modalAnimation={new SlideAnimation({
                                slideFrom: 'bottom'
                            })}
                            footer={
                                <ModalFooter style={styles.modalFooter}>
                                    <ModalButton
                                        style={styles.modalCancelButton}
                                        textStyle={styles.modalCancelButtonText}
                                        text="انصراف"
                                        onPress={() => this.setState({startDateModalVisible: false})}
                                    />
                                    <ModalButton
                                        style={styles.modalSuccessButton}
                                        textStyle={styles.modalSuccessButtonText}
                                        text="انتخاب"
                                        onPress={() => this.setState({startDateModalVisible: false})}
                                    />
                                </ModalFooter>
                            }
                        >
                            <ModalContent style={styles.dateModalContent}>
                                <View>
                                    <PersianCalendarPicker
                                        textStyle={{fontFamily: 'IRANMarker'}}
                                        enableSwipe={false}
                                        initDate={this.state.minDate}
                                        minDate={this.state.minDate}
                                        maxDate={this.getMaxDate()}
                                        previousTitle={'ماه قبل'}
                                        nextTitle={'ماه بعد'}
                                        selectedDayColor={'#23b9b9'}
                                        selectedDayTextColor={'#fff'}
                                        todayBackgroundColor={'#e6e6e6'}
                                        textStyle={{color: '#000', fontFamily: 'IRANIMarker'}}
                                        onDateChange={this.onStartDateChange}
                                    />
                                </View>
                            </ModalContent>
                        </Modal>
                        {/* ----------------------EndDate Modal---------------------------- */}
                        <Modal
                            onTouchOutside={() => {
                                this.setState({endDateModalVisible: false});
                            }}
                            visible={this.state.endDateModalVisible}
                            modalTitle={<ModalTitle style={styles.modalTitle} textStyle={styles.modalTitleText}
                                                    title="انتخاب تاریخ پایان"/>}
                            modalAnimation={new SlideAnimation({
                                slideFrom: 'bottom'
                            })}
                            footer={
                                <ModalFooter style={styles.modalFooter}>
                                    <ModalButton
                                        style={styles.modalCancelButton}
                                        textStyle={styles.modalCancelButtonText}
                                        text="انصراف"
                                        onPress={() => this.setState({endDateModalVisible: false})}
                                    />
                                    <ModalButton
                                        style={styles.modalSuccessButton}
                                        textStyle={styles.modalSuccessButtonText}
                                        text="انتخاب"
                                        onPress={() => this.setState({endDateModalVisible: false})}
                                    />
                                </ModalFooter>
                            }
                        >
                            <ModalContent style={styles.dateModalContent}>
                                <View>
                                    <PersianCalendarPicker
                                        enableSwipe={false}
                                        initDate={this.state.minDate}
                                        minDate={this.state.minDate}
                                        maxDate={this.getMaxDate()}
                                        previousTitle={'ماه قبل'}
                                        nextTitle={'ماه بعد'}
                                        selectedDayColor={'#23b9b9'}
                                        selectedDayTextColor={'#fff'}
                                        todayBackgroundColor={'#e6e6e6'}
                                        textStyle={{color: '#000'}}
                                        onDateChange={this.onEndDateChange}
                                    />
                                </View>
                            </ModalContent>
                        </Modal>


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
                    <Footer style={styles.footer}>
                        <Button style={styles.button} onPress={() => {
                            this.searchServicePlans(
                                this.state.medicalCenterSearchWord,
                                this.state.doctorSearchWord,
                                this.state.selectedSkill,
                                this.state.selectedGender,
                                this.state.selectedStartDate,
                                this.state.selectedEndDate
                            )
                        }}>
                            <Text style={[{color: '#fff', fontSize: 15, fontFamily: 'IRANMarker'}]}>جستجو</Text>
                        </Button>
                    </Footer>

                </Container>
            </Root>
        );
    }

}

ReserveScreen.navigationOptions = {
    header: null,
    title: 'نوبت دهی',
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
        backgroundColor: '#fff',
    },
    headerMenuIcon: {
        fontSize: 30,
        paddingTop: 5,
        paddingBottom: 5,
        color: '#fff',
    },
    headerText: {
        fontFamily: 'IRANMarker',
        fontSize: 18,
        padding: 5,
        color: '#fff',

    },
    headerIcon: {
        paddingTop: 5,
        paddingBottom: 5,
        fontSize: 15,
        color: '#fff'
    },
    icons: {
        color: '#fff',
        fontSize: 20
    },
    tabsText: {
        fontSize: 10,
        color: '#fff'
    },
    viewStyle: {
        flex: 1,
        flexDirection: 'column',
    },
    tabHeading: {
        backgroundColor: '#fff'
    },
    tabIcon: {
        fontSize: 20,
        color: '#1e8080'
    },
    tabText: {
        fontSize: 10,
        color: '#1e8080'
    },
    footer: {
        backgroundColor: '#fff'
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        flex: 1,
        marginRight: 20,
        marginLeft: 20,
        marginTop: 5,
        marginBottom: 5,
        borderRadius: 5,
        backgroundColor: '#23b9b9'
    },
    card: {
        flexDirection: 'column',
        // margin: 5,
        //  borderRadius: 5,
        //  borderColor: '#23b9b9',
        // borderWidth: 1,
        // shadowColor: '#d8d8d8',
        // shadowOffset: {width: 0, height: 2},
        // shadowRadius: 2,
        //  elevation: 8
    },
    row: {
        flexDirection: 'row',
        margin: 5,
        padding: 1
    },
    label: {
        fontFamily: 'IRANMarker',
        color: '#000',
        alignSelf: 'flex-end',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 1,
        flex: 1,
        marginBottom: 13,
        margin: 1,
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'right'
    },
    Input: {
        color: '#000',
        fontFamily: 'IRANMarker',
        margin: 1,
        marginRight: 2,
        justifyContent: 'center',
        alignContent: 'center',
        borderRadius: 3,
        borderColor: '#eeeeee',
        borderWidth: 1,
        flex: 3,
        alignSelf: 'flex-start',
        padding: 5,
        fontSize: 15,
        textAlign: 'right'
    },
    modalTitle: {
        backgroundColor: '#23b9b9'
    },
    modalTitleText: {
        color: '#fff'
    },
    modalFooter: {
        padding: 2,
        backgroundColor: 'rgba(47,246,246,0.06)'
    },
    modalCancelButton: {
        backgroundColor: '#fff',
        borderRadius: 3,
        borderColor: '#23b9b9',
        borderWidth: 1,
        padding: 2,
        margin: 5
    },
    modalSuccessButton: {
        backgroundColor: '#23b9b9',
        borderRadius: 3,
        padding: 2,
        margin: 5
    },
    modalSuccessButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15
    },
    modalCancelButtonText: {
        color: '#23b9b9',
        fontSize: 15
    },
    dateModalContent: {
        backgroundColor: 'rgba(47,246,246,0.06)'
    },
    modalContent: {
        marginTop: 5,
        padding: 2,
        alignContent: 'center',
        backgroundColor: 'rgba(47,246,246,0.06)'
    },
    buttonsTexts: {
        fontFamily: 'IRANMarker',
        padding: 1,
        textAlign: 'center',
        borderRadius: 2,
        flex: 2,
        fontSize: 13,
        color: '#23b9b9',
        borderWidth: 1,
        borderColor: '#23b9b9',

    }
});
