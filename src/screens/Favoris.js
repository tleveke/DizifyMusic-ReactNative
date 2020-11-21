import React, { useEffect, useState } from 'react'
import { FlatList, View, StyleSheet } from 'react-native'
import { ActivityIndicator, Appbar, Button, Card, Text, Dialog, FAB, Paragraph, Portal, Snackbar, Surface, TextInput } from 'react-native-paper'
import ky from 'ky'

import { apiUrl } from '../config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import UserDialog from '../dialog/UserDialog'
import Carousel from 'react-native-snap-carousel';
/**
 * @author JMT
 * @since 2020-11
 * @version 1.0
 */
export default function FavorisScreen({ navigation }) {
    const [albums, setAlbums] = useState([])
    const [titles, setTitles] = useState([])
    const [artists, setArtists] = useState([])
    const [showUserDialog, setShowUserDialog] = useState(false)

    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState(null)

    const [token, setToken] = useState(false)
    const [emailUser, setEmailUser] = useState("")

    const styles = StyleSheet.create({
        fab: {
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor: "white"
        },
    })

    useEffect(() => {
        setLoading(true)
        getTokenEmail()

        const unsubscribe = navigation.addListener('focus', () => {
            if (emailUser != '') {
                getFavoris();
            }
        });

        return unsubscribe;

    }, [navigation])

    const getTokenEmail = async () => {
        try {
            const value = await AsyncStorage.getItem('@bearerToken')
            const emailUser = await AsyncStorage.getItem('@emailUser')
            setEmailUser(emailUser)
            setToken(value)
            getFavorisToken(value, emailUser) // A revoir plus tard
        } catch (e) {
            // error reading value
        }
    }

    const getFavorisToken = async (tokenn, emailUserr) => { // A revoir plus tard

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

        const res = await api.get(`${apiUrl}/favoris/user/` + emailUserr);

        if (res) {
            try {
                const data = await res.json()
                setAlbums(data.albums)
                setArtists(data.artists)
                setTitles(data.titles)
            }
            catch (e) {
                setAlbums([])
                setArtists([])
                setTitles([])
            }
        } else {
            setMessage('Erreur réseau')
        }
        setLoading(false)
    }

    const getFavoris = async () => {

        // API Setup



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
        console.log(`${apiUrl}/playlists/user/` + emailUser)
        const res = await api.get(`${apiUrl}/favoris/user/` + emailUser);

        if (res) {
            try {
                console.log(await res.toString())
                /*const data = await res.json()
                setAlbums(data.albums)
                setArtists(data.artists)
                setTitles(data.titles)*/
            }
            catch (e) {
                setAlbums([])
                setArtists([])
                setTitles([])
            }
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
    const changeFavoris = async (item, type) => {
        // API Setup

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

        if (type == 'album') {
            var favoris = {
                "user": { "email": emailUser },
                "albums": [item]
            }
        }
        else if (type == 'artist') {
            var favoris = {
                "user": { "email": emailUser },
                "artists": [item]
            }
        }
        else if (type == 'title') {
            var favoris = {
                "user": { "email": emailUser },
                "titles": [item]
            }
        }
        console.log(favoris)
        const res = await api.put(`${apiUrl}/favoris/${type}/`, { json: favoris });

        if (res) {
            console.log(await res.json());
            getFavoris()
        } else {
            setMessage('Erreur réseau')
        }
    }

    const deleteToken = async () => {
        try {
            await AsyncStorage.removeItem('@bearerToken')
            return null
        } catch (e) {
            // remove error
        }
    }

    const goToDiconnect = () => {
        deleteToken()
        navigation.navigate('Accueil');
    }
    const editUser = () => {
        setShowUserDialog(false)
        setMessage('Profil modifié');
    }


    const renderArtist = ({ item, index }) => {

        return (
            <Card style={{ margin: 20, elevation: 4, borderRadius: 30 }}>
                <Card.Title title={item.alias} subtitle={`C`} />
                <Card.Content>
                    <FAB
                        style={styles.fab}
                        small
                        color="red"
                        icon="heart"
                        onPress={() => changeFavoris(item, 'artist')}
                    />
                </Card.Content>
                <Card.Cover source={{ uri: 'https://i.pravatar.cc/300?u=' + item.avatar }} />
            </Card>
        )
    }

    const renderTitle = ({ item, index }) => {

        return (
            <Card style={{ margin: 20, elevation: 4, borderRadius: 30 }}>
                <Card.Title title={item.designation + ' ' + convertDuree(item.duree)} subtitle={`Créé en par ${item.artist.alias}`} />
                <Card.Content>
                    <FAB
                        style={styles.fab}
                        small
                        color="red"
                        icon="heart"
                        onPress={() => changeFavoris(item, 'title')}
                    />
                </Card.Content>
                <Card.Cover source={{ uri: 'https://i.pravatar.cc/300?u=' + item.image }} />
            </Card>
        )
    }

    const renderAlbum = ({ item, index }) => {

        return (
            <Card style={{ margin: 20, elevation: 4, borderRadius: 30 }}>
                <Card.Title title={item.entitled + ' ' + convertDuree(item.dureeTotale)} subtitle={`Créé en ${item.annee} par ${item.artist.alias}`} />
                <Card.Content>
                    <FAB
                        style={styles.fab}
                        small
                        color="red"
                        icon="heart"
                        onPress={() => changeFavoris(item, 'album')}
                    />
                </Card.Content>
                <Card.Cover source={{ uri: 'https://i.pravatar.cc/300?u=' + item.image }} />
            </Card>
        )
    }


    return (
        <Surface style={{ flex: 1 }}>

            <Appbar.Header style={{ backgroundColor: '#2F8D96' }}>
                <Appbar.Content title="Favoris" />

                <Appbar.Action icon="account-edit" onPress={() => { setShowUserDialog(true) }} />
                <Appbar.Action icon="logout" onPress={() => { goToDiconnect() }} />
            </Appbar.Header>
            {loading ? (
                <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignContent: 'center', height: '100%' }} />
            ) : (
                    <>
                        <Text>Artistes</Text>
                        <Carousel
                            layout={'tinder'} layoutCardOffset={9}
                            data={artists}
                            renderItem={renderArtist}
                            sliderWidth={500}
                            itemWidth={400}
                        />
                        <Text>Titres</Text>
                        <Carousel
                            layout={'tinder'} layoutCardOffset={9}
                            data={titles}
                            renderItem={renderTitle}
                            sliderWidth={500}
                            itemWidth={400}
                        />
                        <Text>Albums</Text>
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
            <Portal>
                {showUserDialog && (
                    <UserDialog
                        titlePopup="Modifier votre profil"
                        visible={showUserDialog}
                        onDismiss={() => {
                            setShowUserDialog(false)
                        }}
                        onSubmit={editUser}
                    />
                )}
            </Portal>
        </Surface>
    )
}
