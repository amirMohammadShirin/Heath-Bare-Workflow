import React, {Component} from 'react';
import {ActivityIndicator, AsyncStorage, StatusBar, StyleSheet, Text, Keyboard, View} from 'react-native';
import {Alert} from 'react-native'
import {
    List,
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
    ListItem, Thumbnail,
} from 'native-base';
import Modal, {ModalButton, ModalContent, ModalFooter, ModalTitle, SlideAnimation} from "react-native-modals";


const SEARCHMEDICALCENTERALLFIELD = '/api/SearchMedicalCenterAllField';
const GETFAVORITEMEDICALCENTERS = '/api/GetFavoriteMedicalCenters';

export default class SearchMedicalCenter extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedMedicalCenter: {},
            title: '',
            description: '',
            visible: false,
            medicalCenterTitle: '',
            data: [],
            searchTerm: '',
            titleOfAlert: '',
            messageOfAlert: '',
            progressModalVisible: false,
            previousLength: -1,
            favoriteMedicalCenters: []

        };


    }


    async goToDetailsScreen(value) {
        this.props.navigation.navigate('DetailsForMedicalCenterScreen',
            {medicalCenter: value, doctor: null, backRoute: 'SearchMedicalCenter'})
    }


    async componentWillMount(): void {
        var token = await AsyncStorage.getItem('token');
        var baseUrl = await AsyncStorage.getItem('baseUrl')
        await this.setState({baseUrl: baseUrl, token: token}, () => {
            this.getFavoriteMedicalCenters()
        })

    }


    async search(text) {
        await this.setState({progressModalVisible: true})
        await fetch(this.state.baseUrl + SEARCHMEDICALCENTERALLFIELD, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Bearer ' + new String(this.state.token)
            },
            body: JSON.stringify({
                searchWord: text
            })
        }).then((response) => response.json())
            .then((responseData) => {
                if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                        let data = responseData['Data'];
                        this.setState({progressModalVisible: false}, () => {
                            this.setState({data: data})
                        })
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

    async getFavoriteMedicalCenters() {
        await this.setState({progressModalVisible: true})
        await fetch(this.state.baseUrl + GETFAVORITEMEDICALCENTERS, {
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
                        await this.setState({progressModalVisible: false}, () => {
                            this.setState({favoriteMedicalCenters: data})
                        })

                    }
                } else {

                    // alert(JSON.stringify('خطا در دسترسی به سرویس'))
                    alert(JSON.stringify(JSON.stringify(responseData)))

                }
            })
            .catch((error) => {
                console.error(error)
            })
    }

    render() {
        return (
            <Container>
                <StatusBar translucent backgroundColor={"#219e9e"} barStyle={"light-content"}/>
                <Header style={styles.header}>
                    <Left style={{flex: 5}}>
                        <Text style={styles.headerText}>جستجوی
                            مرکز درمانی</Text>
                    </Left>
                    <Right style={{flex: 1}}>
                        <Button transparent style={styles.headerMenuIcon}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    this.props.navigation.openDrawer()
                                }}>
                            <Icon style={styles.headerMenuIcon} name='menu'
                                  onPress={() => {
                                      Keyboard.dismiss();
                                      this.props.navigation.openDrawer()
                                  }}/>
                        </Button>
                    </Right>
                </Header>
                <Root>
                    <Content padder style={styles.content}>
                        <Item regular>
                            <Input placeholder='جستجوی نام مرکز،خدمات،منطقه و ...'
                                   placeholderTextColor={'#d0d0d0'}
                                   style={{textAlign: 'right', fontSize: 13, fontFamily: 'IRANMarker'}}
                                   value={this.state.searchTerm}
                                   onChangeText={(searchTerm) => {
                                       {
                                           if (searchTerm.length > this.state.previousLength) {
                                               (this.setState(
                                                   {searchTerm: searchTerm, previousLength: searchTerm.length},
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
                                               this.setState(
                                                   {searchTerm: searchTerm, previousLength: searchTerm.length})
                                           }
                                       }
                                   }
                                   }
                            />
                        </Item>
                        <View style={[styles.row, {flexDirection: this.state.flexDirection}]}>
                            <Button transparent style={{alignSelf: 'flex-start', margin: 2, padding: 2}}
                                    onPress={() => {
                                        Keyboard.dismiss()
                                        this.props.navigation.navigate('AdvanceSearchScreen', {
                                            medicalCenter: true,
                                            doctor: false,
                                            // headerFontSize : 20
                                        })
                                    }}>
                                <Text style={{
                                    textAlign: 'right',
                                    fontSize: 10,
                                    color: '#23b9b9',
                                    fontFamily: 'IRANMarker'
                                }}>جستجوی پیشرفته</Text>
                            </Button>
                        </View>

                        <List>
                            {(this.state.data != null && this.state.data.length >= 1) ?
                                this.state.data.map((item, key) => (

                                    <View key={key}>
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
                                                          this.setState({selectedMedicalCenter: item, visible: true})
                                                      }
                                                      }

                                            >
                                                <Body style={{height: '100%', marginRight: 5, alignSelf: 'center'}}>
                                                    <Text style={{
                                                        fontFamily: 'IRANMarker',
                                                        color: '#000',
                                                        textAlign: 'right',
                                                        fontSize: 13,
                                                        marginRight: 1,
                                                        marginTop: 5,
                                                        minHeight:28,
                                                        maxHeight:32
                                                    }}>{item.Title}</Text>
                                                    {(item.Facility != null || item.ServiceDetail != null ||
                                                        item.Service != null) && <Text style={{
                                                        fontFamily: 'IRANMarker',
                                                        color: '#23b9b9',
                                                        textAlign: 'right',
                                                        fontSize: 13,
                                                        fontWeight: 'bold',
                                                        marginTop: 5,
                                                        marginRight: 1
                                                    }}>
                                                        {item.ServiceDetail != null ?
                                                            item.ServiceDetail + ' ، ' :
                                                            null}{item.Service != null ? item.Service + ' ، ' :
                                                        null}{item.Facility}</Text>}


                                                    {item.Phone != null && <Text style={{
                                                        fontFamily: 'IRANMarker',
                                                        color: '#a9a9a9',
                                                        textAlign: 'right',
                                                        fontWeight: 'bold',
                                                        fontSize: 13,
                                                        marginTop: 5,
                                                        marginRight: 1
                                                    }}> تلفن : {item.Phone}</Text>}
                                                    {item.Address != null && <Text style={{
                                                        fontFamily: 'IRANMarker',
                                                        color: '#a9a9a9',
                                                        textAlign: 'right',
                                                        fontWeight: 'bold',
                                                        fontSize: 13,
                                                        marginTop: 5,
                                                        marginRight: 1
                                                    }}>{item.Address}</Text>}
                                                </Body>
                                            </ListItem>
                                        </View>


                                    </View>


                                )) :
                                this.state.data.length === 0 ? this.state.favoriteMedicalCenters.map((item, key) => (
                                        <View key={key}>
                                            <ListItem
                                                style={{
                                                    width: '100%',
                                                    height: 50,
                                                    alignSelf: 'center',
                                                    padding: 1,
                                                    marginTop: 2
                                                }}
                                                onPress={() => {
                                                    Keyboard.dismiss()
                                                    this.setState({selectedMedicalCenter: item, visible: true})
                                                }
                                                }

                                            >
                                                <Body>
                                                    <Text style={{
                                                        fontFamily: 'IRANMarker',
                                                        color: '#000',
                                                        width: '100%',
                                                        height: '100%',
                                                        textAlign: 'right',
                                                        fontSize: 13,
                                                        minHeight:28,
                                                        maxHeight:32
                                                    }}>{item.Title}</Text>
                                                </Body>
                                            </ListItem>
                                        </View>
                                    ))


                                    : <View style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Text style={{color: 'gray', fontFamily: 'IRANMarker',}}>موردی یافت نشد</Text>
                                    </View>}
                        </List>
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
                                            fontFamily: 'IRANMarker',
                                            color: '#23b9b9',
                                            fontSize: 15,

                                        }]}>{this.state.selectedMedicalCenter.Description != null ?
                                        this.state.selectedMedicalCenter.Description : ''}</Text>
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
    title: 'جستجوی مرکز درمانی',
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
    }
});