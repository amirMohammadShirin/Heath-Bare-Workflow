import React, {Component} from 'react';
import {StyleSheet, ImageBackground, AsyncStorage} from 'react-native';
const AUTHORIZE = '/api/Authorize';
const GETCROSS = '/Images/Cross.png';
const GETHIJAB = '/Images/Hijab.png';
const GETDOCTOR = '/Images/Doctor.png';
const GETVEIL = '/Images/Veil.png';
const GETACCOUNT = '/Images/Account.png';
const GETPIC = '/Images/Pic.png';
const BASE = 'http://clinicservices.bazyarapp.ir';
// const BASE = 'http://clinicapi.adproj.ir';
const imageObject = {
  doctor: BASE + GETDOCTOR,
  hijab: BASE + GETHIJAB,
  pic: BASE + GETPIC,
  veil: BASE + GETVEIL,
  account: BASE + GETACCOUNT,
  cross: BASE + GETCROSS,
};
// const BASE = 'https://cisservices.tehran.ir/TM.Services.ClinicManagementApi.Ver1';
const AUTHENTICATE = '/Api/Authenticate';
export default class SplashScreen extends Component {

  performTimeConsumingTask = async () => {
    return new Promise(resolve =>
      setTimeout(() => {
        resolve('result');
      }, 2000),
    );
  };

  async componentDidMount() {
    await AsyncStorage.setItem('baseUrl', BASE);
    const token = await AsyncStorage.getItem('token');
    console.log(token);
    const baseUrl = await AsyncStorage.getItem('baseUrl');
    console.log(baseUrl);
    const nationalCode = await AsyncStorage.getItem('nationalCode');
    console.log(nationalCode);

    if (
      token != null &&
      typeof token !== 'undefined' &&
      baseUrl != null &&
      typeof baseUrl !== 'undefined'
    ) {
      console.log('token and base are not null');
      console.log('no.1 fetch started');
      await fetch(baseUrl + AUTHORIZE, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + new String(token),
        },
      })
        .then(response => response.json())
        .then(async responseData => {
          console.log(JSON.stringify(responseData));
          if (responseData['StatusCode'] === 200) {
            const username = await AsyncStorage.getItem('username');
            if (
              username != null &&
              typeof username !== 'undefined' &&
              nationalCode != null &&
              typeof nationalCode !== 'undefined'
            ) {
              console.log('username is not null');
              console.log('nationalCode is not null');
              let body = {
                username: username,
                // username: '09191111111',
                nationalCode: nationalCode,
              };
              console.log(JSON.stringify(body));
              console.log('no.2 fetch started');
              fetch(baseUrl + AUTHENTICATE, {
                method: 'POST',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify(body),
              })
                .then(response => response.json())
                .then(async responseData => {
                  console.log(JSON.stringify(responseData));
                  if (responseData['StatusCode'] === 200) {
                    if (responseData['Data'] != null) {
                      try {
                        let data = responseData['Data'];
                        // let token = data['token'];
                        let userInfo = data['userinfo'];

                        // AsyncStorage.setItem('username', username).then(() => {
                        //     AsyncStorage.setItem('token', token).then(() => {
                        //         this.props.navigation.navigate('HomeScreen',
                        //             {user: {userInfo}, baseUrl: BASE})
                        //     })
                        // })

                        this.props.navigation.navigate('HomeScreen', {
                          user: {userInfo},
                          baseUrl: BASE,
                          imageObject: imageObject,
                        });
                      } catch (e) {
                        // alert(e)
                        console.error(e);
                      }
                      
                    }
                  } else if (responseData['StatusCode'] === 600) {
                    this.setState({progressModalVisible: false}, () => {
                      // alert('کاربر یافت نشد')
                      this.props.navigation.navigate(
                        'GetVerificationCodeScreen',
                        {
                          user: {
                            username: 'adrian',
                            password: '1234',
                            role: 'stranger',
                          },
                          imageObject: imageObject,
                        },
                      );
                    });
                  } else {
                    this.setState({progressModalVisible: false}, () => {
                      // alert('خطا در اتصال به سرویس')
                      // alert(JSON.stringify(responseData))
                      this.props.navigation.navigate(
                        'GetVerificationCodeScreen',
                        {
                          user: {
                            username: 'adrian',
                            password: '1234',
                            role: 'stranger',
                          },
                          imageObject: imageObject,
                        },
                      );
                    });
                  }
                })
                .catch(error => {
                  console.error(error);
                });
            }

            // if (responseData['Data'] != null) {
            //     this.props.navigation.navigate('homeScreen')
            // }
          } else if (responseData['StatusCode'] === 401) {
            this.props.navigation.navigate('GetVerificationCodeScreen', {
              user: {
                username: 'adrian',
                password: '1234',
                role: 'stranger',
              },
              imageObject: imageObject,
            });
          } else if(responseData['StatusCode'] === 400) {
            alert('خطا در اتصال به سرویس');
          }
        })
        .catch(error => {
          console.error(error);
          // alert(error)
        });
    } else {
      this.props.navigation.navigate('GetVerificationCodeScreen', {
        user: {
          username: 'adrian',
          password: '1234',
          role: 'stranger',
        },
        imageObject: imageObject,
      });
    }
    // const data = await this.performTimeConsumingTask();
    //
    // if (data !== null) {
    //     //this.props.navigation.navigate('HomeScreen', {user: {username: 'adrian', password: '1234', role:
    //     // 'stranger'}});
    //     // this.props.navigation.navigate('GetVerificationCodeScreen',
    //     //     {user: {username: 'adrian', password: '1234', role: 'stranger'}});
    //     // this.props.navigation.navigate('RegisterScreen');
    //     this.props.navigation.navigate('GetVerificationCodeScreen', {
    //         user: {
    //             username: 'adrian',
    //             password: '1234',
    //             role: 'stranger'
    //         }
    //     })
    // }
  }

  render() {
    return (
      <ImageBackground
        style={styles.container}
        // source={require(
        //     'D:\\E\\react native projects\\Health\\bare\\salamat\\assets\\images\\splash.png')
        // }
        source={require('D:\\Adrian Jobs\\Heath-Bare-Workflow-master\\Heath-Bare-Workflow-master\\assets\\images\\splash.png')}

        // onPress={() => {
        //     // this.props.navigation.user.username = 'adrian';
        //     // this.props.navigation.user.password = '1234';
        //     // this.props.navigation.user.role = 'admin';
        //     // this.props.navigation.navigate('HomeScreen', {
        //     //     user: {
        //     //         username: 'adrian',
        //     //         password: '1234',
        //     //         role: 'stranger'
        //     //     }
        //     // })
        //
        //     //
        //     this.props.navigation.navigate('GetVerificationCodeScreen', {
        //         user: {
        //             username: 'adrian',
        //             password: '1234',
        //             role: 'stranger'
        //         }
        //     })
        //
        //     // this.props.navigation.navigate('RegisterScreen');
        //
        // }}
      ></ImageBackground>
    );
  }
}

SplashScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
