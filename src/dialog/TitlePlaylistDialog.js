import React, { useEffect, useRef, useState } from 'react'
import { Button, Dialog, TextInput, Text } from 'react-native-paper'
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import ky from 'ky'

import { apiUrl } from '../config'
import AsyncStorage from '@react-native-async-storage/async-storage'
/**
 * @playlist Matthieu BACHELIER
 * @since 2020-11
 * @version 1.0
 */
export default function TitlePlaylistDialog({ titlePopup, title: initialAuthor = {}, visible, onDismiss, onSubmit }) {
    // Initialisation de l'état interne du composant
    const [title, setAuthor] = useState(initialAuthor)
    const [playlists, setPlaylists] = useState([])
    const [selectedItems,setSelectedItems] = useState([])

    // Références pour changer le focus automatiquement
    const aliasRef = useRef(null)
    const avatarRef = useRef(null)
    const anneeRef = useRef(null)

    useEffect(() => {
        getToken()
    }, [])

    const getToken = async () => {
        try {
            const value = await AsyncStorage.getItem('@bearerToken')
            const emailUser = await AsyncStorage.getItem('@emailUser')
            console.log(value)
            getPlaylistToken(value,emailUser) // A revoir plus tard
        } catch (e) {
            //console.log(e);
        }
    }

    const getPlaylistToken = async (tokenn,emailUser) => { // A revoir plus tard

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
        
        const res = await api.get(`${apiUrl}/playlists/user/`+emailUser);
        if (res) {
            const data = await res.json()
            let children = [];
            let tabTempo = [{ name: 'Playlist', id: 0, children: [] }]
            data.forEach(playlist => {
                tabTempo[0].children.push({ name: playlist.nom, id: playlist.id.toString() })
            });
            setPlaylists(tabTempo);
            console.log(tabTempo);
        } else {
            console.log('Erreur réseau')
        }
    }
    const onSelectionsChange = (selectedItems) => {
        console.log(selectedItems)
        setSelectedItems(selectedItems)
    }

    const beforeSubmit = () => {
        
        let tabTempo = [];
        selectedItems.forEach((id) => {
            tabTempo.push({id:id})
        });
        title.titles = tabTempo;
    }


    console.log('--------------Chargement-------------');

    return (
        <Dialog visible={visible} onDismiss={onDismiss}>
            <Dialog.Title>{titlePopup}</Dialog.Title>
            <Dialog.Content>
                <Text>Ajouter {title.designation}</Text>
      <View>
                <SectionedMultiSelect
                    items={playlists}
                    IconRenderer={Icon}
                    uniqueKey="id"
                    subKey="children"
                    selectText="Choissisez vos playlists..."
                    showDropDowns={true}
                    readOnlyHeadings={true}
                    onSelectedItemsChange={onSelectionsChange}
                    selectedItems={selectedItems}
                />
                </View>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => { beforeSubmit();onSubmit(title)}}>Valider</Button>
            </Dialog.Actions>
        </Dialog>
    )
}
