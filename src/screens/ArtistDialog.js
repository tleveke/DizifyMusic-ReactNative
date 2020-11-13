import React, { useEffect, useRef, useState } from 'react'
import { Button, Dialog, TextInput } from 'react-native-paper'

/**
 * @artist Matthieu BACHELIER
 * @since 2020-11
 * @version 1.0
 */
export default function AuthorDialog({ title, artist: initialAuthor = {}, visible, onDismiss, onSubmit }) {
  // Initialisation de l'état interne du composant
  const [artist, setAuthor] = useState(initialAuthor)

  // Références pour changer le focus automatiquement
  const aliasRef = useRef(null)
  const avatarRef = useRef(null)
  const anneeRef = useRef(null)
  
 
  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Content>
        <TextInput
          label="Alias"
          value={artist.alias}
          onChangeText={(alias) => setAuthor({ ...artist, alias })}
          returnKeyType="Suivant"
          blurOnSubmit={false}
          onSubmitEditing={() => avatarRef.current.focus()}
        />
        <TextInput
          ref={avatarRef}
          label="Avatar"
          value={artist.avatar ? artist.avatar.toString() : ''}
          onChangeText={(avatar) => setAuthor({ ...artist, avatar })}
          returnKeyType="Suivant"
          blurOnSubmit={false}
          onSubmitEditing={() => anneeRef.current.focus()}
        />
        <TextInput
          ref={anneeRef}
          label="Date de naissance"
          value={artist.annee ? artist.annee.toString() : ''}
          onChangeText={(annee) => setAuthor({ ...artist, annee })}
          keyboardType="numeric"
          returnKeyType="Valider"
          blurOnSubmit={false}
          onSubmitEditing={() => onSubmit(artist)}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => onSubmit(artist)}>Valider</Button>
      </Dialog.Actions>
    </Dialog>
  )
}
