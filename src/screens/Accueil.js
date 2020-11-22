import React, { useEffect, useState } from 'react'
import { FlatList, View, Text } from 'react-native'
import { ActivityIndicator, Appbar, Button, Card, Dialog, FAB, Paragraph, Portal, Snackbar, Surface, TextInput } from 'react-native-paper'
import ky from 'ky'

import Carousel from 'react-native-snap-carousel';
import { apiUrl } from '../config'

/**
 * @author Matthieu BACHELIER
 * @since 2020-11
 * @version 1.0
 */
export default function AccueilScreen({ navigation }) {
    const [titles, setTitles] = useState([])
    const [albums, setAlbums] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState(null)

    useEffect(() => {
        setLoading(true)
        getTitlesAlbums()
        const unsubscribe = navigation.addListener('focus', () => {
            getTitlesAlbums()
        });

        return unsubscribe;
        

    }, [navigation])


    const getTitlesAlbums = async () => {

        // API Setup

        const api = ky.extend({
            hooks: {
                beforeRequest: [
                    request => {
                        request.headers.set('Authorization', 'Bearer ');
                        request.headers.set('Content-Type', 'application/json');
                    }
                ]
            }
        });

        // API Setup
        const resArtist = await api.get(`${apiUrl}/titles/accueil`);

        if (resArtist) {
            const data = await resArtist.json()
            setTitles(data);
        } else {
            setMessage('Erreur réseau')
        }

        const resAlbum = await api.get(`${apiUrl}/albums/accueil`);

        if (resAlbum) {
            const data = await resAlbum.json()
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

    const getAlbumEntitled = (item) => {
        let alent = ''
        if (item.album != null) {
            alent = `dans ${item.album.entitled}`;
        }
        return alent;
    }

    const renderTitle = ({ item, index }) => {
        return (
            <Card style={{ margin: 16, elevation: 4 }}>
                <Card.Title title={item.designation + ' ' + convertDuree(item.duree)} subtitle={`Réalisé par ${item.artist.alias} ${getAlbumEntitled(item)}`} />
                <Card.Cover source={{ uri: 'https://i.pravatar.cc/300?u=' + item.image }} />
            </Card>
        )
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
                <Appbar.Content title="DizifyMusic - Accueil" />
                <Appbar.Action icon="login" onPress={() => { navigation.navigate('Login') }} />
            </Appbar.Header>
            {loading ? (
                <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignContent: 'center', height: '100%' }} />
            ) : (
                    <>
                        <Text style={{ alignSelf: "center", fontSize: 20 }}>Les Meilleurs Artistes</Text>
                        <Carousel
                            layout={'tinder'} layoutCardOffset={9}
                            data={titles}
                            renderItem={renderTitle}
                            sliderWidth={500}
                            itemWidth={400}
                        />

                        <Text style={{ alignSelf: "center", fontSize: 20 }}>Les Meilleurs Albums</Text>
                        <Carousel
                            layout={'tinder'} layoutCardOffset={9}
                            data={albums}
                            renderItem={renderAlbum}
                            sliderWidth={500}
                            itemWidth={400}
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
