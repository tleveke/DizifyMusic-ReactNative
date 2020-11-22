import React, { useEffect, useState } from 'react'
import { FlatList, View } from 'react-native'
import { ActivityIndicator, Appbar, Card, Snackbar, Surface } from 'react-native-paper'
import ky from 'ky'

import { apiUrl } from '../config'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * @author JMF
 * @since 2020-11
 * @version 1.0
 */
export default function AlbumArtistScreen({ route, navigation }) {
    const { idColonne, nomColonne } = route.params;

    const [albums, setAlbums] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState(null)
    const [token, setToken] = useState(false)

    useEffect(() => {
        console.log('fdfdsfsdfdsdfssfdfsdfdsdsfdfsdfsdfssdfsdfdfsdfsfsdfsdsfdsfdsdffs');
        getTokenEmailAdmin()
        setLoading(false)
    }, [])

    const getTokenEmailAdmin = async () => {
        try {
            const value = await AsyncStorage.getItem('@bearerToken')
            setToken(value)
            getAlbumToken(value)
        } catch (e) {
            // error reading value
        }
    }

    const getAlbumToken = async (tokenn) => {

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

        const res = await api.get(`${apiUrl}/albums/artists/` + idColonne);
        if (res) {
            const data = await res.json()
            console.log(data);
            setAlbums(data);
        } else {
            setMessage('Erreur réseau')
        }
        setLoading(false)
    }

    const convertDuree = (duree) => {

        //if (duree)
        let min = Math.trunc(duree / 60)
        let sec = duree % 60
        if (sec < 10) {
            sec = `0${sec}`;
        }
        if (min < 10) {
            min = `0${min}`;
        }
        return `${min}:${sec}`
    }

    const goToBack = async () => {
        navigation.goBack();
    }

    const renderAlbum = ({ item, index }) => {
        return (
            <Card style={{ margin: 16, elevation: 4 }}>
                <Card.Title title={item.entitled + ' ' + convertDuree(item.dureeTotale)} subtitle={`Créé en ${item.annee} par ${item.artist.alias}`} />
                <Card.Cover source={{ uri: 'https://i.pravatar.cc/300?u=' + item.image }} />
            </Card>
        )
    }

    return (

        <Surface style={{ flex: 1 }}>
            <Appbar.Header style={{ backgroundColor: '#2F8D96' }}>
                <Appbar.Action icon="backburger" onPress={() => { goToBack() }} />
                <Appbar.Content title={nomColonne} />
            </Appbar.Header>
            {loading ? (
                <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignContent: 'center', height: '100%' }} />
            ) : (
                    <>
                        <FlatList
                            data={albums}
                            extraData={albums}
                            renderItem={renderAlbum}
                            keyExtractor={(item, index) => index.toString()}
                            ListFooterComponent={<View style={{ marginBottom: 48 }} />}
                        />
                    </>
                )}
            {message && (
                <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={Snackbar.DURATION_SHORT}>
                    {message}
                </Snackbar>
            )}
        </Surface>
    )
}
