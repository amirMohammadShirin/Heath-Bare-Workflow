import React, { Component } from 'react';
import { StyleSheet, TextInput, Text, View, Platform, StatusBar, Image, ActivityIndicator, AsyncStorage } from 'react-native';
import {
    Container,
    Header,
    Title,
    Content,
    Accordion,
    FooterTab,
    Button,
    Card,
    Left,
    CardItem,
    Thumbnail,
    Right,
    Body,
    Icon,
    Fab
} from 'native-base';



// import FitImage from 'react-native-fit-image'
export default class ProfileScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            animated: false,
            test: '22',
            imageObject: null,
            insurances: [
                {
                    insurance: "تامین اجتماعی",
                    code: "11111111111",
                    serial: "69969555555",
                    insuranceType: "تکمیلی"
                },
                {
                    insurance: "تامین اجتماعی",
                    code: "8798765656",
                    serial: "152045045698",
                    insuranceType: "پایه"
                },
                {
                    insurance: "تامین اجتماعی",
                    code: "8798765656",
                    serial: "152045045698",
                    insuranceType: "پایه"
                }
            ],
            insurancesForShow:
                [{ title: "First Element", content: "Lorem ipsum dolor sit amet", serial: '', code: '' },
                { title: "Second Element", content: "Lorem ipsum dolor sit amet", serial: '', code: '' },
                { title: "Third Element", content: "Lorem ipsum dolor sit amet", serial: '', code: '' }
                ]
        }

    }


    getContent() {
        let array = [];
        for (let item of this.state.insurances) {
            let insuranceForShow = {
                title: item.insurance != null ? item.insurance : ' - ',
                content: " بیمه " + item.insuranceType + " با شماره " + item.serial + " و کد " + item.code,
                serial: item.serial != null ? item.serial : ' - ',
                code: item.code != null ? item.code : ' - ',
                insuranceType : item.insuranceType != null ? item.insuranceType :  ' - '
            }
            array.push(insuranceForShow)
        }
        this.setState({ insurancesForShow: array })
    }



    renderContent(item){
        return(
            <Text style={styles.AccordionTextStyle}>
                {" بیمه " + item.insuranceType + " با شماره " + item.serial + " و کد " + item.code}
            </Text>
        )
    }


    componentWillMount(): void {
        let image = this.props.navigation.getParam('imageObject');
        let passedUser = this.props.navigation.getParam('user');
        this.setState({ user: passedUser, insurances: passedUser['insurances'], imageObject: image })
        this.getContent()
    }

    async componentDidMount(): void {
        let passedUser = this.props.navigation.getParam('user');
        this.setState({ user: passedUser, insurances: passedUser['insurances'] })
        this.getContent()
    }

    render() {
        return (
            <Container>
                <Header style={{
                    backgroundColor: '#23b9b9', shadowOffset: { height: 0, width: 0 },
                    shadowOpacity: 0, shadowColor: '#23b9b9'
                }}>
                    <Left style={{ flex: 5 }}>
                        <Text style={styles.headerText}>حساب کاربری</Text>
                    </Left>
                    <Right style={{ flex: 1 }}>
                        <Button transparent style={styles.headerMenuIcon}
                            onPress={() => this.props.navigation.openDrawer()}>
                            <Icon style={styles.headerMenuIcon} name="menu"
                                onPress={() => this.props.navigation.openDrawer()} />
                        </Button>
                    </Right>
                </Header>
                <Content scrollEnabled={true} style={[styles.content]}>
                    {Platform.OS === 'android' &&
                        <StatusBar barStyle={"dark-content"} backgroundColor={'#209b9b'}
                            hidden={false} />
                    }
                    <View style={styles.container}>
                        <View style={styles.header}></View>
                        {this.state.user['gender'] !== 'زن' ?
                           <Thumbnail circular style={styles.avatar}
                                source={{ uri: (this.state.user['Image'] != null && typeof this.state.user['Image'] !== 'undefined') ? 'data:image/png;base64, ' +  this.state.user['Image'] : this.state.imageObject.account }}
                            /> :
                            <Thumbnail circular style={styles.avatar}
                                source={{ uri: (this.state.user['Image'] != null && typeof this.state.user['Image'] !== 'undefined') ? 'data:image/png;base64, ' +  this.state.user['Image'] : this.state.imageObject.account }}
                            />
                        }
                        <ActivityIndicator size={'small'} color={'gray'} animating={this.state.animated} />
                        <View style={styles.body}>
                            <View style={styles.card}>
                            {false && <View style={styles.row}>
                                    <TextInput
                                        style={[styles.textInput]}
                                        value={this.state.user['user_name'] != null ? this.state.user['user_name'] :
                                            'نا مشخص'}
                                        onChangeText={(text) => {
                                            this.setState({ username: text })
                                        }}
                                        multiline={false}
                                        editable={false} />
                                    <Text style={[styles.label]}>نام کاربری</Text>
                                </View>}
                                <View style={styles.row}>
                                    <TextInput style={[styles.textInput]}
                                        value={this.state.user['first_name'] != null ?
                                            this.state.user['first_name'] : 'نا مشخص'}
                                        onChangeText={(text) => {
                                            this.setState({ name: text })
                                        }}
                                        multiline={false}
                                        editable={false} />
                                    <Text style={styles.label}>نام</Text>
                                </View>
                                <View style={styles.row}>
                                    <TextInput style={[styles.textInput]}
                                        value={this.state.user['last_name'] != null ?
                                            this.state.user['last_name'] : 'نا مشخص'}
                                        multiline={false}
                                        onChangeText={(text) => {
                                            this.setState({ family: text })
                                        }}
                                        multiline={false}
                                        editable={false} />
                                    <Text style={styles.label}>نام خانوادگی</Text>
                                </View>
                                <View style={styles.row}>
                                    <TextInput style={[styles.textInput]}
                                        value={this.state.user['nationalCode'] != null ?
                                            this.state.user['nationalCode'] : 'نا مشخص'}
                                        onChangeText={(text) => {
                                            this.setState({ nationalCode: text })
                                        }}
                                        multiline={false}
                                        editable={false} />
                                    <Text style={styles.label}>کد ملی</Text>
                                </View>
                                <View style={styles.row}>
                                    <TextInput style={[styles.textInput]}
                                        value={this.state.user['birthDate'] != null ?
                                            this.state.user['birthDate'] : 'نا مشخص'}
                                        onChangeText={(text) => {
                                            this.setState({ birthDate: text })
                                        }}
                                        editable={false}
                                        multiline={false}
                                    />
                                    <Text style={styles.label}>تاریخ تولد</Text>
                                </View>
                                <View style={[styles.row, {
                                    borderWidth: 0,
                                    borderColor: '#fff',
                                    borderBottomWidth: 0,
                                    borderBottomColor: '#fff'
                                }]}>
                                    <TextInput style={[styles.textInput]}
                                        value={this.state.user['gender'] != null ? this.state.user['gender'] :
                                            'نا مشخص'}
                                        multiline={false}
                                        editable={false} />
                                    <Text style={styles.label}>جنسیت</Text>
                                </View>
                                <View style={styles.row}>
                                    {this.state.insurancesForShow.length > 0 ? <Text style={styles.label}>
                                        بیمه های من 
                                    </Text> : null}
                                </View>
                                {/*<View style={{padding: 5, margin: 5, marginTop: 10}}>*/}
                                <Accordion style={{
                                    margin: 5,
                                    flexDirection: 'column',
                                    flex: 1,

                                }}

                                    dataArray={this.state.insurancesForShow}
                                    headerStyle={{
                                        backgroundColor: "rgba(35,185,185,0.72)",
                                        flexDirection: 'row-reverse',

                                    }}
                                    renderContent={this.renderContent}
                                    contentStyle={{
                                        backgroundColor: "rgba(49,255,255,0)",
                                        flexDirection: 'row-reverse',
                                        backfaceVisibility: 'hidden',
                                        borderColor: '#23b9b9',
                                        borderWidth: 1,
                                    }}

                                    iconStyle={{ color: "white" }}
                                    expandedIconStyle={{ color: "white" }}
                                />
                                {/*</View>*/}
                            </View>
                        </View>
                    </View>
                </Content>
                {/*<Footer style={styles.footer}>*/}
                {/*    <View style={{flex: 1, backgroundColor: '#fff'}}>*/}
                {/*        <Fab*/}
                {/*            active={this.state.active}*/}
                {/*            direction="up"*/}
                {/*            style={{backgroundColor: this.state.FabColor}}*/}
                {/*            position="bottomRight"*/}
                {/*            onPress={() => this.FabClicked()}>*/}
                {/*            <Icon type='FontAwesome' name={this.state.FabIcon}/>*/}
                {/*        </Fab>*/}
                {/*    </View>*/}
                {/*</Footer>*/}
            </Container>
        );
    }

}

