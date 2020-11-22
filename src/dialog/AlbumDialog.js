import React, { useEffect, useRef, useState } from 'react'
import { Button, Dialog, TextInput } from 'react-native-paper'
import DropDown from 'react-native-paper-dropdown';
import { StyleSheet,Keyboard } from 'react-native';
import ky from 'ky'

import { apiUrl } from '../config'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * @author LMF
 * @since 2020-11
 * @version 1.0
 */
export default function AlbumDialog({ titlePopup, album: initialAlbum = {}, visible, onDismiss, onSubmit }) {
    // Initialisation de l'état interne du composant
    const [album, setAlbum] = useState(initialAlbum)
    const [showDropDown, setShowDropDown] = useState(false);
    const [artist, setArtist] = useState();
    const [artistList, setArtistList] = useState([])

    // Références pour changer le focus automatiquement
    const entitledRef = useRef(null)
    const anneeRef = useRef(null)
    const imageRef = useRef(null)
    const idArtistRef = useRef(null)

    const styles = StyleSheet.create({
        containerStyle: {
            flex: 1,
            marginHorizontal: 20,
            justifyContent: 'center',
        },
    });


    useEffect(() => {
        getToken()
    }, [])

    const getToken = async () => {
        try {
            const value = await AsyncStorage.getItem('@bearerToken')
            getArtistToken(value) // A revoir plus tard
        } catch (e) {
            //console.log(e);
        }
    }

    const getArtistToken = async (tokenn) => { // A revoir plus tard

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

        const res = await api.get(`${apiUrl}/artists`);
        if (res) {
            const data = await res.json()
            let tabTempo = []
            data.forEach(artist => {
                tabTempo.push({ label: artist.alias, value: artist.id.toString() })
            });
            setArtistList(tabTempo)
            if (album.artist != undefined) {
                console.log("edit")
                setArtist(album.artist.id.toString())
            }
            else {
                console.log("add")
                setArtist(tabTempo[0].value.toString())
            }
        } else {
            console.log('Erreur réseau')
        }
    }

    const beforeSubmit = () => {
        album.artist = { "id": parseInt(artist) }
    }


    return (
        <Dialog onPress={Keyboard.dismiss()} visible={visible} onDismiss={onDismiss}>
            <Dialog.Title>{titlePopup}</Dialog.Title>
            <Dialog.Content onPress={Keyboard.dismiss()}>
                <TextInput
                    label="Nom de l'album"
                    value={album.entitled}
                    onChangeText={(entitled) => setAlbum({ ...album, entitled })}
                    returnKeyType="done"
                    blurOnSubmit={false}
                    onSubmitEditing={() => anneeRef.current.focus()}
                />
                <TextInput
                    ref={anneeRef}
                    label="Année de sortie"
                    value={album.annee ? album.annee.toString() : ''}
                    onChangeText={(annee) => setAlbum({ ...album, annee })}
                    keyboardType="numeric"
                    returnKeyType="done"
                    blurOnSubmit={false}
                    onSubmitEditing={() => imageRef.current.focus()}
                />
                <TextInput
                    ref={imageRef}
                    label="Image"
                    value={album.image ? album.image.toString() : ''}
                    onChangeText={(image) => setAlbum({ ...album, image })}
                    returnKeyType="done"
                    blurOnSubmit={false}
                    onSubmitEditing={() => Keyboard.dismiss()}
                />

                <DropDown
                    label={'Choissisez un artiste'}
                    mode={'outlined'}
                    value={artist}
                    setValue={setArtist}
                    list={artistList}
                    visible={showDropDown}
                    showDropDown={() => setShowDropDown(true)}
                    onDismiss={() => setShowDropDown(false)}
                    inputProps={{
                        right: <TextInput.Icon name={'menu-down'} />,
                    }}
                />

            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => { beforeSubmit(); onSubmit(album) }}>Valider</Button>
            </Dialog.Actions>
        </Dialog>
    )



}
