
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';
import ky from 'ky'
import { apiUrl } from '../config'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Authentification({navigation}) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const api = ky.extend({
        hooks: {
            beforeRequest: [
                request => {
                    request.headers.set('Authorization', 'Bearer');
                }
            ]
        }
    });

    const connection = async () => {
        console.log(email)
        console.log(password)

        try {

            const res = await api.post(`${apiUrl}/authenticate`, { json: { username: email, password: password } })
            //console.log(await res.json())
            if (res) {
                let responseJson = await res.json()
                if (responseJson != 'Not found') {
                    console.log(responseJson.token);

                    try {
                        await AsyncStorage.setItem(
                            '@bearerToken',
                            responseJson.token
                        );

                        navigation.navigate('Author')

                    } catch (error) {
                        // Error saving data
                    }

                }
                else {
                    console.log(responseJson);
                }
            } else {
                console.log('sdsdds')
            }
        } catch (error) {
            console.log(error)
        }


    }


    return (
        <View style={styles.container}>


            <Text style={styles.logo}>DizzifyMusic</Text>
            <View style={styles.inputView} >
                <TextInput
                    style={styles.inputText}
                    placeholder="Email..."
                    placeholderTextColor="#003f5c"
                    onChangeText={text => setEmail(text)} />
            </View>
            <View style={styles.inputView} >
                <TextInput
                    secureTextEntry
                    style={styles.inputText}
                    placeholder="Password..."
                    placeholderTextColor="#003f5c"
                    onChangeText={text => setPassword(text)} />
            </View>

            <TouchableHighlight>
                <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableHighlight>
            <View style={styles.loginBtn} >
                <Button title="sssssss" onPress={connection} style={styles.loginBtn} >
                </Button>
            </View>
            <View style={styles.loginBtn} >
                <Button title="Signup" >
                </Button>
            </View>

        </View>
    );
}




const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#003f5c',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        fontWeight: "bold",
        fontSize: 50,
        color: "#fb5b5a",
        marginBottom: 40
    },
    inputView: {
        width: "80%",
        backgroundColor: "#465881",
        borderRadius: 25,
        height: 50,
        marginBottom: 20,
        justifyContent: "center",
        padding: 20
    },
    inputText: {
        height: 50,
        color: "white"
    },
    forgot: {
        color: "white",
        fontSize: 11
    },
    loginBtn: {
        width: "80%",
        backgroundColor: "#fb5b5a",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        marginBottom: 10
    },
    loginText: {
        color: "white"
    }
});