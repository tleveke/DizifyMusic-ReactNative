import React, { useEffect, useState } from 'react'
import { FlatList, View } from 'react-native'
import { ActivityIndicator, Button, Card, Dialog, FAB, Paragraph, Portal, Snackbar, Surface, TextInput } from 'react-native-paper'
import ky from 'ky'

import { apiUrl } from '../config'
import AuthorDialog from './AuthorDialog'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * @author LMF
 * @since 2020-11
 * @version 1.0
 */
export default function ArtistScreen() {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [author, setAuthor] = useState({})
  const [token, setToken] = useState(false)


  useEffect(() => {
    getToken()
    getAuthors()
  }, [])

  const getToken = async () => {
    try {
      const value = await AsyncStorage.getItem('@bearerToken')
      setToken(value);
      if (value !== null) {
      }
    } catch (e) {
      // error reading value
    }
    setLoading(false)
  }

  const getAuthors = async () => {
    console.log(token)
    const api = ky.extend({
      hooks: {
        beforeRequest: [
          request => {
            request.headers.set('Authorization', 'Bearer ' + token);
          }
        ]
      }
    });

    const res = await api.get(`${apiUrl}/artists`).json()
    console.log(res);
    
    /*if (res) {
      const data = await res.json()
      console.log(data);
      setAuthors(data)
    } else {
      setMessage('Erreur réseau')
    }
    setLoading(false)*/
  }

  const addAuthor = async (a) => {
    try {
      const res = await ky.post(`${apiUrl}/artist`, { json: a })
      if (res) {
        getAuthors()
        setMessage('Nouvel auteur ajouté !')
      } else {
        setMessage("Erreur lors de l'ajout")
      }
    } catch (error) {
      setMessage("Erreur lors de l'ajout")
    }
    setShowAddDialog(false)
  }

  const editAuthor = async (a) => {
    try {
      const res = await ky.put(`${apiUrl}/artist/${a.id}`, { json: a })
      if (res) {
        getAuthors()
        setMessage('Auteur modifié !')
      } else {
        setMessage('Erreur lors de la modification')
      }
    } catch (error) {
      setMessage('Erreur lors de la modification')
    }
    setShowEditDialog(false)
  }

  const deleteAuthor = async () => {
    const res = ky.delete(`${apiUrl}/artist`)
    if (res) {
      const data = await res.json()
    } else {
      setMessage('Erreur réseau')
    }
    setShowDeleteDialog(false)
  }

  const renderAuthor = ({ item, index }) => {
    return (
      <Card style={{ margin: 16, elevation: 4 }}>
        <Card.Title title={item.firstname + ' ' + item.lastname} subtitle={`Né(e) en ${item.birth}`} />
        <Card.Cover source={{ uri: 'https://i.pravatar.cc/300?u=' + index }} />
        <Card.Actions style={{ flex: 1 }}>
          <Button
            style={{ flexGrow: 1 }}
            onPress={() => {
              setAuthor(item)
              setShowEditDialog(true)
            }}>
            Modifier
          </Button>
          <Button style={{ flexGrow: 1 }} onPress={() => setShowDeleteDialog(true)}>
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
              data={authors}
              extraData={authors}
              renderItem={renderAuthor}
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
        <AuthorDialog title="Ajouter un auteur" visible={showAddDialog} onDismiss={() => setShowAddDialog(false)} onSubmit={addAuthor} />
        {author && showEditDialog && (
          <AuthorDialog
            title="Modifier un auteur"
            author={author}
            visible={showEditDialog}
            onDismiss={() => {
              setShowEditDialog(false)
              setAuthor(null)
            }}
            onSubmit={editAuthor}
          />
        )}
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Confirmer votre action</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Êtes-vous sûr de vouloir supprimer cet auteur ?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={deleteAuthor}>Oui</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  )
}
