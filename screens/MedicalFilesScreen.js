import React, {Component} from 'react';
import {StyleSheet, View, Modal, ScrollView, StatusBar, Platform} from 'react-native';
import {
    Container,
    Content,
    CardItem,
    Button,
    Card,
    Body,
    Icon,
    Text,
} from 'native-base';

export default class MedicalFilesScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            array: [
                {title: "چهارشنبه 1398/8/1", content: "نسخه شماره 1", doctor: 'محسن زنجانی متخصص قلب'},
                {title: "شنبه 1398/8/5", content: "نسخه شماره 2", doctor: 'محمدرضا سلیمانی جراح فک و صورت'},
                {title: "جمعه 1398/8/7", content: "نسخه شماره 3", doctor: 'محمد شریفی دندانپزشک '},
            ]
        }
    }

    onBackPressed() {
        this.props.navigation.goBack()
    }

    deleteMessage({value, index}) {
        delete this.state.array[index];
        this.setState({array: this.state.array}, () => {
            // alert('حذف انجام شد')
        })
    }


    render() {

        return (
            <Container style={{backgroundColor: 'rgba(34,166,166,0.72)',}}>
                <StatusBar showHideTransition={"slide"} barStyle={"light-content"} backgroundColor={'transparent'}
                           hidden={true}/>
                <Content>

                </Content>
            </Container>

        );
    }

}

MedicalFilesScreen.navigationOptions = {
    header: null,
    title: 'نسخه های من',
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
    questionName: {
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignContent: 'center',
        textAlign: 'right',
        fontSize: 10
    },
    questionInfo: {
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignContent: 'center',
        textAlign: 'right',
        fontSize: 10
    },
    card: {
        marginRight: 10,
        marginLeft: 10,
        marginTop: 5,
        borderWidth: 1,
        borderColor: 'rgba(34,166,166,0.72)',
        borderRadius: 2,
        elevation: 8
    },
    header: {
        backgroundColor: "#23b9b9",
        height: 150,
    },
    body: {
        marginTop: 40,
    },
    bodyContent: {
        flex: 1,
        margin: 10,
        alignItems: 'center',
        padding: 10,
        borderWidth: 2,
        borderColor: '#23b9b9'
    },
    post: {
        margin: 2,
        padding: 2,
        flex: 0,
        backgroundColor: 'rgba(34,166,166,0.72)'
    },
    titleText: {
        color: '#fff',
        textAlign: 'left',
        alignSelf: 'flex-end',
        fontWeight: 'bold',
        fontFamily: 'IRANMarker'
    },
    contentText: {
        color: '#fff',
        textAlign: 'left',
        alignSelf: 'flex-end',
        marginTop: 5,
        fontSize: 15,
        fontFamily: 'IRANMarker'
    }
});
