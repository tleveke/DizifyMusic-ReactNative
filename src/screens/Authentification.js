
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, Button, Image, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';
import { Surface, Appbar } from 'react-native-paper'
import ky from 'ky'
import { apiUrl } from '../config'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Authentification({ navigation }) {
    const [email, setEmail] = useState("")
    const [emailUser, setEmailUser] = useState("")
    const [password, setPassword] = useState("")
    const [token, setToken] = useState(false)

    const api = ky.extend({
        hooks: {
            beforeRequest: [
                request => {
                    request.headers.set('Authorization', 'Bearer');
                }
            ]
        }
    });

    useEffect(() => {
        getTokenEmail()
    }, [])

    const getTokenEmail = async () => {
        try {
            const tokenSto = await AsyncStorage.getItem('@bearerToken')
            const emailUser = await AsyncStorage.getItem('@emailUser')
            setEmailUser(emailUser);
            setToken(tokenSto);
            if (tokenSto && emailUser) {
                console.log('yo')
                isValidToken(tokenSto, emailUser)
            }
        } catch (e) {
            console.log(e)
        }
    }
    const isValidToken = async (tokenSto, emailUser) => {

        const api = ky.extend({
            hooks: {
                beforeRequest: [
                    request => {
                        request.headers.set('Authorization', 'Bearer ' + tokenSto);
                        request.headers.set('Content-Type', 'application/json');
                    }
                ]
            }
        });

        // API Setup

        var json = {
            "token": tokenSto,
            "email": emailUser
        }
        console.log(json)

        try {

            const res = await api.post(`${apiUrl}/isTokenValid`, { json: json });

            if (res) {
                if (await res.text() === 'true') {
                    navigation.navigate("Bottom")
                }
            } else {
                console.log(await res.toString())
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    const connection = async () => {
        console.log(email)
        console.log(password)

        try {

            const res = await api.post(`${apiUrl}/authenticate`, { json: { username: email, password: password } })
            //console.log(await res.json())
            if (res) {
                let responseJson = await res.json()
                if (responseJson != 'Not found') {

                    try {
                        await AsyncStorage.setItem(
                            '@bearerToken',
                            responseJson.token
                        );
                        await AsyncStorage.setItem(
                            '@emailUser',
                            email
                        );
                        await AsyncStorage.setItem(
                            '@isAdmin',
                            responseJson.admin.toString()
                        );
                        setPassword('') // TODO: On revient dessus pour finir ce truc de merde
                        navigation.navigate("Bottom")
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

    const goToSignup = () => {
        navigation.navigate('Signup')
    }
    const goToAccueil = () => {
        navigation.navigate('Accueil')
    }


    return (
        <Surface style={{ flex: 1 }}>


            <Appbar.Header style={{ backgroundColor: '#2F8D96' }}>
                <Appbar.Content title="DizifyMusic - Connexion" />
                <Appbar.Action icon="login" onPress={() => { navigation.navigate('Login') }} />
            </Appbar.Header>

            <View style={styles.container}>


                <Image source={require('../assets/img/logo_dizify.png')} />

                <Text style={styles.logo}>DizzifyMusic</Text>
                <View style={styles.inputView} >
                    <TextInput
                        style={styles.inputText}
                        placeholder="Email..."
                        placeholderTextColor="white"
                        onChangeText={text => setEmail(text)} />
                </View>
                <View style={styles.inputView} >
                    <TextInput
                        secureTextEntry
                        style={styles.inputText}
                        placeholder="Password..."
                        placeholderTextColor="white"
                        onChangeText={text => setPassword(text)} />
                </View>

                <TouchableHighlight style={styles.button} >
                    <Button style={styles.btnSize} color="#FA2A45" onPress={connection} title="Se connecter">
                    </Button>
                </TouchableHighlight>

                <TouchableHighlight style={styles.button} >
                    <Button style={styles.btnSize} color="#FA2A45" onPress={goToSignup} title="S'inscrire">
                    </Button>
                </TouchableHighlight>
                <TouchableHighlight style={styles.button} >
                    <Button style={styles.btnSize} color="#FA2A45" onPress={goToAccueil} title="Accueil" >
                    </Button>
                </TouchableHighlight>

            </View>
        </Surface>
    );
}




const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
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
        backgroundColor: "grey",
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
    button: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10
    },
    btnSize: {
        width: "100%"
    },
    loginText: {
        color: "white"
    }
});