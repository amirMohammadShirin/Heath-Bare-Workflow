import React, {Component} from 'react';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    Keyboard,
    View, Platform
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
    Input,
    ListItem
} from 'native-base';
import Modal, {ModalButton, ModalContent, ModalFooter, ModalTitle, SlideAnimation} from "react-native-modals";


const SEARCHDOCTORALLFIELD = '/api/SearchDoctorAllField';
const GETFAVORITEDOCTORS = '/api/GetFavoriteDoctors';
const SEARCHALLFIELDOFDOCTOROFSPECIFICMEDICALCENTER = '/api/SearchAllFieldOfDoctorOfSpecificMedicalCenter';
export default class SearchMedicalCenter extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedDoctor: null,
            selectedMedicalCenter: null,
            doctorTitle: '',
            visible: false,
            data: [],
            previousLength: -1,
            searchTerm: '',
            baseUrl: null,
            token: null,
            progressModalVisible: false,
            headerFontSize: 20,
            favoriteDoctors: []
        };
    }

    goToDetailsScreen(value) {

        this.props.navigation.navigate('DetailsScreen', {doctor: value, medicalCenter: null})


    }

    async goToReserveScreen() {
        if (this.state.selectedMedicalCenter != null) {
            this.props.navigation.navigate('ReserveScreen', {
                doctor: this.state.selectedDoctor,
                medicalCenter: this.state.selectedMedicalCenter
            })
        } else {
            this.props.navigation.navigate('ReserveScreen', {
                doctor: this.state.selectedDoctor,
            })
        }

    }

    renderList() {

        this.state.medicalCenters.map((value, index) => {
            if (value.name.includes(this.state.medicalCenterSelectedValue)) {
                return (
                    <View key={index}>
                        <Text>
                            value.name
                        </Text>
                    </View>
                )
            }
        })

    }

    generateTitle(doctor) {
        if (doctor != null) {
            let title = doctor.FirstName + ' ' + doctor.LastName;
            return title;
        }
    }

    async componentWillMount(): void {
        const token = await AsyncStorage.getItem('token');
        const baseUrl = await AsyncStorage.getItem('baseUrl');
        if (typeof this.props.navigation.getParam('medicalCenter') !== "undefined" &&
            this.props.navigation.getParam('medicalCenter') != null) {
            const medicalCenter = this.props.navigation.getParam('medicalCenter');
            try {
                const length = medicalCenter.Title.length;
                await this.setState({
                    selectedMedicalCenter: medicalCenter,
                    headerFontSize: length >= 20 ? 15 : 20,
                    baseUrl: baseUrl,
                    token: token,
                })
            } catch (e) {
                await this.setState({
                        baseUrl: baseUrl,
                        token: token,
                    },
                    () => {

                        this.getFavoriteDoctors()

                    }
                )
            }

        } else {
            await this.setState({
                    baseUrl: baseUrl,
                    token: token,
                },
                () => {

                    this.getFavoriteDoctors()

                }
            )
        }
    }


    async search(text) {
        if (await this.state.selectedMedicalCenter != null) {
            const medicalCenter = this.state.selectedMedicalCenter;
            await this.setState({progressModalVisible: true})
            await fetch(this.state.baseUrl + SEARCHALLFIELDOFDOCTOROFSPECIFICMEDICALCENTER, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    Accept: 'application/json',
                    'Authorization': 'Bearer ' + new String(this.state.token)
                },
                body: JSON.stringify({
                    SearchWord: text,
                    MedicalCenter: new String(medicalCenter.Title)
                })
            }).then(async (response) => response.json())
                .then(async (responseData) => {
                    if (responseData['StatusCode'] === 200) {
                        if (responseData['Data'] != null) {
                            let data = responseData['Data'];
                            await this.setState({progressModalVisible: false}, async () => {
                                await this.setState({data: data})
                            })
                        }
                    } else {
                        await this.setState({progressModalVisible: false}, () => {
                            alert(JSON.stringify('خطا در دسترسی به سرویس'))
                            console.log(JSON.stringify(responseData))
                        })

                    }
                })
                .catch((error) => {
                    console.error(error)
                    // alert(error)
                })
        } else {
            await this.setState({progressModalVisible: true})
            await fetch(this.state.baseUrl + SEARCHDOCTORALLFIELD, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    Accept: 'application/json',
                    'Authorization': 'Bearer ' + new String(this.state.token)
                },
                body: JSON.stringify({
                    SearchWord: text
                })
            }).then(async (response) => response.json())
                .then(async (responseData) => {
                    if (responseData['StatusCode'] === 200) {
                        if (responseData['Data'] != null) {
                            let data = responseData['Data'];
                            await this.setState({progressModalVisible: false}, async () => {
                                await this.setState({data: data})
                            })
                        }
                    } else {
                        await this.setState({progressModalVisible: false}, () => {
                            alert(JSON.stringify(JSON.stringify(responseData)))
                            // alert(JSON.stringify('خطا در دسترسی به سرویس'))
                        })

                    }
                })
                .catch((error) => {
                    console.error(error)
                    // alert(error)
                })
        }
    }


    async getFavoriteDoctors() {
        await this.setState({progressModalVisible: true})
        await fetch(this.state.baseUrl + GETFAVORITEDOCTORS, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(this.state.token)
            },
        }).then(async (response) => response.json())
            .then(async (responseData) => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        await this.setState({progressModalVisible: false}, async () => {
                            await this.setState({favoriteDoctors: data})
                        })
                    }
                } else {
                    alert(JSON.stringify('خطا در دسترسی به سرویس'))

                }
            })
            .catch((error) => {
                console.error(error)
                // alert(error)
            })
    }

    onBackPressed() {
        this.props.navigation.goBack(null)
    }

    render() {
        return (
            <Container>

                {this.state.selectedMedicalCenter != null ? <Header style={styles.header}>
                        <Left style={{flex: 1}}>
                            <Button transparent style={styles.headerMenuIcon}
                                    onPress={() => this.onBackPressed()}>
                                <Icon style={styles.headerMenuIcon} name='arrow-back'
                                      onPress={() => this.onBackPressed()}/>
                            </Button>

                        </Left>
                        <Right style={{flex: 6}}>
                            <Text style={[styles.headerText, {fontSize: this.state.headerFontSize}]}>{
                                (this.state.selectedMedicalCenter != null) ?
                                    'جستجو در ' + this.state.selectedMedicalCenter.Title : 'جستجوی پزشکان '
                            }</Text>
                        </Right>
                    </Header> :
                    <Header style={styles.header}>
                        <Left style={{flex: 6}}>
                            <Text style={[styles.headerText, {fontSize: this.state.headerFontSize}]}>{
                                (this.state.selectedMedicalCenter != null) ?
                                    'جستجو در ' + this.state.selectedMedicalCenter.Title : 'جستجوی پزشکان '
                            }</Text>
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
                <Root>
                    <Content padder style={styles.content}>
                        {Platform.OS === 'android' &&
                        <StatusBar barStyle={"dark-content"} backgroundColor={'#209b9b'}
                                   hidden={false}/>
                        }
                        <Item regular style={{borderRadius: 5}}>
                            <Input placeholder='جستجوی نام پزشک،تخصص و ...'
                                   placeholderTextColor={'#d0d0d0'}
                                   style={styles.searchInput}
                                   value={this.state.searchTerm}
                                   onChangeText={(searchTerm) => {
                                       if (searchTerm.length > this.state.previousLength) {
                                           (this.setState({searchTerm: searchTerm, previousLength: searchTerm.length},
                                               async () => {

                                                   if (searchTerm.length === 0) {
                                                       await this.setState({data: []})
                                                   } else {
                                                       if (searchTerm.length >= 3) {
                                                           await this.search(searchTerm)
                                                       }
                                                   }

                                               }))
                                       } else {
                                           this.setState({searchTerm: searchTerm, previousLength: searchTerm.length})
                                       }
                                   }}
                            />
                        </Item>
                        <View style={styles.row}>
                            <Button transparent style={{padding: 1, alignSelf: 'flex-start'}}
                                    onPress={() => (this.props.navigation.navigate('AdvanceSearchScreen', {
                                        doctor: true,
                                        medicalCenter: this.state.selectedMedicalCenter,
                                        headerFontSize: this.state.headerFontSize
                                    }))}>
                                <Text style={styles.advanceSearchText}>جستجوی پیشرفته</Text>
                            </Button>
                        </View>
                        {/*//</Item>*/}

                        {(this.state.data != null && this.state.data.length >= 1) ?
                            this.state.data.map((item, key) => (
                                // {false && <View key={key}>
                                //      <ListItem
                                //          style={{
                                //              width: '100%',
                                //              height: 50,
                                //              alignSelf: 'center',
                                //              padding: 2,
                                //              marginTop: 2
                                //          }}
                                //          onPress={() => {
                                //              Keyboard.dismiss()
                                //              this.setState({selectedDoctor: item, visible: true})
                                //          }
                                //          }
                                //      >
                                //          <Body>
                                //              <Text style={{
                                //                  color: '#000',
                                //                  width: '100%',
                                //                  height: '100%',
                                //                  textAlign: 'right',
                                //                  fontSize: 15,
                                //              }}>{this.generateTitle(item)}</Text>
                                //          </Body>
                                //      </ListItem>
                                //  </View>}


                                <View key={key} style={{borderBottomColor: '#e9e9e9', borderBottomWidth: 1}}>
                                    <ListItem noBorder
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
                                                  this.setState({selectedDoctor: item, visible: true})
                                              }
                                              }

                                    >
                                        <Body style={{height: '100%', marginRight: 5, alignSelf: 'center'}}>
                                            <Text style={styles.resultText}>{this.generateTitle(item)}</Text>
                                            {(item.Skill != null || item.LastCertificate != null ||
                                                item.Gender != null) &&
                                            <Text style={styles.filters}>{item.Skill != null ? ' ' + item.Skill + ' ' :
                                                null}{item.LastCertificate != null ? item.LastCertificate + ' ، ' :
                                                null}{item.Gender}</Text>}
                                        </Body>
                                    </ListItem>
                                </View>


                            )) : (this.state.favoriteDoctors != null && this.state.favoriteDoctors.length >= 1) ?

                                this.state.favoriteDoctors.map((item, key) => (
                                    <View key={key}>
                                        <ListItem
                                            style={{
                                                width: '100%',
                                                height: 50,
                                                alignSelf: 'center',
                                                padding: 2,
                                                marginTop: 2
                                            }}
                                            onPress={() => {
                                                Keyboard.dismiss()
                                                this.setState({
                                                    selectedDoctor: {
                                                        Id: item.Id,
                                                        FirstName: item.FirstName,
                                                        LastName: item.LastName,
                                                        Age: item.Age,
                                                        Description: item.Description,
                                                        Gender: item.Gender,
                                                        LastCertificate: item.Certificate,
                                                        Skill: item.Skills[0].Title,
                                                    }, visible: true
                                                })
                                            }
                                            }
                                        >
                                            <Body>
                                                <Text style={{
                                                    color: '#000',
                                                    width: '100%',
                                                    height: '100%',
                                                    textAlign: 'right',
                                                    fontSize: 15,
                                                }}>{this.generateTitle(item)}</Text>
                                            </Body>
                                        </ListItem>
                                    </View>
                                ))
                                : (this.state.data.length === 0 && this.state.favoriteDoctors.length === 0) ?
                                    <View style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Text style={{color: 'gray'}}>موردی یافت نشد</Text>
                                    </View>
                                    :
                                    null
                        }

                        <Modal
                            width={300}
                            onTouchOutside={() => {
                                this.setState({visible: false});
                            }}
                            visible={this.state.visible}
                            modalTitle={<ModalTitle style={styles.modalTitle} textStyle={styles.modalTitleText}
                                                    title={this.generateTitle(this.state.selectedDoctor)}/>}
                            modalAnimation={new SlideAnimation({
                                slideFrom: 'bottom'
                            })}
                            footer={
                                <ModalFooter style={styles.modalFooter}>
                                    <ModalButton
                                        style={[styles.modalCancelButton]}
                                        textStyle={styles.modalCancelButtonText}
                                        text="رزرو نوبت"
                                        onPress={() => {
                                            this.setState({visible: false}, () => {
                                                this.goToReserveScreen()
                                            })
                                        }}
                                    />
                                    <ModalButton
                                        style={[styles.modalSuccessButton]}
                                        textStyle={[styles.modalSuccessButtonText]}
                                        text="اطلاعات بیشتر"
                                        onPress={() => {
                                            this.setState({visible: false})
                                            this.goToDetailsScreen(this.state.selectedDoctor)
                                        }
                                        }
                                    />
                                </ModalFooter>
                            }
                        >
                            <ModalContent style={styles.modalContent}>
                                <View>
                                    {this.state.selectedDoctor &&
                                    <View>
                                        <Text style={[styles.modalCancelButtonText,
                                            {
                                                fontSize: 13,
                                                fontWeight: 'bold',
                                                margin: 1,
                                                marginTop: 2,
                                                padding: 1
                                            }]}>{(this.state.selectedDoctor.Description != null &&
                                            this.state.selectedDoctor.Description !== '') ?
                                            this.state.selectedDoctor.Description : ''}</Text>
                                        <Text style={[styles.modalCancelButtonText,
                                            {
                                                margin: 1,
                                                marginTop: 2,
                                                padding: 1,
                                                fontSize: 13,
                                                fontWeight: 'bold'
                                            }]}>{(this.state.selectedDoctor.LastCertificate != null &&
                                            this.state.selectedDoctor.LastCertificate !== '') ?
                                            this.state.selectedDoctor.LastCertificate : ''}</Text>
                                        <Text style={[styles.modalCancelButtonText,
                                            {
                                                fontSize: 13, fontWeight: 'bold', margin: 1,
                                                marginTop: 2,
                                                padding: 1
                                            }]}>{(this.state.selectedDoctor.Skill !=
                                            null &&
                                            this.state.selectedDoctor.Skill !== '') ?
                                            this.state.selectedDoctor.Skill : ''}</Text>
                                    </View>
                                    }
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
                </Root>
            </Container>
        );


    }
}


SearchMedicalCenter.navigationOptions = {
    header: null,
    title: 'جستجوی پزشک',
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
        margin: 5,
        padding: 5,
        flexDirection: 'column'
    },
    headerMenuIcon: {
        padding: 5,
        fontSize: 30,
        color: '#fff',
    },
    headerText: {
        padding: 5,
        fontSize: 18,
        color: '#fff',
        fontFamily: 'IRANMarker'
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
        justifyContent: 'space-between',
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
        fontFamily: 'IRANMarker',
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
    searchInput: {
        fontFamily: 'IRANMarker',
        textAlign: 'right',
        fontSize: 13,
        padding: 5,
        marginRight: 10,
        marginLeft: 10,
        marginTop: 3
    },
    advanceSearchText: {
        fontFamily: 'IRANMarker',
        textAlign: 'right',
        fontSize: 10,
        color: '#23b9b9'
    },
    resultText: {
        color: '#000',
        textAlign: 'right',
        fontSize: 15,
        marginRight: 1,
        marginTop: 5,
    },
    filters: {
        color: '#23b9b9',
        textAlign: 'right',
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: 5,
        marginRight: 1
    }
});
