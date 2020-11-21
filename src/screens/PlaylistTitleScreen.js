import React, { useEffect, useState } from 'react'
import { FlatList, View } from 'react-native'
import { ActivityIndicator, Appbar, Button, Card, Dialog, FAB, Paragraph, Portal, Snackbar, Surface, TextInput } from 'react-native-paper'
import ky from 'ky'

import { StyleSheet } from 'react-native';
import { apiUrl } from '../config'
import TitleDialog from '../dialog/TitleDialog'
import TitlePlaylistDialog from '../dialog/TitlePlaylistDialog'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * @author JMF
 * @since 2020-11
 * @version 1.0
 */
export default function PlaylistTitlesScreen({ route, navigation }) {
    const { playlist } = route.params;

    const [titles, setTitles] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState(null)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showAddPlaylistDialog, setShowAddPlaylistDialog] = useState(false)

    const [title, setTitle] = useState({})
    const [token, setToken] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
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
        getTokenEmailAdmin()
        setTitles(playlist.titles)
        setLoading(false)

        const unsubscribe = navigation.addListener('focus', () => {
            if (emailUser != '') {
                setTitles(playlist.titles);
            }
        });

        return unsubscribe;


    }, [navigation])

    const getTokenEmailAdmin = async () => {
        try {
            const value = await AsyncStorage.getItem('@bearerToken')
            const emailUser = await AsyncStorage.getItem('@emailUser')
            setEmailUser(emailUser)
            setToken(value)
        } catch (e) {
            // error reading value
        }
    }

    const getPlaylist = async () => {

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

        const res = await api.get(`${apiUrl}/playlist/` + playlist.id);

        if (res) {
            const data = await res.json()
            setTitles(data.titles);
        } else {
            setMessage('Erreur réseau')
        }
        setLoading(false)
    }

    const getAlbumEntitled = (item) => {
        let alent = ''
        if (item.album != null) {
            alent = `dans ${item.album.entitled}`;
        }
        return alent;
    }

    const changeFavoris = async (item) => {
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

        var favoris = {
            "user": { "email": emailUser },
            "titles": [item]
        }
        console.log(favoris)
        const res = await api.put(`${apiUrl}/favoris/title/`, { json: favoris });

        if (res) {
            //getTitles()
            getPlaylist()
        } else {
            setMessage('Erreur réseau')
        }
    }
    const deleteTitle = async (item) => {

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

        var playlistRequest = {
            "id": playlist.id,
            "titles": [item]
        }

        console.log(playlistRequest)

        const res = await api.put(`${apiUrl}/playlist/title/delete`, { json: playlistRequest });

        if (res) {
            getPlaylist()
        } else {
            setMessage('Erreur réseau')
        }
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

    const goToDiconnect = async () => {
        try {
            await AsyncStorage.removeItem('@bearerToken')
        } catch (e) {
            // remove error
        }
        navigation.navigate('Accueil');
    }

    const goToPlaylists = async () => {
        navigation.navigate('Playlist');
    }

    const renderTitle = ({ item, index }) => {
        console.log(item)
        let favIcon = 'heart-outline';
        if (item.favoris == true) {
            favIcon = 'heart';
        }

        return (
            <Card style={{ margin: 16, elevation: 4 }}>
                <Card.Title title={item.designation + ' ' + convertDuree(item.duree)} subtitle={`Réalisé par ${item.artist.alias} ${getAlbumEntitled(item)}`} />
                <Card.Content>
                    <FAB
                        style={styles.fab}
                        small
                        color="red"
                        icon={favIcon}
                        onPress={() => changeFavoris(item)}
                    />
                </Card.Content>
                <Card.Cover source={{ uri: 'https://i.pravatar.cc/300?u=' + item.image }} />
                <Card.Content>
                    <Button onPress={() => {
                        deleteTitle(item)
                    }}>Supprimer de la playlist</Button>
                </Card.Content>
            </Card>
        )
    }

    return (

        <Surface style={{ flex: 1 }}>

            <Appbar.Header style={{ backgroundColor: '#2F8D96' }}>
                <Appbar.Action icon="backburger" onPress={() => { goToPlaylists() }} />
                <Appbar.Content title={playlist.nom} />
            </Appbar.Header>
            {loading ? (
                <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignContent: 'center', height: '100%' }} />
            ) : (
                    <>
                        <FlatList
                            data={titles}
                            extraData={titles}
                            renderItem={renderTitle}
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
            <Portal>
                <Dialog visible={showDeleteDialog}>
                    <Dialog.Title>Confirmer votre action</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>Êtes-vous sûr de vouloir supprimer ce titre dans la playlist ?</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <View>
                            <Button onPress={() => {
                                deleteTitle(title)
                                setShowDeleteDialog(false)
                            }}>Oui</Button>
                            <Button onPress={() => {
                                setShowDeleteDialog(false)
                            }}>Non</Button>
                        </View>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </Surface>
    )
}
