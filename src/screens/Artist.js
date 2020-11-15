import React, { useEffect, useState } from 'react'
import { FlatList, View, StyleSheet } from 'react-native'
import { ActivityIndicator, Button, Card, Dialog, FAB, Paragraph, Portal, Snackbar, Surface, TextInput } from 'react-native-paper'
import ky from 'ky'

import { apiUrl } from '../config'
import ArtistDialog from '../dialog/ArtistDialog'
import AsyncStorage from '@react-native-async-storage/async-storage'


/**
 * @author LMF
 * @since 2020-11
 * @version 1.0
 */
export default function ArtistScreen() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [artist, setArtist] = useState({})
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
    //getArtists()

  }, [])

  const getTokenEmail = async () => {
    try {
      const value = await AsyncStorage.getItem('@bearerToken')
      const emailUser = await AsyncStorage.getItem('@emailUser')
      setEmailUser(emailUser)
      setToken(value)
      getArtistToken(value) // A revoir plus tard
    } catch (e) {
      // error reading value
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

    const res = await api.get(`${apiUrl}/artists/` + emailUser);

    if (res) {
      const data = await res.json()
      setArtists(data)
    } else {
      setMessage('Erreur réseau')
    }
    setLoading(false)
  }

  const getArtists = async () => {

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

    const res = await api.get(`${apiUrl}/artists/` + emailUser);

    if (res) {
      const data = await res.json()
      setArtists(data)
    } else {
      setMessage('Erreur réseau')
    }
    setLoading(false)
  }

  const addArtist = async (a) => {
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


      const res = await api.post(`${apiUrl}/artist`, { json: a })
      if (res) {
        getArtists()
        setMessage('Nouvel auteur ajouté !')
      } else {
        setMessage("Erreur lors de l'ajout")
      }
    } catch (error) {
      setMessage("Erreur lors de l'ajout")
    }
    setShowAddDialog(false)
  }

  const editArtist = async (a) => {


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
      const res = await api.put(`${apiUrl}/artist`, { json: a })
      if (res) {
        getArtists()
        setMessage('Auteur modifié !')
      } else {
        setMessage('Erreur lors de la modification')
      }
    } catch (error) {
      setMessage('Erreur lors de la modification')
    }
    setShowEditDialog(false)
  }

  const deleteArtist = async (item) => {

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

    const res = await api.delete(`${apiUrl}/artist/` + item.id)
    if (res) {
      setLoading(true)
      getArtists()
    } else {
      setMessage('Erreur réseau')
    }
    setShowDeleteDialog(false)
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
      "user": {"email":emailUser},
      "artists": [item]
    }
    console.log(favoris)
    const res = await api.put(`${apiUrl}/favoris/artist/`, { json: favoris });

    if (res) {
      getArtists()
    } else {
      setMessage('Erreur réseau')
    }
    setLoading(false)
  }

  const renderArtist = ({ item, index }) => {

    let favIcon = 'heart-outline';
    if (item.favoris) {
      favIcon = 'heart';
    }

    return (
      <Card style={{ margin: 16, elevation: 4 }}>
        <Card.Title title={item.alias} subtitle={`Né(e) en ${item.annee}`} />
        <Card.Content>
          <FAB
            style={styles.fab}
            small
            color="red"
            icon={favIcon}
            onPress={() => changeFavoris(item)}
          />
        </Card.Content>
        <Card.Cover source={{ uri: 'https://i.pravatar.cc/300?u=' + index }} />
        <Card.Actions style={{ flex: 1 }}>
          <Button
            style={{ flexGrow: 1 }}
            onPress={() => {
              setArtist(item)
              setShowEditDialog(true)
            }}>
            Modifier
          </Button>
          <Button style={{ flexGrow: 1 }}
            onPress={() => {
              setArtist(item)
              setShowDeleteDialog(true)
            }}>
            Supprimer
          </Button>
        </Card.Actions>
      </Card>
    )
  }

  return (
    <Surface style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignContent: 'center', height: '100%' }} />
      ) : (
          <>
            <FlatList
              data={artists}
              extraData={artists}
              renderItem={renderArtist}
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
        icon="account-plus"
        onPress={() => setShowAddDialog(true)}
      />
      {message && (
        <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={Snackbar.DURATION_SHORT}>
          {message}
        </Snackbar>
      )}
      <Portal>
        <ArtistDialog titlePopup="Ajouter un auteur" visible={showAddDialog} onDismiss={() => setShowAddDialog(false)} onSubmit={addArtist} />
        {artist && showEditDialog && (
          <ArtistDialog
            titlePopup="Modifier un auteur"
            artist={artist}
            visible={showEditDialog}
            onDismiss={() => {
              setShowEditDialog(false)
              setArtist(null)
            }}
            onSubmit={editArtist}
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
                deleteArtist(artist)
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
