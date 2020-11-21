
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';
import {Snackbar} from 'react-native-paper';
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
            <View style={styles.inputView} >
                <TextInput
                    style={styles.inputText}
                    placeholder="Pseudo..."
                    placeholderTextColor="#003f5c"
                    onChangeText={text => setPseudo(text)} />
            </View>
            <View style={styles.loginBtn} >
                <Button title="S'inscrire" onPress={inscription} style={styles.loginBtn} >
                </Button>
            </View>
            <View style={styles.loginBtn} >
                <Button onPress={goToLogin} title="Retour sur la page de Connexion" >
                </Button>
            </View>
            {message && (
                <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={Snackbar.DURATION_SHORT}>
                    {message}
                </Snackbar>
            )}

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