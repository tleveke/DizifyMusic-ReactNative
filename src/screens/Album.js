import React, { useEffect, useState } from 'react'
import { FlatList, View } from 'react-native'
import { ActivityIndicator, Button, Card, Dialog, FAB, Paragraph, Portal, Snackbar, Surface, TextInput } from 'react-native-paper'
import ky from 'ky'

import { apiUrl } from '../config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AlbumDialog from '../dialog/AlbumDialog'
/**
 * @author Matthieu BACHELIER
 * @since 2020-11
 * @version 1.0
 */
export default function AlbumScreen() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [album, setAlbum] = useState({})
  const [token, setToken] = useState(false)
  const [minutes, setMinutes] = useState("")


  useEffect(() => {
    setLoading(true)
    getToken()
    //getAlbums()

  }, [])

  const getToken = async () => {
    try {
      const value = await AsyncStorage.getItem('@bearerToken')
      setToken(value)
      getAlbumToken(value) // A revoir plus tard
    } catch (e) {
      // error reading value
    }
  }

  const getAlbumToken = async (tokenn) => { // A revoir plus tard

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

    const res = await api.get(`${apiUrl}/albums`);

    if (res) {
      const data = await res.json()
      setAlbums(data)
    } else {
      setMessage('Erreur réseau')
    }
    setLoading(false)
  }

  const getAlbums = async () => {

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

    const res = await api.get(`${apiUrl}/albums`);

    if (res) {
      const data = await res.json()
      setAlbums(data)
    } else {
      setMessage('Erreur réseau')
    }
    setLoading(false)
  }

  const addAlbum = async (a) => {
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


      const res = await api.post(`${apiUrl}/album`, { json: a })
      if (res) {
        getAlbums()
        setMessage('Nouvel auteur ajouté !')
      } else {
        setMessage("Erreur lors de l'ajout")
      }
    } catch (error) {
      setMessage("Erreur lors de l'ajout")
    }
    setShowAddDialog(false)
  }

  const editAlbum = async (a) => {


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
      const res = await api.put(`${apiUrl}/album`, { json: a })
      if (res) {
        getAlbums()
        setMessage('Auteur modifié !')
      } else {
        setMessage('Erreur lors de la modification')
      }
    } catch (error) {
      setMessage('Erreur lors de la modification')
    }
    setShowEditDialog(false)
  }

  const deleteAlbum = async (item) => {

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

    const res = await api.delete(`${apiUrl}/album/` + item.id)
    if (res) {
      setLoading(true)
      getAlbums()
    } else {
      setMessage('Erreur réseau')
    }
    setShowDeleteDialog(false)
  }

  const convertDuree = (duree) => {

    //if (duree)
    let min = Math.trunc(duree/60)
    let sec = duree%60
    if (sec < 10) {
      sec = `0${sec}`;
    }
    if (min < 10) {
      min = `0${min}`;
    }
    return `${min}:${sec}`
  }

  const renderAlbum = ({ item, index }) => {

    

    return (
      <Card style={{ margin: 16, elevation: 4 }}>
        <Card.Title title={item.entitled + ' ' + convertDuree(item.dureeTotale) } subtitle={`Créé en ${item.annee} par ${item.artist.alias}`} />
        <Card.Cover source={{ uri: 'https://i.pravatar.cc/300?u=' + index }} />
        <Card.Actions style={{ flex: 1 }}>
          <Button
            style={{ flexGrow: 1 }}
            onPress={() => {
              setAlbum(item)
              setShowEditDialog(true)
            }}>
            Modifier
          </Button>
          <Button style={{ flexGrow: 1 }}
            onPress={() => {
              setAlbum(item)
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
              data={albums}
              extraData={albums}
              renderItem={renderAlbum}
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
        <AlbumDialog titlePopup="Ajouter un Album" visible={showAddDialog} onDismiss={() => setShowAddDialog(false)} onSubmit={addAlbum} />
        {album && showEditDialog && (
          <AlbumDialog
            titlePopup="Modifier un Album"
            album={album}
            visible={showEditDialog}
            onDismiss={() => {
              setShowEditDialog(false)
              setAlbum(null)
            }}
            onSubmit={editAlbum}
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
                deleteAlbum(album)
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
