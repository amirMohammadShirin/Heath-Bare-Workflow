import React, {Component} from 'react';
import {ActivityIndicator, AsyncStorage, StatusBar, StyleSheet, Text, View} from 'react-native';
import {
    ActionSheet,
    Button,
    Card,
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
    CheckBox,
    Footer,
} from 'native-base';
import Modal, {ModalContent, SlideAnimation} from "react-native-modals";


const GETSERVICES = '/api/GetServices';
const GETFACILITIES = '/api/GetFacilities';

const GETSERVICEDETAILS = '/api/GetServiceDetails';

const GETGENDERS = '/api/GetGenders';
const GETSKILLS = '/api/GetSkills';
const GETCERTIFICATES = '/api/GetCertificates';
const MEDICALCENTERADVANCESEARCH = '/api/MedicalCenterAdvanceSearch';
const DOCTORADVANCESEARCH = '/api/DoctorAdvanceSearch';
const CANCEL_TEXT = 'انصراف';
const DOCTOROFSPECIFICMEDICALCENTERADVANCESEARCH = '/api/DoctorOfSpecificMedicalCenterAdvanceSearch';
export default class AdvanceSearchScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            progressModalVisible: false,
            token: null,
            baseUrl: null,
            checkAddress: false,
            selectedState: {id: -100, value: 'انتخاب منطقه'},
            selectedService: {id: -100, value: ' انتخاب سرویس'},
            selectedKind: {id: -100, value: 'انتخاب نوع مرکز'},
            selectedServiceDetail: {id: -100, value: ' انتخاب زیرخدمت'},
            selectedFacility: {id: -100, value: ' انتخاب امکانات'},
            selectedSkill: {id: -100, value: ' انتخاب تخصص'},
            selectedGender: {id: -100, value: ' انتخاب جنسیت'},
            selectedCertificate: {id: -100, value: ' انتخاب سطح علمی'},
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
            kinds: [
                {id: 0, value: "هر دو"},
                {id: 1, value: "آزاد"},
                {id: 2, value: "طرف قرارداد"},
            ],
            services: null,
            facilities: null,
            skills: [
                {id: 0, value: 'دندانپزشک'},
                {id: 1, value: 'چشم پزشک'},
                {id: 2, value: 'فیزیوتراپ'},
                {id: 3, value: 'روانپزشک'},
                {id: 4, value: 'جراح فک و دندان'},
                {id: 5, value: 'پزشک داخلی'},
            ],
            genders: null,
            certificates: [
                {id: 0, value: 'تخصص'},
                {id: 1, value: 'فوق تخصص'},
                {id: 2, value: 'عمومی'},
                {id: 3, value: 'هر سه'},
            ],
            serviceDetails: null,
            medicalCenterResult: null,

        }


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

    onBackPressed() {
        if (this.props.navigation.getParam('doctor')) {
            this.props.navigation.navigate('SearchDoctorScreen',
                {medicalCenter: this.props.navigation.getParam('medicalCenter')})
        } else {
            this.props.navigation.goBack()
        }

    }

    async componentWillMount(): void {
        var token = await AsyncStorage.getItem('token');
        var baseUrl = await AsyncStorage.getItem('baseUrl')
        this.setState({baseUrl: baseUrl, token: token}, () => {
            if (this.props.navigation.getParam('doctor')) {
                this.getGenders()
            } else {
                this.getServices()
            }
        })
    }

    async doctorAdvanceSearch(gender, skill, certificate) {
        if (gender.id === -100 && skill.id === -100 && certificate.id === -100) {
            alert('لطفا فیلد ها را انتخاب کنید')
        } else {
            if (this.state.medicalCenter != null) {
                // console.log(body)
                await this.setState({progressModalVisible: true})
                console.log(JSON.stringify({
                    Skill: skill.value,
                    Gender: gender.id === -200 ? null : gender.value,
                    Certificate: certificate.id,
                }))
                await fetch(this.state.baseUrl + DOCTOROFSPECIFICMEDICALCENTERADVANCESEARCH, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        Accept: 'application/json',
                        'Authorization': 'Bearer ' + new String(this.state.token)
                    },
                    body: JSON.stringify({
                        Skill: skill.value,
                        Gender: gender.id === -200 ? null : gender.value,
                        Certificate: certificate.value,
                        medicalCenter: this.state.medicalCenter,
                        headerFontSize: this.props.navigation.getParam('headerFontSize')
                    })
                }).then((response) => response.json())
                    .then(async (responseData) => {
                        if (responseData['StatusCode'] === 200) {
                            if (responseData['Data'] != null) {
                                let data = responseData['Data'];
                                // console.log('data : ' + JSON.stringify(responseData))
                                if (data.length > 0) {
                                    this.setState({progressModalVisible: false}, () => {
                                        this.setState({medicalCenterResult: data}, () => {
                                            alert(JSON.stringify(this.state.medicalCenterResult))
                                            this.props.navigation.navigate('DoctorsResultScreen', {
                                                result: data,
                                                Gender: gender.id === -200 ? 'مرد یا زن' : gender.value,
                                                Certificate: certificate.value,
                                                Skill: skill.value,
                                                MedicalCenter: this.state.medicalCenter.Title
                                            });
                                        })
                                    })
                                } else {
                                    this.setState({progressModalVisible: false}, () => {
                                        alert('موردی یافت نشد')
                                    })
                                }
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
            } else {
                // console.log(body)
                await this.setState({progressModalVisible: true})
                console.log(JSON.stringify({
                    Skill: skill.value,
                    Gender: gender.id === -200 ? null : gender.value,
                    Certificate: certificate.id,
                }))
                await fetch(this.state.baseUrl + DOCTORADVANCESEARCH, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        Accept: 'application/json',
                        'Authorization': 'Bearer ' + new String(this.state.token)
                    },
                    body: JSON.stringify({
                        Skill: skill.value,
                        Gender: gender.id === -200 ? null : gender.value,
                        Certificate: certificate.value,
                        medicalCenter: null
                    })
                }).then((response) => response.json())
                    .then(async (responseData) => {
                        if (responseData['StatusCode'] === 200) {
                            if (responseData['Data'] != null) {
                                let data = responseData['Data'];
                                // console.log('data : ' + JSON.stringify(responseData))
                                if (data.length > 0) {
                                    this.setState({progressModalVisible: false}, () => {
                                        this.setState({medicalCenterResult: data}, () => {
                                            this.props.navigation.navigate('DoctorsResultScreen', {
                                                result: data,
                                                Gender: gender.id === -200 ? 'مرد یا زن' : gender.value,
                                                Certificate: certificate.value,
                                                Skill: skill.value,

                                            });
                                        })
                                    })
                                } else {
                                    this.setState({progressModalVisible: false}, () => {
                                        alert('موردی یافت نشد')
                                    })
                                }
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
        }
    }

    async getServices() {
        await this.setState({progressModalVisible: true})
        await fetch(this.state.baseUrl + GETSERVICES, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(this.state.token)
            },
        }).then((response) => response.json())
            .then(async (responseData) => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        this.setState({progressModalVisible: false}, async () => {
                            await this.setState({services: data})
                            await this.getFacilities()
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

    async getFacilities() {
        await this.setState({progressModalVisible: true})
        await fetch(this.state.baseUrl + GETFACILITIES, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(this.state.token)
            },
        }).then((response) => response.json())
            .then(async (responseData) => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        this.setState({progressModalVisible: false}, async () => {
                            await this.setState({facilities: data})
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
                            data.push({id: -200, value: 'هردو'})
                            this.setState({genders: data})
                            this.getSkills();
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
                            this.getCertificates();
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

    async getCertificates() {
        await this.setState({progressModalVisible: true})
        await fetch(this.state.baseUrl + GETCERTIFICATES, {
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
                            this.setState({certificates: data})

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

    async medicalCenterAdvanceSearch(state, facility, kind, service, serviceDetail) {
        if (state.id === -100 || facility.id === -100 || kind.id === -100 || service.id === -100) {
            alert('لطفا فیلد ها را انتخاب کنید')
        } else {
            // console.log(body)
            await this.setState({progressModalVisible: true})
            await fetch(this.state.baseUrl + MEDICALCENTERADVANCESEARCH, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    Accept: 'application/json',
                    'Authorization': 'Bearer ' + new String(this.state.token)
                },
                body: JSON.stringify({
                    IsContract: kind.id === 0 ? null : kind.id === 1 ? false : true,
                    Service: service.value,
                    ServiceDetails: serviceDetail.id === -100 ? null : serviceDetail.value,
                    // State: await state.value,
                    Facility: facility.value
                })
            }).then((response) => response.json())
                .then(async (responseData) => {
                    if (responseData['StatusCode'] === 200) {
                        if (responseData['Data'] != null) {
                            let data = responseData['Data'];
                            // console.log('data : ' + JSON.stringify(responseData))
                            if (data.length > 0) {
                                this.setState({progressModalVisible: false}, () => {
                                    this.setState({medicalCenterResult: data}, () => {
                                        // alert(JSON.stringify(this.state.medicalCenterResult))
                                        this.props.navigation.navigate('MedicalCenterResultScreen', {
                                            result: data,
                                            IsContract: kind.id === 0 ? 'طرف قرارداد یا آزاد' :
                                                kind.id === 1 ? 'آزاد' : 'طرف قرارداد',
                                            Service: service.value,
                                            ServiceDetails: serviceDetail.id === -100 ? null : serviceDetail.value,
                                            // State: await state.value,
                                            Facility: facility.value

                                        });
                                    })
                                })
                            } else {
                                this.setState({progressModalVisible: false}, () => {
                                    alert('موردی یافت نشد')
                                })
                            }
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
    }

    render() {
        if (this.props.navigation.getParam('doctor')) {
            return (
                <Container>
                    <StatusBar translucent backgroundColor={"#219e9e"} barStyle={"light-content"}/>
                    <Header style={styles.header}>
                        <Left style={{flex: 1}}>
                            <Button transparent style={styles.headerMenuIcon}
                                    onPress={() => this.onBackPressed()}>
                                <Icon style={styles.headerMenuIcon} name='arrow-back'
                                      onPress={() => this.onBackPressed()}/>
                            </Button>
                        </Left>
                        <Right style={{flex: 5}}>
                            <Text style={[styles.headerText,
                                {
                                    fontSize: (this.props.navigation.getParam('medicalCenter') !== null) ?
                                        this.props.navigation.getParam('headerFontSize') : 20
                                }]}>{
                                (this.props.navigation.getParam('medicalCenter') != null) ?
                                    'جستجو پیشرفته در ' + this.props.navigation.getParam('medicalCenter').Title :
                                    'جستجوی پیشرفته '
                            }</Text>
                        </Right>
                    </Header>
                    <Root>
                        <Content padder style={styles.content}>

                            {/*skill*/}
                            {this.state.skills != null && <CardItem bordered>
                                <Body style={styles.row}>
                                    <Button
                                        onPress={() => {
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
                                        flex: 2,
                                        borderWidth: 1,
                                        borderColor: '#fff',

                                    }}>
                                        <Text style={styles.filters}>{this.state.selectedSkill.value}</Text>
                                    </Button>
                                    <View style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        alignContent: 'center'
                                    }}>
                                        <Text style={styles.label}
                                        >تخصص</Text>
                                    </View>
                                </Body>
                            </CardItem>}
                            {/*gender*/}
                            {this.state.genders != null && <CardItem bordered>
                                <Body style={styles.row}>
                                    <Button
                                        onPress={() => {
                                            ActionSheet.show(
                                                {
                                                    options: this.getOptions(this.state.genders),
                                                    cancelButtonIndex: this.getCancelButtonIndex(
                                                        this.getOptions(this.state.genders)),
                                                    title: "انتخاب جنسیت"
                                                },
                                                buttonIndex => {
                                                    if (buttonIndex <= this.state.genders.length - 1)
                                                        this.setState(
                                                            {selectedGender: this.state.genders[buttonIndex]});
                                                }
                                            )
                                        }}
                                        bordered style={{
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        margin: 1,
                                        flex: 2,
                                        borderWidth: 1,
                                        borderColor: '#fff',

                                    }}>
                                        <Text style={styles.filters}>{this.state.selectedGender.value}</Text>
                                    </Button>
                                    <View style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        alignContent: 'center'
                                    }}>
                                        <Text style={styles.label}
                                        >جنسیت</Text>
                                    </View>
                                </Body>
                            </CardItem>}
                            {/*certificate*/}
                            {this.state.certificates != null && <CardItem bordered>
                                <Body style={styles.row}>
                                    <Button
                                        bordered style={{
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        margin: 1,
                                        flex: 2,
                                        borderWidth: 1,
                                        borderColor: '#fff',
                                    }}
                                        onPress={() => ActionSheet.show(
                                            {
                                                options: this.getOptions(this.state.certificates),
                                                cancelButtonIndex: this.getCancelButtonIndex(
                                                    this.getOptions(this.state.certificates)),
                                                title: "انتخاب سطح علمی"
                                            },
                                            buttonIndex => {
                                                if (buttonIndex <= this.state.certificates.length - 1)
                                                    this.setState(
                                                        {selectedCertificate: this.state.certificates[buttonIndex]});
                                            }
                                        )}
                                    >
                                        <Text style={styles.filters}>{this.state.selectedCertificate.value}</Text>
                                    </Button>
                                    <View style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        alignContent: 'center'
                                    }}>
                                        <Text style={styles.label}
                                        >سطح علمی</Text>
                                    </View>
                                </Body>
                            </CardItem>}
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
                        <Footer style={{backgroundColor: '#fff'}}>
                            <Button style={{
                                backgroundColor: '#23b9b9',
                                alignSelf: 'center',
                                width: '80%',
                                marginRight: 10,
                                marginLeft: 10,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}

                                    onPress={() => {
                                        this.doctorAdvanceSearch(this.state.selectedGender, this.state.selectedSkill,
                                            this.state.selectedCertificate)
                                    }
                                    }

                            >
                                <Text style={styles.searchButton}>جستجو</Text>
                            </Button>
                        </Footer>
                    </Root>
                </Container>
            );
        } else if (this.props.navigation.getParam('medicalCenter')) {
            return (
                <Container>
                    <Header style={styles.header}>
                        <Left>
                            <Button transparent style={styles.headerMenuIcon}
                                    onPress={() => this.onBackPressed()}>
                                <Icon style={styles.headerMenuIcon} name='arrow-back'
                                      onPress={() => this.onBackPressed()}/>
                            </Button>
                        </Left>
                        <Right>
                            <Text style={styles.headerText}>جستجوی پیشرفته</Text>
                        </Right>
                    </Header>
                    <Root>
                        <Content padder style={styles.content}>

                            <Card>
                                {/*kinds*/}
                                <CardItem bordered>
                                    <Body style={styles.row}>
                                        <Button
                                            onPress={() => {
                                                ActionSheet.show(
                                                    {
                                                        options: this.getOptions(this.state.kinds),
                                                        cancelButtonIndex: this.getCancelButtonIndex(
                                                            this.getOptions(this.state.kinds)),
                                                        title: "انتخاب نوع مرکز"
                                                    },
                                                    buttonIndex => {
                                                        if (buttonIndex <= this.state.kinds.length - 1)
                                                            this.setState(
                                                                {selectedKind: this.state.kinds[buttonIndex]});
                                                    }
                                                )
                                            }}
                                            bordered style={{
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 2,
                                            margin: 1,
                                            flex: 2,
                                            borderWidth: 1,
                                            borderColor: '#fff',

                                        }}>
                                            <Text style={{
                                                fontFamily: 'IRANMarker',
                                                padding: 1,
                                                textAlign: 'center',
                                                borderRadius: 2,
                                                flex: 2,
                                                fontSize: 13,
                                                color: '#23b9b9',
                                                borderWidth: 1,
                                                borderColor: '#23b9b9',

                                            }}>{this.state.selectedKind.value}</Text>
                                        </Button>
                                        <View style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            alignContent: 'center'
                                        }}>
                                            <Text style={{
                                                fontFamily: 'IRANMarker',
                                                padding: 1,
                                                textAlign: 'right',
                                                marginTop: 10,
                                                marginRight: 5,
                                                marginLeft: 5,
                                                flex: 1,
                                                alignSelf: 'center',
                                                fontSize: 16,
                                            }}
                                            >نوع مرکز</Text>
                                        </View>
                                    </Body>
                                </CardItem>
                                {/*states*/}
                                <CardItem bordered>
                                    <Body style={styles.row}>
                                        <Button
                                            onPress={() => {
                                                ActionSheet.show(
                                                    {
                                                        options: this.getOptions(this.state.states),
                                                        cancelButtonIndex: this.getCancelButtonIndex(
                                                            this.getOptions(this.state.states)),
                                                        title: "انتخاب منطقه"
                                                    },
                                                    buttonIndex => {
                                                        if (buttonIndex <= this.state.states.length - 1)
                                                            this.setState(
                                                                {selectedState: this.state.states[buttonIndex]});
                                                    }
                                                )
                                            }}
                                            bordered style={{
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 2,
                                            margin: 1,
                                            flex: 2,
                                            borderWidth: 1,
                                            borderColor: '#fff',

                                        }}>
                                            <Text style={{
                                                fontFamily: 'IRANMarker',
                                                padding: 1,
                                                textAlign: 'center',
                                                borderRadius: 2,
                                                flex: 2,
                                                fontSize: 13,
                                                color: '#23b9b9',
                                                borderWidth: 1,
                                                borderColor: '#23b9b9',

                                            }}>{this.state.selectedState.value}</Text>
                                        </Button>
                                        <View style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            alignContent: 'center'
                                        }}>
                                            <Text style={{
                                                fontFamily: 'IRANMarker',
                                                padding: 1,
                                                textAlign: 'right',
                                                marginTop: 10,
                                                marginRight: 5,
                                                marginLeft: 5,
                                                flex: 1,
                                                alignSelf: 'center',
                                                fontSize: 16,
                                            }}
                                            >منطقه</Text>
                                        </View>
                                    </Body>
                                </CardItem>
                                {/*services*/}
                                {this.state.services != null && <CardItem bordered>
                                    <Body style={styles.row}>
                                        <Button
                                            onPress={() => {
                                                ActionSheet.show(
                                                    {
                                                        options: this.getOptions(this.state.services),
                                                        cancelButtonIndex: this.getCancelButtonIndex(
                                                            this.getOptions(this.state.services)),
                                                        title: "انتخاب سرویس"
                                                    },
                                                    buttonIndex => {
                                                        if (buttonIndex <= this.state.services.length - 1)
                                                            this.setState(
                                                                {
                                                                    selectedService: this.state.services[buttonIndex],
                                                                    serviceDetails: this.state.services[buttonIndex].serviceDetails
                                                                });
                                                    }
                                                )
                                            }}
                                            bordered style={{
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 2,
                                            margin: 1,
                                            flex: 2,
                                            borderWidth: 1,
                                            borderColor: '#fff',

                                        }}>
                                            <Text style={{
                                                fontFamily: 'IRANMarker',
                                                padding: 1,
                                                textAlign: 'center',
                                                borderRadius: 2,
                                                flex: 2,
                                                fontSize: 13,
                                                color: '#23b9b9',
                                                borderWidth: 1,
                                                borderColor: '#23b9b9',

                                            }}>{this.state.selectedService.value}</Text>
                                        </Button>
                                        <View style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            alignContent: 'center'
                                        }}>
                                            <Text style={{
                                                fontFamily: 'IRANMarker',
                                                padding: 1,
                                                textAlign: 'right',
                                                marginTop: 10,
                                                marginRight: 5,
                                                marginLeft: 5,
                                                flex: 1,
                                                alignSelf: 'center',
                                                fontSize: 16,
                                            }}
                                            >سرویس</Text>
                                        </View>
                                    </Body>
                                </CardItem>}
                                {/*serviceDetails*/}
                                {this.state.selectedService.id != -100 && this.state.serviceDetails.length > 0 &&
                                <CardItem bordered>
                                    {this.state.serviceDetails != null && <Body style={styles.row}>
                                        <Button
                                            onPress={() => {
                                                ActionSheet.show(
                                                    {
                                                        options: this.getOptions(this.state.serviceDetails),
                                                        cancelButtonIndex: this.getCancelButtonIndex(
                                                            this.getOptions(this.state.serviceDetails)),
                                                        title: "انتخاب زیر قدمت"
                                                    },
                                                    buttonIndex => {
                                                        if (buttonIndex <= this.state.serviceDetails.length - 1)
                                                            this.setState(
                                                                {selectedServiceDetail: this.state.serviceDetails[buttonIndex]});
                                                    }
                                                )
                                            }}
                                            bordered style={{
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 2,
                                            margin: 1,
                                            flex: 2,
                                            borderWidth: 1,
                                            borderColor: '#fff',

                                        }}>
                                            <Text style={{
                                                fontFamily: 'IRANMarker',
                                                padding: 1,
                                                textAlign: 'center',
                                                borderRadius: 2,
                                                flex: 2,
                                                fontSize: 13,
                                                color: '#23b9b9',
                                                borderWidth: 1,
                                                borderColor: '#23b9b9',

                                            }}>{this.state.selectedServiceDetail.value}</Text>
                                        </Button>
                                        <View style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            alignContent: 'center'
                                        }}>
                                            <Text style={{
                                                fontFamily: 'IRANMarker',
                                                padding: 1,
                                                textAlign: 'right',
                                                marginTop: 10,
                                                marginRight: 5,
                                                marginLeft: 5,
                                                flex: 1,
                                                alignSelf: 'center',
                                                fontSize: 16,
                                            }}
                                            >زیر خدمت</Text>
                                        </View>
                                    </Body>}
                                </CardItem>}
                                {/*facilities*/}
                                {this.state.facilities != null && <CardItem bordered>
                                    <Body style={styles.row}>
                                        <Button
                                            onPress={() => {
                                                ActionSheet.show(
                                                    {
                                                        options: this.getOptions(this.state.facilities),
                                                        cancelButtonIndex: this.getCancelButtonIndex(
                                                            this.getOptions(this.state.facilities)),
                                                        title: "انتخاب امکانات"
                                                    },
                                                    buttonIndex => {
                                                        if (buttonIndex <= this.state.facilities.length - 1)
                                                            this.setState(
                                                                {selectedFacility: this.state.facilities[buttonIndex]});
                                                    }
                                                )
                                            }}
                                            bordered style={{
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 2,
                                            margin: 1,
                                            flex: 2,
                                            borderWidth: 1,
                                            borderColor: '#fff',

                                        }}>
                                            <Text style={{
                                                fontFamily: 'IRANMarker',
                                                padding: 1,
                                                textAlign: 'center',
                                                borderRadius: 2,
                                                flex: 2,
                                                fontSize: 13,
                                                color: '#23b9b9',
                                                borderWidth: 1,
                                                borderColor: '#23b9b9',

                                            }}>{this.state.selectedFacility.value}</Text>
                                        </Button>
                                        <View style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            alignContent: 'center'
                                        }}>
                                            <Text style={{
                                                fontFamily: 'IRANMarker',
                                                padding: 1,
                                                textAlign: 'right',
                                                marginTop: 10,
                                                marginRight: 5,
                                                marginLeft: 5,
                                                flex: 1,
                                                alignSelf: 'center',
                                                fontSize: 16,
                                            }}
                                            >امکانات</Text>
                                        </View>
                                    </Body>
                                </CardItem>}
                                {/*location*/}
                                <CardItem bordered>
                                    <Left>
                                        <CheckBox color={'#23b9b9'} checked={this.state.checkAddress} onPress={() => {
                                            this.setState({checkAddress: !this.state.checkAddress})
                                        }}/>
                                    </Left>
                                    <Body style={styles.row}>
                                        <Text style={{
                                            fontFamily: 'IRANMarker',
                                            padding: 1,
                                            textAlign: 'right',
                                            flex: 1,
                                            fontSize: 13,
                                            color: '#23b9b9',
                                        }}
                                              onPress={() => {
                                                  this.setState({checkAddress: !this.state.checkAddress})
                                              }}
                                        >
                                            نزدیک به من
                                        </Text>
                                    </Body>
                                </CardItem>
                            </Card>
                        </Content>
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
                        <Footer style={{backgroundColor: '#fff'}}>
                            <Button style={{
                                backgroundColor: '#23b9b9',
                                alignSelf: 'center',
                                width: '80%',
                                marginRight: 10,
                                marginLeft: 10,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                                    onPress={() => {
                                        this.medicalCenterAdvanceSearch(
                                            this.state.selectedState,
                                            this.state.selectedFacility,
                                            this.state.selectedKind,
                                            this.state.selectedService,
                                            this.state.selectedServiceDetail
                                        )
                                    }}
                            >
                                <Text style={{
                                    color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'IRANMarker',
                                }}>جستجو</Text>
                            </Button>
                        </Footer>
                    </Root>
                </Container>
            )
                ;
        }
    }
}

AdvanceSearchScreen.navigationOptions = {
    header: null,
    title: 'جستجوی پیشرفته',
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
        borderColor: '#23b9b9',
        borderWidth: 1,
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
        flex: 1,
        padding: 3,
        margin: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    modalContent: {
        marginTop: 5,
        padding: 2,
        alignContent: 'center',
        backgroundColor: 'rgba(47,246,246,0.02)'
    },
    filters: {
        fontFamily: 'IRANMarker',
        padding: 1,
        textAlign: 'center',
        borderRadius: 2,
        flex: 2,
        fontSize: 13,
        color: '#23b9b9',
        borderWidth: 1,
        borderColor: '#23b9b9',
    },
    label: {
        fontFamily: 'IRANMarker',
        padding: 1,
        textAlign: 'right',
        marginTop: 10,
        marginRight: 5,
        marginLeft: 5,
        flex: 1,
        alignSelf: 'center',
        fontSize: 16,
    },
    searchButton:
        {
            fontFamily: 'IRANMarker',
            color: '#fff',
            textAlign: 'center',
            fontSize: 15
        }

});
