
class Operators {
  async getReservationReports(baseUrl, apiAddress, token) {
    // this.setState({progressModalVisible: !refreshing});
    fetch(baseUrl + apiAddress, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + new String(token),
      },
    })
      .then(async response => response.json())
      .then(async responseData => {
        if (responseData['StatusCode'] === 200) {
          if (responseData['Data'] != null) {
           let data = responseData['Data'];
           alert(JSON.stringify(data))
           return data;
            // this.setState({array: data}, () => {
            // //   this.setState({progressModalVisible: false, refreshing: false});
            // //   console.log(JSON.stringify(this.state.array));
            // });
          }
        } else {
          //   this.setState(
          //     {progressModalVisible: false, refreshing: false},
          //     () => {
          //       alert('خطا در اتصال به سرویس');
          //     },
          //   );
          alert('خطا در اتصال به سرویس');
            return data;
        }
      })
      .catch(error => {
        console.error(error);
        // return data;
        // alert(error)
      });
    // return data;
  }
}
const op = new Operators();
export default op;
