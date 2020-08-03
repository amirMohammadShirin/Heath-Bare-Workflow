import React, {Component} from 'react';
import Autocomplete from 'react-native-autocomplete-input';
import {
    StyleSheet,
    View,
    Text,
    StatusBar,
    TextInput,
    AsyncStorage,
    ActivityIndicator,
    Keyboard,
    Platform,
    BackHandler,
    TouchableOpacity,
} from 'react-native';
import Modal, {
    ModalButton,
    ModalFooter,
    ModalTitle,
    SlideAnimation,
    ModalContent,
} from 'react-native-modals';
import PersianCalendarPicker from 'react-native-persian-calendar-picker';
import {Dialog} from 'react-native-simple-dialogs';
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
    ActionSheet,
    Body,
    Input,
    CardItem,
} from 'native-base';

//date.format('jYYYY-jM-jD [is] YYYY-M-D')

const CANCEL_TEXT = 'انصراف';
const GETGENDERS = '/GetGenders';
const GETSKILLS = '/GetSkills';
const SEARCHSERVICEPLAN = '/SearchServicePlan';
const GETMEDICALCENTERSNAMEFORRESERVE = '/GetMedicalCentersNameForReserve';
const GETDOCTORSFULLNAMEFORRESERVE = '/GetDoctorsFullNameForReserve';
export default class ReserveScreen extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        }
        this.state = {
            hub: null,
            userId: null,
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
            startDateForShow: null,
            endDateForShow: null,
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
            //-----------------------autoComplete states------------------------
            medicalCentersShowData: true,
            doctorsShowData: true,
            doctorQuery: null,
            medicalCenterQuery: null,
            doctorSelected: false,
            medicalCenterSelected: false,
            doctorData: [],
            medicalCenterData: [],

        };
        (this: any).onStartDateChange = this.onStartDateChange.bind(this);
        (this: any).onEndDateChange = this.onEndDateChange.bind(this);
    }

    filterDoctorData(text) {
        if (text !== null) {
            let mainData = this.state.doctorData;
            let data = [];
            for (var item of mainData) {
                if (item.name.includes(text)) {
                    data.push(item);
                }
            }
            return data;
        }
        return;
    }

    filterMedicalCenterData(text) {
        if (text !== null) {
            let mainData = this.state.medicalCenterData;
            let data = [];
            for (var item of mainData) {
                if (item.name.includes(text)) {
                    data.push(item);
                }
            }
            return data;
        }
        return;
    }

    handleBackButtonClick() {
        console.log(JSON.stringify(this.props.navigation.state));
        if (!this.state.progressModalVisible) {
            console.log('progress is not visible');
            if (this.state.startDateModalVisible) {
                console.log('startDate is visible');
                this.setState({startDateModalVisible: false});
            } else if (this.state.endDateModalVisible) {
                console.log('endDate iss visible');
                this.setState({endDateModalVisible: false});
            } else {
                this.onBackPressed();
            }
        }
        console.log('test');
        return true;
    }

    async componentWillMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener(
                'hardwareBackPress',
                this.handleBackButtonClick,
            );
        }
        const token = await AsyncStorage.getItem('token');
        const hub = await AsyncStorage.getItem('hub');
        const baseUrl = await AsyncStorage.getItem('baseUrl');
        const MEDICALCENTER = this.props.navigation.getParam('medicalCenter');
        const DOCTOR = this.props.navigation.getParam('doctor');
        const userId = this.props.navigation.getParam('userId');
        this.setState(
            {
                hub: hub,
                baseUrl: baseUrl,
                userId: userId,
                token: token,
                medicalCenterSearchWord:
                    typeof MEDICALCENTER != 'undefined' && MEDICALCENTER != null
                        ? MEDICALCENTER.Title
                        : null,
                medicalCenterQuery:
                    typeof MEDICALCENTER != 'undefined' && MEDICALCENTER != null
                        ? MEDICALCENTER.Title
                        : null,
                doctorSearchWord:
                    typeof DOCTOR != 'undefined' && DOCTOR != null
                        ? DOCTOR.FirstName + ' ' + DOCTOR.LastName
                        : null,
                doctorQuery:
                    typeof DOCTOR != 'undefined' && DOCTOR != null
                        ? DOCTOR.FirstName + ' ' + DOCTOR.LastName
                        : null,
                doctorsShowData:
                    typeof DOCTOR != 'undefined' && DOCTOR != null ? false : true,
                medicalCentersShowData:
                    typeof MEDICALCENTER != 'undefined' && MEDICALCENTER != null
                        ? false
                        : true,
            },
            () => {
                this.getSkills();
            },
        );
    }

    async getSkills() {
        const token = this.state.token;
        const baseUrl = this.state.baseUrl;
        const hub = this.state.hub;
        let Body = {
            method: 'GET',
            Url: GETSKILLS,
            UserName: '',
            NationalCode: '',
            Body: null
        }
        await this.setState({progressModalVisible: true});
        await fetch(baseUrl + hub, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(token)
            },
            body: JSON.stringify(Body)
        })
            .then(response => response.json())
            .then(responseData => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        this.setState({progressModalVisible: false}, () => {
                            this.setState({skills: data});
                            this.getGenders();
                        });
                    }
                } else if (responseData['StatusCode'] === 401) {
                    this.setState({progressModalVisible: false}, () => {
                        this.props.navigation.navigate(
                            'GetVerificationCodeScreen',
                            {
                                user: {
                                    username: 'adrian',
                                    password: '1234',
                                    role: 'stranger',
                                },
                            },
                        );
                    });
                } else {
                    this.setState({progressModalVisible: false}, () => {
                        alert('خطا در اتصال به سرویس');
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    async getGenders() {
        const token = this.state.token;
        const baseUrl = this.state.baseUrl;
        const hub = this.state.hub;
        let Body = {
            method: 'GET',
            Url: GETGENDERS,
            UserName: '',
            NationalCode: '',
            Body: null
        }
        await this.setState({progressModalVisible: true});
        await fetch(baseUrl + hub, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(token)
            },
            body: JSON.stringify(Body)
        })
            .then(response => response.json())
            .then(responseData => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        this.setState({progressModalVisible: false}, () => {
                            this.setState({genders: data});
                            this.getDoctorsName();
                        });
                    }
                } else if (responseData['StatusCode'] === 401) {
                    this.setState({progressModalVisible: false}, () => {
                        this.props.navigation.navigate(
                            'GetVerificationCodeScreen',
                            {
                                user: {
                                    username: 'adrian',
                                    password: '1234',
                                    role: 'stranger',
                                },
                            },
                        );
                    });
                } else {
                    this.setState({progressModalVisible: false}, () => {
                        alert('خطا در اتصال به سرویس');
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    async getDoctorsName() {
        const token = this.state.token;
        const baseUrl = this.state.baseUrl;
        const hub = this.state.hub;
        let Body = {
            method: 'GET',
            Url: GETDOCTORSFULLNAMEFORRESERVE,
            UserName: '',
            NationalCode: '',
            Body: null
        }
        console.log('GETDOCTORSFULLNAMEFORRESERVE : \n ', Body)
        await this.setState({progressModalVisible: true});
        await fetch(baseUrl + hub, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(token)
            },
            body: JSON.stringify(Body)
        })
            .then(response => response.json())
            .then(responseData => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        this.setState(
                            {progressModalVisible: false, doctorData: data},
                            () => {
                                this.getMedicalCentersName();
                            },
                        );
                    }
                } else if (responseData['StatusCode'] === 401) {
                    this.setState({progressModalVisible: false}, () => {
                        this.props.navigation.navigate(
                            'GetVerificationCodeScreen',
                            {
                                user: {
                                    username: 'adrian',
                                    password: '1234',
                                    role: 'stranger',
                                },
                            },
                        );
                    });
                } else {
                    this.setState({progressModalVisible: false}, () => {
                        alert('خطا در اتصال به سرویس');
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    async getMedicalCentersName() {
        const token = this.state.token;
        const baseUrl = this.state.baseUrl;
        const hub = this.state.hub;
        let Body = {
            method: 'GET',
            Url: GETMEDICALCENTERSNAMEFORRESERVE,
            UserName: '',
            NationalCode: '',
            Body: null
        }
        await this.setState({progressModalVisible: true});
        await fetch(baseUrl + hub, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(token)
            },
            body: JSON.stringify(Body)
        })
            .then(response => response.json())
            .then(responseData => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        this.setState(
                            {progressModalVisible: false, medicalCenterData: data},
                            () => {

                            },
                        );
                    }
                } else if (responseData['StatusCode'] === 401) {
                    this.setState({progressModalVisible: false}, () => {
                        this.props.navigation.navigate(
                            'GetVerificationCodeScreen',
                            {
                                user: {
                                    username: 'adrian',
                                    password: '1234',
                                    role: 'stranger',
                                },
                            },
                        );
                    });
                } else {
                    this.setState({progressModalVisible: false}, () => {
                        alert('خطا در اتصال به سرویس');
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    searchServicePlans(
        medicalCenterSearchWord,
        doctorSearchWord,
        skill,
        gender,
        startDate,
        endDate,
    ) {
        const token = this.state.token;
        const baseUrl = this.state.baseUrl;
        const hub = this.state.hub;
        let filters = {
            startDate: this.state.startDateForShow,
            endDate: this.state.endDateForShow,
        };
        let body = {
            medicalCenterSearchWord:
                medicalCenterSearchWord != null ? medicalCenterSearchWord : null,
            doctorSearchWord: doctorSearchWord != null ? doctorSearchWord : null,
            skill: skill.id !== -100 ? skill.value : null,
            gender: gender.id !== -100 ? gender.id.toString() : null,
            startDate: startDate != null ? startDate : null,
            endDate: endDate != null ? endDate : null,
        };
        let Body = {
            method: 'POST',
            Url: SEARCHSERVICEPLAN,
            UserName: '',
            NationalCode: '',
            Body: body
        }
        if (body.startDate === null || body.endDate === null) {
            alert('لطفا بازه زمانی مورد نظر را انتخاب کنید');
        } else {
            this.setState({progressModalVisible: true});
            console.log(JSON.stringify(body));
            fetch(baseUrl + hub, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    Accept: 'application/json',
                    'Authorization': 'Bearer ' + new String(token)
                },
                body: JSON.stringify(Body),
            })
                .then(response => response.json())
                .then(responseData => {
                    if (responseData['StatusCode'] === 200) {
                        if (responseData['Data'] != null) {
                            let data = responseData['Data'];
                            this.setState({progressModalVisible: false}, () => {
                                if (data.length <= 0) {
                                    alert('موردی یافت نشد');
                                } else {
                                    this.props.navigation.push('ServicePlanResultScreen', {
                                        result: data,
                                        medicalCenterQuery:
                                            medicalCenterSearchWord != null
                                                ? medicalCenterSearchWord
                                                : null,
                                        skill: skill.id !== -100 ? skill.value : null,
                                        gender: gender.id !== -100 ? gender.value : null,
                                        startDate:
                                            filters.startDate != null ? filters.startDate : null,
                                        endDate: filters.endDate != null ? filters.endDate : null,
                                    });
                                }
                            });
                        }
                    } else if (responseData['StatusCode'] === 401) {
                        this.setState({progressModalVisible: false}, () => {
                            this.props.navigation.navigate(
                                'GetVerificationCodeScreen',
                                {
                                    user: {
                                        username: 'adrian',
                                        password: '1234',
                                        role: 'stranger',
                                    },
                                },
                            );
                        });
                    } else if (responseData['StatusCode'] === 100019) {
                        this.setState({progressModalVisible: false}, () => {
                            alert('توالی تاریخ رعایت نشده است !');
                        });
                    } else if (responseData['StatusCode'] === 100020) {
                        this.setState({progressModalVisible: false}, () => {
                            alert('لطفا بازه تاریخی را کمتر از 5 ماه وارد کنید !');
                        });
                    } else if (responseData['StatusCode'] === 100021) {
                        this.setState({progressModalVisible: false}, () => {
                            alert('لطفا بازه تاریخی را وارد کنید');
                        });
                    } else if (responseData['StatusCode'] === 700) {
                        this.setState({progressModalVisible: false}, () => {
                            alert("برای شما قبلا با این پزشک در این روز نوبت ثبت شده است");
                        });
                    }
                    else if (responseData['StatusCode'] === 701) {
                        this.setState({progressModalVisible: false}, () => {
                            alert("نوبت های امروز پر شده اند");
                        });
                    }
                    else {
                        this.setState({progressModalVisible: false}, () => {
                            alert('خطا در اتصال به سرویس');
                        });
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }

    onStartDateChange(date) {
        this.setState({selectedStartDate: date, startDateForShow: date});
    }

    onEndDateChange(date) {
        this.setState({selectedEndDate: date, endDateForShow: date});
    }

    getOptions(array) {
        let options = [];
        for (let item of array) {
            options.push(item.value);
        }
        options.push(CANCEL_TEXT);
        return options;
    }

    getObject(array, title) {
        let obj = {id: 0, value: title};
        for (let item of array) {
            if (item.value === title) {
                obj.id = item.id;
            }
            break;
        }
        return obj;
    }

    getCancelButtonIndex(array) {
        return array.indexOf(CANCEL_TEXT);
    }

    getMaxDate() {
        let date = new Date();
        date.setMonth(this.state.minDate.getUTCMonth() + 3);
        return date;
    }

    onBackPressed() {
        console.log(this.props.navigation.state);
        const back = this.props.navigation.getParam('goBack');
        if (back != null && back === 'home') {
            this.props.navigation.push('HomeScreen', {});
        } else {
            this.props.navigation.goBack(null);
        }
    }

    persianToEnglish(input) {
        var array = input.split('');
        var text = '';
        for (let i of array) {
            switch (i) {
                case '۰':
                    text = text + '0';
                    break;
                case '۱':
                    text = text + '1';
                    break;
                case '۲':
                    text = text + '2';
                    break;
                case '۳':
                    text = text + '3';
                    break;
                case '۴':
                    text = text + '4';
                    break;
                case '۵':
                    text = text + '5';
                    break;
                case '۶':
                    text = text + '6';
                    break;
                case '۷':
                    text = text + '7';
                    break;
                case '۸':
                    text = text + '8';
                    break;
                case '۹':
                    text = text + '9';
                    break;
                default:
                    text = text + i;
            }
        }
        return text;
    }

    render() {
        const {doctorQuery} = this.state;
        const doctorData = this.filterDoctorData(doctorQuery);
        const {medicalCenterQuery} = this.state;
        const medicalCenterData = this.filterMedicalCenterData(medicalCenterQuery);
        const MEDICALCENTER = this.props.navigation.getParam('medicalCenter');
        const DOCTOR = this.props.navigation.getParam('doctor');
        return (
            <Root>
                <Container>
                    {(typeof DOCTOR != 'undefined' ||
                        typeof MEDICALCENTER != 'undefined') &&
                    (MEDICALCENTER != null || DOCTOR != null) ? (
                        <Header hasTabs style={{backgroundColor: '#23b9b9'}}>
                            <Left>
                                <Button
                                    transparent
                                    style={styles.headerMenuIcon}
                                    onPress={() => this.onBackPressed()}>
                                    <Icon
                                        style={styles.headerMenuIcon}
                                        name="arrow-back"
                                        onPress={() => this.onBackPressed()}
                                    />
                                </Button>
                            </Left>
                            <Right>
                                <Text style={styles.headerText}>جستجوی نوبت</Text>
                            </Right>
                        </Header>
                    ) : (
                        <Header hasTabs style={{backgroundColor: '#23b9b9'}}>
                            <Left style={{flex: 5}}>
                                <Text style={styles.headerText}>جستجوی نوبت</Text>
                            </Left>
                            <Right style={{flex: 1}}>
                                <Button
                                    transparent
                                    style={styles.headerMenuIcon}
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        this.props.navigation.openDrawer();
                                    }}>
                                    <Icon
                                        style={styles.headerMenuIcon}
                                        name="menu"
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            this.props.navigation.openDrawer();
                                        }}
                                    />
                                </Button>
                            </Right>
                        </Header>
                    )}

                    <Content padder style={styles.content} scrollEnabled={false}>
                        {Platform.OS === 'android' && (
                            <StatusBar
                                barStyle={'dark-content'}
                                backgroundColor={'#209b9b'}
                                hidden={false}
                            />
                        )}


                        {Platform.OS === 'android' &&
                        <Card style={styles.card}>
                            <View style={styles.row}>
                                <Autocomplete
                                    renderTextInput={() => {
                                        return (
                                            <TextInput
                                                onFocus={() => this.setState({doctorsShowData: false})}
                                                onEndEditing={() =>
                                                    this.setState({medicalCentersShowData: false})
                                                }
                                                placeholder={'نام مرکز'}
                                                placeholderTextColor={'#b7b7b7'}
                                                value={medicalCenterQuery}
                                                onChangeText={text => {
                                                    if (text.length === 0) {
                                                        this.setState({
                                                            medicalCenterQuery: null,
                                                            medicalCenterSelected: false,
                                                            medicalCentersShowData: true,
                                                        });
                                                    } else {
                                                        if (this.state.medicalCentersShowData) {
                                                            this.setState({medicalCenterQuery: text});
                                                        } else {
                                                            this.setState({
                                                                medicalCenterQuery: text,
                                                                medicalCentersShowData: true,
                                                            });
                                                        }
                                                    }
                                                }}
                                                style={styles.autocompleteInputStyle}
                                            />
                                        );
                                    }}
                                    hideResults={!this.state.medicalCentersShowData}
                                    containerStyle={[
                                        styles.autocompleteContainerStyle,
                                        {zIndex: 20},
                                    ]}
                                    listStyle={styles.autocompleteListStyle}
                                    listContainerStyle={
                                        !this.state.medicalCenterSelected
                                            ? styles.autocompleteListContainerStyleSelected
                                            : [
                                                styles.autocompleteListContainerStyleSelected,
                                            ]
                                    }
                                    keyboardShouldPersistTaps={'always'}
                                    style={styles.autocompleteInputStyle}
                                    data={medicalCenterData}
                                    renderItem={({item, i}) => (
                                        <TouchableOpacity
                                            style={styles.autocompleteResultStyle}
                                            onPress={() =>
                                                this.setState(
                                                    {
                                                        medicalCenterQuery: item.name,
                                                        medicalCenterSelected: true,
                                                        medicalCentersShowData: false,
                                                    },
                                                    () => {
                                                        Keyboard.dismiss();
                                                    },
                                                )
                                            }>
                                            <View style={styles.autocompleteIconViewStyle}>
                                                <Icon
                                                    type="FontAwesome"
                                                    name="h-square"
                                                    style={styles.autocompleteIconStyle}
                                                />
                                            </View>
                                            <Text style={styles.autocompleteResultTextStyle}>
                                                {item.name}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />

                                <Text style={[styles.label, {marginBottom: 8}]}>
                                    {' '}
                                    مرکز درمانی
                                </Text>
                            </View>
                            <View style={styles.row}>

                                <Autocomplete
                                    renderTextInput={() => {
                                        return (
                                            <TextInput
                                                onFocus={() =>
                                                    this.setState({medicalCentersShowData: false})
                                                }
                                                onEndEditing={() =>
                                                    this.setState({doctorsShowData: false})
                                                }
                                                placeholder={'نام پزشک'}
                                                placeholderTextColor={'#b7b7b7'}
                                                value={doctorQuery}
                                                onChangeText={text => {
                                                    if (text.length === 0) {
                                                        this.setState({
                                                            doctorQuery: null,
                                                            doctorSelected: false,
                                                            doctorsShowData: true,
                                                        });
                                                    } else {
                                                        if (this.state.doctorsShowData) {
                                                            this.setState({doctorQuery: text});
                                                        } else {
                                                            this.setState({
                                                                doctorQuery: text,
                                                                doctorsShowData: true,
                                                            });
                                                        }
                                                    }
                                                }}
                                                style={styles.autocompleteInputStyle}
                                            />
                                        );
                                    }}
                                    hideResults={!this.state.doctorsShowData}
                                    containerStyle={styles.autocompleteContainerStyle}
                                    listStyle={styles.autocompleteListStyle}
                                    listContainerStyle={
                                        !this.state.doctorSelected
                                            ? styles.autocompleteListContainerStyleSelected
                                            : [styles.autocompleteListContainerStyleSelected]
                                    }
                                    keyboardShouldPersistTaps={'always'}
                                    data={doctorData}
                                    renderItem={({item, i}) => (
                                        <TouchableOpacity
                                            style={styles.autocompleteResultStyle}
                                            onPress={() =>
                                                this.setState(
                                                    {
                                                        doctorQuery: item.name,
                                                        doctorSelected: true,
                                                        doctorsShowData: false,
                                                    },
                                                    () => {
                                                        Keyboard.dismiss();
                                                    },
                                                )
                                            }>
                                            <View style={styles.autocompleteIconViewStyle}>
                                                <Icon
                                                    type="FontAwesome"
                                                    name="user-md"
                                                    style={styles.autocompleteIconStyle}
                                                />
                                            </View>
                                            <Text style={styles.autocompleteResultTextStyle}>
                                                {item.name}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />

                                <Text style={[styles.label, {marginBottom: 8}]}> پزشک</Text>
                            </View>
                            <View style={styles.row}>
                                <Button
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        ActionSheet.show(
                                            {
                                                options: this.getOptions(this.state.skills),
                                                cancelButtonIndex: this.getCancelButtonIndex(
                                                    this.getOptions(this.state.skills),
                                                ),
                                                title: 'انتخاب تخصص',
                                            },
                                            buttonIndex => {
                                                if (buttonIndex <= this.state.skills.length - 1) {
                                                    this.setState({
                                                        selectedSkill: this.state.skills[buttonIndex],
                                                    });
                                                } else {
                                                    this.setState({
                                                        selectedSkill: {id: -100, value: ' انتخاب تخصص'},
                                                    });
                                                }
                                            },
                                        );
                                    }}
                                    bordered
                                    style={{
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        margin: 1,
                                        flex: 3,
                                        borderWidth: 1,
                                        borderColor: '#fff',
                                    }}>
                                    <Text style={styles.buttonsTexts}>
                                        {this.state.selectedSkill.value}
                                    </Text>
                                </Button>
                                <Text style={styles.label}>تخصص</Text>
                            </View>
                            <View style={styles.row}>
                                <Button
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        ActionSheet.show(
                                            {
                                                options: this.getOptions(this.state.genders),
                                                cancelButtonIndex: this.getCancelButtonIndex(
                                                    this.getOptions(this.state.genders),
                                                ),
                                                title: 'انتخاب جنسیت',
                                            },
                                            buttonIndex => {
                                                if (buttonIndex <= this.state.genders.length - 1) {
                                                    this.setState({
                                                        selectedGender: this.state.genders[buttonIndex],
                                                    });
                                                } else {
                                                    this.setState({
                                                        selectedGender: {id: -100, value: ' انتخاب جنسیت'},
                                                    });
                                                }
                                            },
                                        );
                                    }}
                                    bordered
                                    style={{
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        margin: 1,
                                        flex: 3,
                                        borderWidth: 1,
                                        borderColor: '#fff',
                                    }}>
                                    <Text style={styles.buttonsTexts}>
                                        {this.state.selectedGender.value}
                                    </Text>
                                </Button>
                                <Text style={styles.label}>جنسیت</Text>
                            </View>
                            <View style={styles.row}>
                                <Button
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        this.setState({startDateModalVisible: true}, () => {
                                        });
                                    }}
                                    bordered
                                    style={{
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        margin: 1,
                                        flex: 3,
                                        borderWidth: 1,
                                        borderColor: '#fff',
                                    }}>
                                    <Text style={styles.buttonsTexts}>
                                        {this.state.startDateForShow == null
                                            ? 'انتخاب تاریخ'
                                            : this.state.startDateForShow.format('jYYYY-jM-jD')}
                                    </Text>
                                </Button>
                                <Text style={styles.label}>از تاریخ</Text>
                            </View>
                            <View style={styles.row}>
                                <Button
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        this.setState({endDateModalVisible: true}, () => {
                                            Keyboard.dismiss();
                                        });
                                    }}
                                    bordered
                                    style={{
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        margin: 1,
                                        flex: 3,
                                        borderWidth: 1,
                                        borderColor: '#fff',
                                    }}>
                                    <Text style={styles.buttonsTexts}>
                                        {this.state.endDateForShow == null
                                            ? 'انتخاب تاریخ'
                                            : this.state.endDateForShow.format('jYYYY-jM-jD')}
                                    </Text>
                                </Button>
                                <Text style={styles.label}>تا تاریخ</Text>
                            </View>
                        </Card>
                        }

                        {Platform.OS === 'ios' && <Card style={[styles.card, {height: 250}]}>
                            <View style={[styles.row, {position: 'absolute', top: 10, zIndex: 5}]}>
                                <Autocomplete
                                    renderTextInput={() => {
                                        return (
                                            <TextInput
                                                onFocus={() =>
                                                    this.setState({doctorsShowData: false})
                                                }
                                                onEndEditing={() =>
                                                    this.setState({medicalCentersShowData: false})
                                                }
                                                placeholder={'نام مرکز'}
                                                placeholderTextColor={'#b7b7b7'}
                                                value={medicalCenterQuery}
                                                onChangeText={text => {
                                                    if (text.length === 0) {
                                                        this.setState({
                                                            medicalCenterQuery: null,
                                                            medicalCenterSelected: false,
                                                            medicalCentersShowData: true,
                                                        });
                                                    } else {
                                                        if (this.state.medicalCentersShowData) {
                                                            this.setState({medicalCenterQuery: text});
                                                        } else {
                                                            this.setState({
                                                                medicalCenterQuery: text,
                                                                medicalCentersShowData: true,
                                                            });
                                                        }
                                                    }
                                                }}
                                                style={styles.autocompleteInputStyle}
                                            />
                                        );
                                    }}
                                    hideResults={!this.state.medicalCentersShowData}
                                    containerStyle={[
                                        styles.autocompleteContainerStyle,
                                        {zIndex: 5},
                                    ]}
                                    listStyle={styles.autocompleteListStyle}
                                    listContainerStyle={
                                        !this.state.medicalCenterSelected
                                            ? styles.autocompleteListContainerStyleSelected
                                            : [
                                                styles.autocompleteListContainerStyleSelected,
                                                // {maxHeight: 0},
                                            ]
                                    }
                                    keyboardShouldPersistTaps={'always'}
                                    style={styles.autocompleteInputStyle}
                                    data={medicalCenterData}
                                    renderItem={({item, i}) => (
                                        <TouchableOpacity
                                            style={styles.autocompleteResultStyle}
                                            onPress={() =>
                                                this.setState(
                                                    {
                                                        medicalCenterQuery: item.name,
                                                        medicalCenterSelected: true,
                                                        medicalCentersShowData: false,
                                                    },
                                                    () => {
                                                        Keyboard.dismiss();
                                                    },
                                                )
                                            }>
                                            <View style={styles.autocompleteIconViewStyle}>
                                                <Icon
                                                    type="FontAwesome"
                                                    name="h-square"
                                                    style={styles.autocompleteIconStyle}
                                                />
                                            </View>
                                            <Text style={styles.autocompleteResultTextStyle}>
                                                {item.name}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />

                                <Text style={[styles.label, {marginBottom: 8}]}>
                                    {' '}
                                    مرکز درمانی
                                </Text>
                            </View>
                            <View style={[styles.row, {position: 'absolute', top: 40, zIndex: 4}]}>

                                <Autocomplete
                                    renderTextInput={() => {
                                        return (
                                            <TextInput
                                                onFocus={() =>
                                                    this.setState({medicalCentersShowData: false})
                                                }
                                                onEndEditing={() =>
                                                    this.setState({doctorsShowData: false})
                                                }
                                                placeholder={'نام پزشک'}
                                                placeholderTextColor={'#b7b7b7'}
                                                value={doctorQuery}
                                                onChangeText={text => {
                                                    if (text.length === 0) {
                                                        this.setState({
                                                            doctorQuery: null,
                                                            doctorSelected: false,
                                                            doctorsShowData: true,
                                                        });
                                                    } else {
                                                        if (this.state.doctorsShowData) {
                                                            this.setState({doctorQuery: text});
                                                        } else {
                                                            this.setState({
                                                                doctorQuery: text,
                                                                doctorsShowData: true,
                                                            });
                                                        }
                                                    }
                                                }}
                                                style={styles.autocompleteInputStyle}
                                            />
                                        );
                                    }}
                                    hideResults={!this.state.doctorsShowData}
                                    containerStyle={styles.autocompleteContainerStyle}
                                    listStyle={styles.autocompleteListStyle}
                                    listContainerStyle={
                                        !this.state.doctorSelected
                                            ? styles.autocompleteListContainerStyleSelected
                                            : [styles.autocompleteListContainerStyleSelected]
                                    }
                                    keyboardShouldPersistTaps={'always'}
                                    data={doctorData}
                                    renderItem={({item, i}) => (
                                        <TouchableOpacity
                                            style={styles.autocompleteResultStyle}
                                            onPress={() =>
                                                this.setState(
                                                    {
                                                        doctorQuery: item.name,
                                                        doctorSelected: true,
                                                        doctorsShowData: false,
                                                    },
                                                    () => {
                                                        Keyboard.dismiss();
                                                    },
                                                )
                                            }>
                                            <View style={styles.autocompleteIconViewStyle}>
                                                <Icon
                                                    type="FontAwesome"
                                                    name="user-md"
                                                    style={styles.autocompleteIconStyle}
                                                />
                                            </View>
                                            <Text style={styles.autocompleteResultTextStyle}>
                                                {item.name}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />

                                <Text style={[styles.label, {marginBottom: 8}]}> پزشک</Text>
                            </View>
                            <View
                                style={[
                                    styles.row,
                                    {position: 'absolute', top: 80, zIndex: 2},
                                ]}>
                                <Button
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        ActionSheet.show(
                                            {
                                                options: this.getOptions(this.state.skills),
                                                cancelButtonIndex: this.getCancelButtonIndex(
                                                    this.getOptions(this.state.skills),
                                                ),
                                                title: 'انتخاب تخصص',
                                            },
                                            buttonIndex => {
                                                if (buttonIndex <= this.state.skills.length - 1) {
                                                    this.setState({
                                                        selectedSkill: this.state.skills[buttonIndex],
                                                    });
                                                } else {
                                                    this.setState({
                                                        selectedSkill: {id: -100, value: ' انتخاب تخصص'},
                                                    });
                                                }
                                            },
                                        );
                                    }}
                                    bordered
                                    style={{
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        margin: 1,
                                        flex: 3,
                                        borderWidth: 1,
                                        borderColor: '#fff',
                                    }}>
                                    <Text style={styles.buttonsTexts}>
                                        {this.state.selectedSkill.value}
                                    </Text>
                                </Button>
                                <Text style={styles.label}>تخصص</Text>
                            </View>
                            <View
                                style={[
                                    styles.row,
                                    {position: 'absolute', top: 110, zIndex: 2},
                                ]}>
                                <Button
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        ActionSheet.show(
                                            {
                                                options: this.getOptions(this.state.genders),
                                                cancelButtonIndex: this.getCancelButtonIndex(
                                                    this.getOptions(this.state.genders),
                                                ),
                                                title: 'انتخاب جنسیت',
                                            },
                                            buttonIndex => {
                                                if (buttonIndex <= this.state.genders.length - 1) {
                                                    this.setState({
                                                        selectedGender: this.state.genders[buttonIndex],
                                                    });
                                                } else {
                                                    this.setState({
                                                        selectedGender: {
                                                            id: -100,
                                                            value: ' انتخاب جنسیت',
                                                        },
                                                    });
                                                }
                                            },
                                        );
                                    }}
                                    bordered
                                    style={{
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        margin: 1,
                                        flex: 3,
                                        borderWidth: 1,
                                        borderColor: '#fff',
                                    }}>
                                    <Text style={styles.buttonsTexts}>
                                        {this.state.selectedGender.value}
                                    </Text>
                                </Button>
                                <Text style={styles.label}>جنسیت</Text>
                            </View>
                            <View
                                style={[
                                    styles.row,
                                    {position: 'absolute', top: 150, zIndex: 2},
                                ]}>
                                <Button
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        this.setState({startDateModalVisible: true}, () => {
                                        });
                                    }}
                                    bordered
                                    style={{
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        margin: 1,
                                        flex: 3,
                                        borderWidth: 1,
                                        borderColor: '#fff',
                                    }}>
                                    <Text style={styles.buttonsTexts}>
                                        {this.state.startDateForShow == null
                                            ? 'انتخاب تاریخ'
                                            : this.state.startDateForShow.format('jYYYY-jM-jD')}
                                    </Text>
                                </Button>
                                <Text style={styles.label}>از تاریخ</Text>
                            </View>
                            <View
                                style={[
                                    styles.row,
                                    {position: 'absolute', top: 180, zIndex: 2},
                                ]}>
                                <Button
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        this.setState({endDateModalVisible: true}, () => {
                                            Keyboard.dismiss();
                                        });
                                    }}
                                    bordered
                                    style={{
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        margin: 1,
                                        flex: 3,
                                        borderWidth: 1,
                                        borderColor: '#fff',
                                    }}>
                                    <Text style={styles.buttonsTexts}>
                                        {this.state.endDateForShow == null
                                            ? 'انتخاب تاریخ'
                                            : this.state.endDateForShow.format('jYYYY-jM-jD')}
                                    </Text>
                                </Button>
                                <Text style={styles.label}>تا تاریخ</Text>
                            </View>
                        </Card>}
                        <Modal
                            style={{opacity: 0.7}}
                            width={300}
                            visible={this.state.progressModalVisible}
                            modalAnimation={
                                new SlideAnimation({
                                    slideFrom: 'bottom',
                                })
                            }>
                            <ModalContent style={styles.modalContent}>
                                <ActivityIndicator
                                    animating={true}
                                    size="small"
                                    color={'#23b9b9'}
                                />
                            </ModalContent>
                        </Modal>

                        <Dialog
                            dialogStyle={{
                                backgroundColor: 'transparent',
                                width: '100%',
                                borderWidth: 0,
                                borderColor: 'transparent',
                                elevation: 0,
                            }}
                            contentStyle={{width: '100%'}}
                            animationType={'fade'}
                            visible={this.state.startDateModalVisible}
                            onTouchOutside={() =>
                                this.setState({startDateModalVisible: false})
                            }>
                            <Card
                                style={{
                                    borderBottomColor: 'gray',
                                    borderWidth: 1,
                                    width: '100%',
                                }}>
                                <CardItem header style={styles.modalTitle}>
                                    <Body style={{alignContent: 'center'}}>
                                        <Text style={styles.modalTitleText}>انتخاب تاریخ شروع</Text>
                                    </Body>
                                </CardItem>
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
                                    textStyle={{color: '#000', fontFamily: 'IRANMarker'}}
                                    onDateChange={this.onStartDateChange}
                                />
                                <CardItem footer style={{backgroundColor: '#fff'}}>
                                    <Body style={{flexDirection: 'row'}}>
                                        <Button
                                            style={styles.modalCancelButton}
                                            onPress={() =>
                                                this.setState({startDateModalVisible: false})
                                            }>
                                            <Text style={styles.modalCancelButtonText}>انصراف</Text>
                                        </Button>
                                        <Button
                                            style={styles.modalSuccessButton}
                                            onPress={() =>
                                                this.setState({startDateModalVisible: false})
                                            }>
                                            <Text style={styles.modalSuccessButtonText}>انتخاب</Text>
                                        </Button>
                                    </Body>
                                </CardItem>
                            </Card>
                        </Dialog>

                        {/* ----------------------EndDate Dialog---------------------------- */}

                        <Dialog
                            dialogStyle={{
                                backgroundColor: 'transparent',
                                borderWidth: 0,
                                borderColor: 'transparent',
                                elevation: 0,
                            }}
                            contentStyle={{width: '100%'}}
                            animationType={'fade'}
                            visible={this.state.endDateModalVisible}
                            onTouchOutside={() =>
                                this.setState({endDateModalVisible: false})
                            }>
                            <Card
                                style={{
                                    borderBottomColor: 'gray',
                                    borderWidth: 1,
                                    width: '100%',
                                }}>
                                <CardItem header style={styles.modalTitle}>
                                    <Body style={{alignContent: 'center'}}>
                                        <Text style={styles.modalTitleText}>
                                            انتخاب تاریخ پایان
                                        </Text>
                                    </Body>
                                </CardItem>
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
                                    textStyle={{color: '#000', fontFamily: 'IRANMarker'}}
                                    onDateChange={this.onEndDateChange}
                                />
                                <CardItem footer style={{backgroundColor: '#fff'}}>
                                    <Body style={{flexDirection: 'row'}}>
                                        <Button
                                            style={styles.modalCancelButton}
                                            onPress={() =>
                                                this.setState({endDateModalVisible: false})
                                            }>
                                            <Text style={styles.modalCancelButtonText}>انصراف</Text>
                                        </Button>
                                        <Button
                                            style={styles.modalSuccessButton}
                                            onPress={() =>
                                                this.setState({endDateModalVisible: false})
                                            }>
                                            <Text style={styles.modalSuccessButtonText}>انتخاب</Text>
                                        </Button>
                                    </Body>
                                </CardItem>
                            </Card>
                        </Dialog>

                        <Modal
                            style={{opacity: 0.7}}
                            width={300}
                            visible={this.state.progressModalVisible}
                            modalAnimation={
                                new SlideAnimation({
                                    slideFrom: 'bottom',
                                })
                            }>
                            <ModalContent
                                style={[
                                    styles.modalContent,
                                    {backgroundColor: 'rgba(47,246,246,0.02)'},
                                ]}>
                                <ActivityIndicator
                                    animating={true}
                                    size="small"
                                    color={'#23b9b9'}
                                />
                            </ModalContent>
                        </Modal>
                    </Content>
                    <Footer style={styles.footer}>
                        <Button
                            style={styles.button}
                            onPress={() => {
                                if (
                                    this.state.selectedStartDate !== null &&
                                    this.state.selectedEndDate !== null
                                ) {
                                    this.searchServicePlans(
                                        this.state.medicalCenterQuery,
                                        this.state.doctorQuery,
                                        this.state.selectedSkill,
                                        this.state.selectedGender,
                                        this.persianToEnglish(
                                            this.state.selectedStartDate
                                                .format('YYYY-M-D')
                                                .toString(),
                                        ),
                                        this.persianToEnglish(
                                            this.state.selectedEndDate.format('YYYY-M-D').toString(),
                                        ),
                                    );
                                } else {
                                    alert('لطفا بازه زمانی مورد نظر خود را انتخاب کنید');
                                }
                            }}>
                            <Text
                                style={[
                                    {color: '#fff', fontSize: 15, fontFamily: 'IRANMarker'},
                                ]}>
                                جستجو
                            </Text>
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
        color: '#fff',
    },
    icons: {
        color: '#fff',
        fontSize: 20,
    },
    tabsText: {
        fontSize: 10,
        color: '#fff',
    },
    viewStyle: {
        flex: 1,
        flexDirection: 'column',
    },
    tabHeading: {
        backgroundColor: '#fff',
    },
    tabIcon: {
        fontSize: 20,
        color: '#1e8080',
    },
    tabText: {
        fontSize: 10,
        color: '#1e8080',
    },
    footer: {
        backgroundColor: '#fff',
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
        backgroundColor: '#23b9b9',
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
        padding: 1,
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
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    Input: {
        color: '#000',
        fontFamily: 'IRANMarker',
        margin: 1,
        backgroundColor: '#fff',
        marginRight: 2,
        justifyContent: 'center',
        alignContent: 'center',
        borderRadius: 3,
        borderColor: '#eeeeee',
        borderWidth: 1,
        flex: 3,
        alignSelf: 'flex-start',
        padding: 5,
        fontSize: 10,
        textAlign: 'right',
    },
    modalTitle: {
        backgroundColor: '#23b9b9',
    },
    modalTitleText: {
        color: '#fff',
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 14,
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
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    modalCancelButtonText: {
        color: '#23b9b9',
        fontSize: 10,
        fontWeight: 'bold',
    },
    dateModalContent: {
        backgroundColor: 'rgba(47,246,246,0.06)',
    },
    modalContent: {
        marginTop: 5,
        padding: 2,
        alignContent: 'center',
        backgroundColor: 'rgba(47,246,246,0.06)',
    },
    buttonsTexts: {
        fontFamily: 'IRANMarker',
        padding: 1,
        textAlign: 'center',
        borderRadius: 2,
        flex: 2,
        fontSize: 11,
        color: '#23b9b9',
        borderWidth: 1,
        borderColor: '#23b9b9',
    },
    autocompleteContainerStyle: {
        flex: 3,
        left: 4,
        position: 'absolute',
        right: 110,
        top: 0,
        zIndex: 10,
    },
    autocompleteInputStyle: {
        color: '#23b9b9',
        fontFamily: 'IRANMarker',
        padding: 1,
        marginRight: 2,
        fontSize: 10,
        textAlign: 'right',
    },
    autocompleteResultTextStyle: {
        flex: 10,
        color: 'gray',
        fontFamily: 'IRANMarker',
        fontSize: 11,
        padding: 1,
        marginRight: 3,
        textAlign: 'right',
    },
    autocompleteResultStyle: {
        flexDirection: 'row-reverse',
        backgroundColor: '#fff',
        borderBottomColor: '#c7c7c7',
        borderBottomWidth: 1,
    },
    autocompleteListStyle: {
        borderColor: '#c7c7c7',
        borderWidth: 1,
        borderRightColor: 'transparent',
        borderLeftColor: 'transparent',
        borderBottomEndRadius: 2,
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 3,
    },
    autocompleteListContainerStyleSelected: {
        width: '100%',
        borderWidth: 0,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        paddingRight: 10,
        paddingLeft: 10,
        minHeight: 0,
        maxHeight: 100,
    },
    autocompleteListContainerStyleDeSelected: {
        borderWidth: 0,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        paddingRight: 10,
        paddingLeft: 10,
        minHeight: 0,
        maxHeight: 0,
    },
    autocompleteIconViewStyle: {
        marginRight: 2,
        marginLeft: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },
    autocompleteIconStyle: {
        alignSelf: 'center',
        color: 'gray',
        fontSize: 15,
    },
});
