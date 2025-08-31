import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps, TextProps } from "react-native";

import {styles} from "./styles"

type Props = TouchableOpacityProps & TextProps &{
    title?: string
    textColor?: string
    backgroundColor?:string
}

export function Button({title = "NoName",textColor = 'black',backgroundColor = "#2B3C45",...rest}: Props){
    return(
        <TouchableOpacity {...rest} style={[styles.btn, {backgroundColor:backgroundColor}]}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        </TouchableOpacity>
    )
}