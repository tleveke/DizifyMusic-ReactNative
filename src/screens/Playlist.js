import React, { useEffect, useState } from 'react'
import { FlatList, View, StyleSheet } from 'react-native'
import { ActivityIndicator, Appbar, Button, Card, Dialog, FAB, Text, Paragraph, Portal, Snackbar, Surface, TextInput } from 'react-native-paper'
import ky from 'ky'

import { apiUrl } from '../config'
import PlaylistDialog from '../dialog/PlaylistDialog'
import AsyncStorage from '@react-native-async-storage/async-storage'
import UserDialog from '../dialog/UserDialog'


/**
 * @author LMF
 * @since 2020-11
 * @version 1.0
 */
export default function PlaylistScreen({ navigation }) {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUserDialog, setShowUserDialog] = useState(false)

  const [playlist, setPlaylist] = useState({})
  const [token, setToken] = useState(false)
  const [emailUser, setEmailUser] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

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
    getTokenEmailAdmin()
    //getPlaylists()

    const unsubscribe = navigation.addListener('focus', () => {
      if (emailUser != '') {
        getPlaylists();
      }
    });


    return unsubscribe;

  }, [navigation])

  const getTokenEmailAdmin = async () => {
    try {
      const value = await AsyncStorage.getItem('@bearerToken')
      const emailUser = await AsyncStorage.getItem('@emailUser')
      const isAdmin = await AsyncStorage.getItem('@isAdmin')
      setIsAdmin((isAdmin === 'true'))
      setEmailUser(emailUser)
      setToken(value)
      getPlaylistToken(value, emailUser) // A revoir plus tard
    } catch (e) {
      // error reading value
    }
  }

  const getPlaylistToken = async (tokenn, emailUser) => { // A revoir plus tard

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

    const res = await api.get(`${apiUrl}/playlists/user/` + emailUser);

    if (res) {
      const data = await res.json()
      setPlaylists(data)
      console.log(data);
    } else {
      setMessage('Erreur réseau')
    }
    setLoading(false)
  }

  const getPlaylists = async () => {

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
    const res = await api.get(`${apiUrl}/playlists/user/` + emailUser);

    if (res) {
      const data = await res.json()
      setPlaylists(data)
    } else {
      setMessage('Erreur réseau')
    }
    setLoading(false)
  }

  const addPlaylist = async (a) => {
    try {

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

      a.user = { "email": emailUser };
      console.log(a);
      const res = await api.post(`${apiUrl}/playlist`, { json: a })
      if (res) {
        getPlaylists()
        setMessage('Nouvel auteur ajouté !')
      } else {
        setMessage("Erreur lors de l'ajout")
      }
    } catch (error) {
      setMessage("Erreur lors de l'ajout")
    }
    setShowAddDialog(false)
  }

  const editPlaylist = async (a) => {


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
    try {
      const res = await api.put(`${apiUrl}/playlist`, { json: a })
      if (res) {
        getPlaylists()
        setMessage('Auteur modifié !')
      } else {
        setMessage('Erreur lors de la modification')
      }
    } catch (error) {
      setMessage('Erreur lors de la modification')
    }
    setShowEditDialog(false)
  }

  const deletePlaylist = async (item) => {

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

    const res = await api.delete(`${apiUrl}/playlist/` + item.id)
    if (res) {
      setLoading(true)
      getPlaylists()
    } else {
      setMessage('Erreur réseau')
    }
    setShowDeleteDialog(false)
  }


  const goToListTitles = (item) => {
    navigation.navigate('ShowTitlePlaylist', {
      playlist: item
    });
  }

  const renderPlaylist = ({ item, index }) => {

    return (
      <Card style={{ margin: 16, elevation: 4 }}>
        <Card.Title title={item.nom} />
        <Card.Cover source={{ uri: 'https://i.pravatar.cc/300?u=' + item.image }} />
        <Card.Content>

          {/*<FlatList
            data={item.titles}
            extraData={item.titles}
            renderItem={renderTitle}
            keyExtractor={(item, index) => index.toString()}
          />*/}
          <Button
            style={{ flexGrow: 1 }}
            onPress={() => {
              goToListTitles(item)
            }}>
            Regarder les titres de la playlist
          </Button>


        </Card.Content>
        <Card.Actions style={{ flex: 1 }}>
          <Button
            style={{ flexGrow: 1 }}
            onPress={() => {
              setPlaylist(item)
              setShowEditDialog(true)
            }}>
            Modifier
          </Button>
          <Button style={{ flexGrow: 1 }}
            onPress={() => {
              setPlaylist(item)
              setShowDeleteDialog(true)
            }}>
            Supprimer
          </Button>
        </Card.Actions>
      </Card>
    )
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
    navigation.navigate('Login')
  }
  const editUser = () => {
    setShowUserDialog(false)
    setMessage('Profil modifié');
  }

  return (
    <Surface style={{ flex: 1 }}>
      <Appbar.Header style={{ backgroundColor: '#2F8D96' }}>
        <Appbar.Content title="Playlist" />
        <Appbar.Action icon="account-edit" onPress={() => { setShowUserDialog(true) }} />
        <Appbar.Action icon="logout" onPress={() => { goToDiconnect() }} />
      </Appbar.Header>
      {loading ? (
        <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignContent: 'center', height: '100%' }} />
      ) : (
          <>
            <FlatList
              data={playlists}
              extraData={playlists}
              renderItem={renderPlaylist}
              keyExtractor={(item, index) => index.toString()}
              ListFooterComponent={<View style={{ marginBottom: 48 }} />}
            />
          </>
        )}
      <FAB
        style={{
          position: 'absolute',
          margin: 16,
          right: 16,
          bottom: 0
        }}
        icon="music"
        onPress={() => setShowAddDialog(true)}
      />
      {message && (
        <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={Snackbar.DURATION_SHORT}>
          {message}
        </Snackbar>
      )}
      <Portal>
        <PlaylistDialog titlePopup="Ajouter une playlist" visible={showAddDialog} onDismiss={() => setShowAddDialog(false)} onSubmit={addPlaylist} />
        {playlist && showEditDialog && (
          <PlaylistDialog
            titlePopup="Modifier une playlist"
            playlist={playlist}
            visible={showEditDialog}
            onDismiss={() => {
              setShowEditDialog(false)
              setPlaylist(null)
            }}
            onSubmit={editPlaylist}
          />
        )}
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
        <Dialog visible={showDeleteDialog}>
          <Dialog.Title>Confirmer votre action</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Êtes-vous sûr de vouloir supprimer cet auteur ?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <View>
              <Button onPress={() => {
                deletePlaylist(playlist)
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
