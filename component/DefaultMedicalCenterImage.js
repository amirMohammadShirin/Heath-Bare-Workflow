import React, {Component} from 'react';
import {Thumbnail} from "native-base";

export default class DefaultMedicalCenterImage extends Component {
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
                    uri:'http://clinicservices.bazyarapp.ir/Images/Cross.png'
                }}
            />
        );
    }
}
