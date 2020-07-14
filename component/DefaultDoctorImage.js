import React, {Component} from 'react';
import {Thumbnail} from "native-base";

export default class DefaultDoctorImage extends Component {
    constructor(props) {
        super(props);

    }
    render() {
        return (
            <Thumbnail
                circular
                large
                style={this.props.myStyle}
                source={{
                    uri: this.props.gender ==='Man' ? 'http://clinicservices.bazyarapp.ir/Images/Doctor.png'
                        : 'http://clinicservices.bazyarapp.ir/Images/Hijab.png'
                }}
            />
        );
    }
}
