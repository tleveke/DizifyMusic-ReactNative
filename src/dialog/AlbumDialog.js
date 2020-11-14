import React, { useEffect, useRef, useState } from 'react'
import { Button, Dialog, TextInput } from 'react-native-paper'
import DropDown from 'react-native-paper-dropdown';
import { StyleSheet } from 'react-native';
import ky from 'ky'

import { apiUrl } from '../config'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * @author LMF
 * @since 2020-11
 * @version 1.0
 */
export default function AlbumDialog({ titlePopup, title: initialTitle = {}, visible, onDismiss, onSubmit }) {
    // Initialisation de l'état interne du composant
    const [title, setTitle] = useState(initialTitle)
    const [showDropDown, setShowDropDown] = useState(false);
    const [artist, setArtist] = useState();
    const [artistList, setArtistList] = useState([])

    // Références pour changer le focus automatiquement
    const designationRef = useRef(null)
    const dureeRef = useRef(null)
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
            if (title.artist != undefined) {
                console.log("edit")
                setArtist(title.artist.id.toString())
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
        title.artist = { "id": parseInt(artist) }
    }


    return (
        <Dialog visible={visible} onDismiss={onDismiss}>
            <Dialog.Title>{titlePopup}</Dialog.Title>
            <Dialog.Content>
                <TextInput
                    label="Nom du titre"
                    value={title.designation}
                    onChangeText={(designation) => setTitle({ ...title, designation })}
                    returnKeyType="done"
                    blurOnSubmit={false}
                    onSubmitEditing={() => dureeRef.current.focus()}
                />
                <TextInput
                    ref={dureeRef}
                    label="Durée en secondes"
                    value={title.duree ? title.duree.toString() : ''}
                    onChangeText={(duree) => setTitle({ ...title, duree })}
                    keyboardType="numeric"
                    returnKeyType="done"
                    blurOnSubmit={false}
                    onSubmitEditing={() => imageRef.current.focus()}
                />
                <TextInput
                    ref={imageRef}
                    label="Image"
                    value={title.image ? title.image.toString() : ''}
                    onChangeText={(image) => setTitle({ ...title, image })}
                    returnKeyType="done"
                    blurOnSubmit={false}
                    onSubmitEditing={() => idArtistRef.current.focus()}
                />
                {/*<TextInput
          ref={idArtistRef}
          label="Id de l'artiste (a revoir avec un select)" //TODO voir https://openbase.io/js/react-native-paper-form-builder/documentation
          value={title.annee ? title.annee.toString() : ''}
          onChangeText={(annee) => setTitle({ ...title, annee })}
          keyboardType="numeric"
          returnKeyType="Valider"
          blurOnSubmit={false}
          onSubmitEditing={() => onSubmit(title)}
        />*/}

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
                <Button onPress={() => { beforeSubmit(); onSubmit(title) }}>Valider</Button>
            </Dialog.Actions>
        </Dialog>
    )



}
