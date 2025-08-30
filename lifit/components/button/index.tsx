import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps, TextProps } from "react-native";

import {styles} from "./styles"

type Props = TouchableOpacityProps & TextProps &{
    title: string
    textColor: string
}

export function Button({title,textColor = 'black',...rest}: Props){
    return(
        <TouchableOpacity {...rest}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        </TouchableOpacity>
    )
}