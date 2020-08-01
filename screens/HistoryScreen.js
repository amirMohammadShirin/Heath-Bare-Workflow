import React, {Component} from 'react';
import {StyleSheet, StatusBar, Alert, BackHandler, Platform} from 'react-native';
import {
    Container,
    Header,
    Button,
    Tabs,
    Tab,
    TabHeading,
    Icon,
    Text,
    Left,
    Right
} from 'native-base';
import ShowReservesScreen from "./ShowReservesScreen";


export default class HistoryScreen extends Component {

    constructor() {
        super();
        if (Platform.OS === 'android') {
            this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        }
    }

    componentDidMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        }
    }

    handleBackButtonClick() {
        console.log(JSON.stringify(this.props.navigation.state))

        if (this.props.navigation.state.isDrawerOpen) {
            this.props.navigation.closeDrawer()
        } else {
            this.props.navigation.goBack(null)
        }
        return true;
    }

    render() {
        return (
            <Container>
                <StatusBar showHideTransition={"slide"} barStyle={"light-content"} backgroundColor={'transparent'}
                           hidden={true}/>
                <Header style={{backgroundColor: '#23b9b9'}}>
                    <Left style={{flex: 5}}>
                        <Text style={styles.headerText}>پرونده شخصی</Text>
                    </Left>
                    <Right style={{flex: 1}}>
                        <Button transparent style={styles.headerMenuIcon}
                                onPress={() => this.props.navigation.openDrawer()}>
                            <Icon style={styles.headerMenuIcon} name='menu'
                                  onPress={() => this.props.navigation.openDrawer()}/>
                        </Button>
                    </Right>
                </Header>
                <Tabs tabBarPosition={'top'} tabContainerStyle={[styles.tabHeading]} locked
                      tabBarUnderlineStyle={{height: 2, backgroundColor: "#fff"}} tabBarActiveTextColor={'#1e8080'}>
                    {false && <Tab heading={<TabHeading style={styles.tabHeading}><Icon
                        type={'FontAwesome5'} style={styles.tabIcon} name="notes-medical"/><Text style={styles.tabText}>نسخه
                        ها</Text></TabHeading>}> </Tab>}
                    <Tab heading={<TabHeading style={styles.tabHeading}><Icon
                        type={'FontAwesome5'} style={styles.tabIcon} name="calendar-alt"/><Text style={styles.tabText}>نوبت
                        ها</Text></TabHeading>}>
                        <ShowReservesScreen navigation={this.props.navigation}
                                            fullName={this.props.navigation.getParam('fullName')}/>
                    </Tab>
                </Tabs>
            </Container>
        );
    }

}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerMenuIcon: {
        padding: 5,
        color: '#fff',
        fontSize: 30
    },
    headerText: {
        padding: 5,
        fontSize: 18,
        color: '#fff',
        fontFamily: 'IRANMarker'
    },
    card: {
        flex: 1,
        flexDirection: 'column',
        borderRadius: 2,
        justifyContent: 'center',
        alignContent: 'center',
        padding: 5,
        height: 200,
        borderWidth: 1,
        elevation: 8,
        margin: 2,
        alignSelf: 'stretch'
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
        height: '50%',
        marginTop: 10
    },
    textOfCard: {
        color: '#fff',
        fontSize: 15,
        alignContent: 'center',
        textAlign: 'center',
        alignSelf: 'center'
    },
    iconOfCard: {
        color: '#fff',
        fontSize: 25,
        marginBottom: 5,
        alignContent: 'center',
        textAlign: 'center',
        alignSelf: 'center'
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
        color: '#1e8080',
        fontFamily: 'IRANMarker'
    }
});
