
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, Button,Image, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';
import { Snackbar, Surface, Appbar } from 'react-native-paper';
import ky from 'ky'
import { apiUrl } from '../config'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen({ navigation }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [pseudo, setPseudo] = useState("")
    const [token, setToken] = useState(false)
    const [message, setMessage] = useState(null)

    const api = ky.extend({
        hooks: {
            beforeRequest: [
                request => {
                    request.headers.set('Authorization', 'Bearer ');
                }
            ]
        }
    });

    const inscription = async () => {
        console.log(email)
        console.log(password)
        console.log(pseudo)

        let user = {
            email: email,
            password: password,
            pseudo: pseudo
        }

        try {

            const res = await api.post(`${apiUrl}/authenticate/signup`, { json: user })
            if (res) {
                const response = await res.text();
                if (response == 'Utilisateur déjà inscrit') {
                    setMessage("Échec de l'Inscription !");
                }
                else {
                    navigation.navigate('Accueil');
                    setMessage('Inscription Réussie !');
                }
            } else {
                setMessage("Échec de l'Inscription !");
            }
        } catch (error) {
            console.log(error)
        }


    }

    const goToLogin = () => {
        navigation.navigate('Login')
    }

    return (
        <Surface style={{ flex: 1 }}>


            <Appbar.Header style={{ backgroundColor: '#2F8D96' }}>
                <Appbar.Content title="DizifyMusic - Connexion" />
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
                <View style={styles.inputView} >
                    <TextInput
                        style={styles.inputText}
                        placeholder="Pseudo..."
                        placeholderTextColor="white"
                        onChangeText={text => setPseudo(text)} />
                </View>
                <View style={styles.loginBtn} >
                    <Button title="S'inscrire" color="#FA2A45" onPress={inscription} style={styles.loginBtn} >
                    </Button>
                </View>
                <View style={styles.loginBtn} >
                    <Button onPress={goToLogin} color="#FA2A45" title="Retour sur la page de Connexion" >
                    </Button>
                </View>
                {message && (
                    <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={Snackbar.DURATION_SHORT}>
                        {message}
                    </Snackbar>
                )}

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