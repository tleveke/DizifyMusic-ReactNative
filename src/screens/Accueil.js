import React, { useEffect, useState } from 'react'
import { FlatList, View,Text } from 'react-native'
import { ActivityIndicator, Appbar, Button, Card, Dialog, FAB, Paragraph, Portal, Snackbar, Surface, TextInput } from 'react-native-paper'
import ky from 'ky'

import { StyleSheet } from 'react-native';
import { apiUrl } from '../config'
import TitleDialog from '../dialog/TitleDialog'
import TitlePlaylistDialog from '../dialog/TitlePlaylistDialog'
import AsyncStorage from '@react-native-async-storage/async-storage'
import UserDialog from '../dialog/UserDialog'

/**
 * @author Matthieu BACHELIER
 * @since 2020-11
 * @version 1.0
 */
export default function AccueilScreen({ navigation }) {
    const [titles, setTitles] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState(null)
    const [title, setTitle] = useState({})

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
        getTitles()
        const unsubscribe = navigation.addListener('focus', () => {
            getTitles();
        });

        return unsubscribe;


        //getTitles()

    }, [navigation])


    const getTitles = async () => {

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
        const res = await api.get(`${apiUrl}/titles/accueil`);

        if (res) {
            const data = await res.json()
            setTitles(data);
            console.log(data);
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

    return (

        <Surface style={{ flex: 1 }}>

            <Appbar.Header style={{ backgroundColor: '#2F8D96' }}>
                <Appbar.Content title="DizifyMusic" />
                <Appbar.Action icon="login"   onPress={() => { navigation.navigate('Login') }} />
            </Appbar.Header>
            {loading ? (
                <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignContent: 'center', height: '100%' }} />
            ) : (
                    <>
                    <Text style={{alignSelf:"center", fontSize:20}}>Les Meilleurs Artistes</Text>
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
        </Surface>
    )
}
