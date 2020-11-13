import React, { useEffect, useState } from 'react'
import { FlatList, View } from 'react-native'
import { ActivityIndicator, Button, Card, Dialog, FAB, Paragraph, Snackbar, Surface, TextInput } from 'react-native-paper'
import ky from 'ky'

import { apiUrl } from '../config'

/**
 * @author Matthieu BACHELIER
 * @since 2020-11
 * @version 1.0
 */
export default function AlbumScreen() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    getBooks()
  }, [])

  const getBooks = async () => {
    const res = await ky.get(`${apiUrl}/book`)
    if (res) {
      const data = await res.json()
      setBooks(data)
    } else {
      setMessage('Erreur réseau')
    }
    setLoading(false)
  }

  const editBook = () => {
    setShowEditDialog(true)
  }

  const deleteBook = async () => {
    const res = ky.delete(`${apiUrl}/author`)
    if (res) {
      const data = await res.json()
    } else {
      setMessage('Erreur réseau')
    }
    setShowDeleteDialog(false)
  }

  const renderBook = ({ item, index }) => {
    let authors = item?.authors?.map((a) => a.alias).join(', ')
    return (
      <Card style={{ margin: 16, elevation: 4 }}>
        <Card.Title title={`${item.title}, édité en ${item.year}`} subtitle={`Par ${authors}`} />
        <Card.Cover source={{ uri: 'https://source.unsplash.com/featured?book&index=' + index }} />
        <Card.Actions style={{ flex: 1 }}>
          <Button style={{ flexGrow: 1 }} onPress={() => setShowEditDialog(true)}>
            Modifier
          </Button>
          <Button style={{ flexGrow: 1 }} onPress={() => setShowDeleteDialog(true)}>
            Supprimer
          </Button>
        </Card.Actions>
      </Card>
    )
  }

  const renderAddDialog = () => (
    <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)}>
      <Dialog.Title>Ajouter un livre</Dialog.Title>
      <Dialog.Content>
        <TextInput label="Titre" value="" />
        <TextInput label="ISBN" value="" />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={editBook}>Valider</Button>
      </Dialog.Actions>
    </Dialog>
  )

  const renderEditDialog = () => (
    <Dialog visible={showEditDialog} onDismiss={() => setShowEditDialog(false)}>
      <Dialog.Title>Modifier un auteur</Dialog.Title>
      <Dialog.Content>
        <TextInput label="Nom" value="" />
        <TextInput label="Prénom" value="" />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={editBook}>Valider</Button>
      </Dialog.Actions>
    </Dialog>
  )

  const renderDeleteDialog = () => (
    <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
      <Dialog.Title>Confirmer votre action</Dialog.Title>
      <Dialog.Content>
        <Paragraph>Êtes-vous sûr de vouloir supprimer cet auteur ?</Paragraph>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={deleteBook}>Oui</Button>
      </Dialog.Actions>
    </Dialog>
  )

  return (
    <Surface style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignContent: 'center', height: '100%' }} />
      ) : (
        <>
          <FlatList
            data={books}
            extraData={books}
            renderItem={renderBook}
            keyExtractor={(item, index) => index.toString()}
            ListFooterComponent={<View style={{ marginBottom: 48 }} />}
          />
          {message && (
            <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={Snackbar.DURATION_SHORT}>
              {message}
            </Snackbar>
          )}
        </>
      )}
      <FAB
        style={{
          position: 'absolute',
          margin: 16,
          right: 16,
          bottom: 0
        }}
        icon="book-plus-multiple"
        onPress={() => setShowAddDialog(true)}
      />
      {renderAddDialog()}
      {renderEditDialog()}
      {renderDeleteDialog()}
    </Surface>
  )
}
