import React, { useEffect, useState } from 'react'
import { FlatList, View } from 'react-native'
import { ActivityIndicator, Button, Card, Dialog, FAB, Paragraph, Portal, Snackbar, Surface, TextInput } from 'react-native-paper'
import ky from 'ky'

import { apiUrl } from '../config'
import TitleDialog from '../dialog/TitleDialog'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * @author Matthieu BACHELIER
 * @since 2020-11
 * @version 1.0
 */
export default function TitlesScreen() {
  const [titles, setTitles] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [title, setTitle] = useState({})
  const [token, setToken] = useState(false)


  useEffect(() => {
    setLoading(true)
    getToken()
    //getTitles()
    
  }, [])

  const getToken = async () => {
    try {
      const value = await AsyncStorage.getItem('@bearerToken')
      setToken(value)
      getTitleToken(value) // A revoir plus tard
    } catch (e) {
      // error reading value
    }
  }

  const getTitleToken = async (tokenn) => { // A revoir plus tard
    
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

    const res = await api.get(`${apiUrl}/titles`);

    if (res) {
      const data = await res.json()
      setTitles(data)
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

    const res = await api.get(`${apiUrl}/titles`);

    if (res) {
      const data = await res.json()
      setTitles(data)
    } else {
      setMessage('Erreur réseau')
    }
    setLoading(false)
  }

  const addTitle = async (a) => {
    
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


      const res = await api.post(`${apiUrl}/title`, { json: a })
      if (res) {
        getTitles()
        setMessage('Nouvel Titre ajouté !')
      } else {
        setMessage("Erreur lors de l'ajout")
      }
    } catch (error) {
      setMessage("Erreur lors de l'ajout")
    }
    //console.log(a);
    setShowAddDialog(false)
  }

  const editTitle = async (a) => {


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
      const res = await api.put(`${apiUrl}/title`, { json: a })
      if (res) {
        getTitles()
        setMessage('Auteur modifié !')
      } else {
        setMessage('Erreur lors de la modification')
      }
    } catch (error) {
      setMessage('Erreur lors de la modification')
    }
    setShowEditDialog(false)
  }

  const deleteTitle = async (item) => {

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

    const res = await api.delete(`${apiUrl}/title/` + item.id)
    if (res) {
      setLoading(true)
      getTitles()
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

  const getAlbumEntitled = (item) => {
    let alent = '' 
    if (item.album !=  null){
      alent = `dans ${item.album.entitled}`;
    }
    return alent;
  }

  const renderTitle = ({ item, index }) => {
    return (
      <Card style={{ margin: 16, elevation: 4 }}>
        <Card.Title title={item.designation + ' ' + convertDuree(item.duree)} subtitle={`Réalisé par ${item.artist.alias} ${getAlbumEntitled(item)}`} />
        <Card.Cover source={{ uri: 'https://picsum.photos/300?u=' + index }} />
        <Card.Actions style={{ flex: 1 }}>
          <Button
            style={{ flexGrow: 1 }}
            onPress={() => {
              setTitle(item)
              setShowEditDialog(true)
            }}>
            Modifier
          </Button>
          <Button style={{ flexGrow: 1 }}
            onPress={() => {
              setTitle(item)
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
              data={titles}
              extraData={titles}
              renderItem={renderTitle}
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
        <TitleDialog titlePopup="Ajouter un titre" visible={showAddDialog} onDismiss={() => setShowAddDialog(false)} onSubmit={addTitle} />
        {title && showEditDialog && (
          <TitleDialog
            titlePopup="Modifier un titre"
            title={title}
            visible={showEditDialog}
            onDismiss={() => {
              setShowEditDialog(false)
              setTitle(null)
            }}
            onSubmit={editTitle}
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
                deleteTitle(title)
                setShowDeleteDialog(false)
              }}>Oui</Button>
            </View>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  )
}
