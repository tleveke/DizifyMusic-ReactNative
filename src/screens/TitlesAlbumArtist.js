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
export default function TitlesAlbumArtistScreen({ route, navigation }) {
    const { typeColonne, idColonne, nomColonne } = route.params;

    const [titles, setTitles] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState(null)

    const [token, setToken] = useState(false)

    useEffect(() => {
        getTokenEmailAdmin()
        setLoading(false)
    }, [navigation])

    const getTokenEmailAdmin = async () => {
        try {
            const value = await AsyncStorage.getItem('@bearerToken')
            setToken(value)
            getTitlesToken(value)
        } catch (e) {
            // error reading value
        }
    }

    const getTitlesToken = async (tokenn) => {

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
      
      const res = await api.get(`${apiUrl}/titles/${typeColonne}/` + idColonne);
      if (res) {
          const data = await res.json()
          setTitles(data);
      } else {
          setMessage('Erreur réseau')
      }
      setLoading(false)
  }

    const getTitles = async () => {

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
        
        const res = await api.get(`${apiUrl}/titles/${typeColonne}/` + idColonne);
        if (res) {
            const data = await res.json()
            setTitles(data);
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

    const renderTitle = ({ item, index }) => {
        console.log(item)

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
                <Appbar.Action icon="backburger" onPress={() => { goToBack() }} />
                <Appbar.Content title={nomColonne} />
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
        </Surface>
    )
}