ProfileScreen.navigationOptions = {
    header: null,
    title: 'حساب کاربری',
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
        fontSize: 30,
        color: '#fff',
    },
    headerText: {
        fontFamily: 'IRANMarker',
        fontSize: 18,
        padding: 5,
        color: '#fff',
    },
    container: {

        flex: 1
    },
    header: {
        width: '100%',
        backgroundColor: "#23b9b9",
        height: 180,
    },
    avatar: {
        // backgroundColor: '#fff',
        width: 130,
        height: 130,
        borderRadius: 500,
        marginBottom: 10,
        alignSelf: 'center',
        position: 'absolute',
        marginTop: 60,
    },
    body: {
        flex: 1,
        width: '100%',
        height: '100%',
        marginTop: 5,
        backgroundColor: 'rgba(47,246,246,0.02)',
    },
    label: {
        fontFamily: 'IRANMarker',
        textAlign: 'right',
        color: '#000',
        fontSize: 15,
        alignSelf: 'flex-start',
        margin: 2,
        flex: 1,
        padding: 3,
    },
    AccordionTextStyle:{
        fontFamily: 'IRANMarker',
        textAlign: 'right',
        color: '#000',
        fontSize: 15,
        margin: 2,
        flex: 1,
        padding: 3,
    },
    textInput: {
        color: '#717171',
        fontFamily: 'IRANMarker',
        textAlign: 'right',
        fontSize: 12,
        padding: 3,
        alignSelf: 'flex-end',
        margin: 2,
        flex: 2,
    },
    card: {
        flex: 1,
        padding: 5,
        flexDirection: 'column',
        marginTop: 5,
        marginBottom: 5,
        marginRight: 10,
        marginLeft: 10,
        borderRadius: 5,
        borderColor: '#d8d8d8',
        borderWidth: 1,
        elevation: 8
    },
    row: {
        flexDirection: 'row',
        marginRight: 5,
        marginLeft: 5,
        marginTop: 15,
        marginBottom: 3
    },
    footer: {
        backgroundColor: '#fff'
    }
});