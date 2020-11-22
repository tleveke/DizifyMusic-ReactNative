import React, { useEffect, useRef, useState } from 'react'
import { Button, Dialog, TextInput } from 'react-native-paper'
import ky from 'ky'
import { Keyboard } from 'react-native'; 

import { apiUrl } from '../config'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * @user Matthieu BACHELIER
 * @since 2020-11
 * @version 1.0
 */
export default function UserDialog({ titlePopup, visible, onDismiss, onSubmit }) {
    // Initialisation de l'état interne du composant
    const [user, setUser] = useState({})

    // Références pour changer le focus automatiquement
    const pseudoRef = useRef(null)
    const avatarRef = useRef(null)
    const passwordRef = useRef(null)
    const [token, setToken] = useState(false)
    const [emailUser, setEmailUser] = useState("")

    useEffect(() => {
        getToken()
    }, [])

    const getToken = async () => {
        try {
            const value = await AsyncStorage.getItem('@bearerToken')
            const email = await AsyncStorage.getItem('@emailUser')
            setEmailUser(email)
            setToken(value);
            getUser(value,email) // A revoir plus tard
        } catch (e) {
            //console.log(e);
        }
    }

    const getUser = async (tokenn,emaill) => { // A revoir plus tard

        // API Setup

        const api = ky.extend({
            hooks: {
                beforeRequest: [
                    request => {
                        request.headers.set('Authorization', 'Bearer ' + tokenn);
                        request.headers.set('Content-Type', 'application/json');
                    }
                ]
            }
        });

        // API Setup

        const res = await api.get(`${apiUrl}/user/`+ emaill);
        if (res) {
            const data = await res.json()
            setUser(data);
        } else {
            console.log('Erreur réseau')
        }
    }

    const editUser = async () => {
        // API Setup

        if (user.passwordNew != '') {
            user.password = user.passwordNew;
        }

        const api = ky.extend({
            hooks: {
                beforeRequest: [
                    request => {
                        request.headers.set('Authorization', 'Bearer ' + token);
                        request.headers.set('Content-Type', 'application/json');
                    }
                ]
            }
        });

        // API Setup

        const res = await api.put(`${apiUrl}/user/`, {json:user});
        if (res) {
            const data = await res.json()
            console.log(data)
            return 'Réussite de la modification'
        } else {
            return 'Erreur réseau'
        }
    }



    return (
        <Dialog visible={visible} onDismiss={onDismiss}>
            <Dialog.Title>{titlePopup}</Dialog.Title>
            <Dialog.Content>
                <TextInput
                    label="Pseudo"
                    value={user.pseudo}
                    onChangeText={(pseudo) => setUser({ ...user, pseudo })}
                    returnKeyType="done"
                    blurOnSubmit={false}
                    onSubmitEditing={() => avatarRef.current.focus()}
                />
                <TextInput
                    ref={avatarRef}
                    label="Avatar"
                    value={user.avatar ? user.avatar.toString() : ''}
                    onChangeText={(avatar) => setUser({ ...user, avatar })}
                    returnKeyType="done"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordRef.current.focus()}
                />
                <TextInput
                    ref={passwordRef}
                    label="Password"
                    value={user.passwordNew ? user.passwordNew.toString() : ''}
                    onChangeText={(passwordNew) => setUser({ ...user, passwordNew })}
                    keyboardType="numeric"
                    returnKeyType="done"
                    blurOnSubmit={false}
                    onSubmitEditing={() => Keyboard.dismiss()}
                />
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => {editUser();onSubmit(user)}}>Valider</Button>
            </Dialog.Actions>
        </Dialog>
    )
}
