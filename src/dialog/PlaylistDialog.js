import React, { useEffect, useRef, useState } from 'react'
import { Button, Dialog, TextInput } from 'react-native-paper'

/**
 * @playlist Matthieu BACHELIER
 * @since 2020-11
 * @version 1.0
 */
export default function PlaylistDialog({ titlePopup, playlist: initialAuthor = {}, visible, onDismiss, onSubmit }) {
  // Initialisation de l'état interne du composant
  const [playlist, setAuthor] = useState(initialAuthor)

  // Références pour changer le focus automatiquement
  const aliasRef = useRef(null)
  const avatarRef = useRef(null)
  const anneeRef = useRef(null)
  
 
  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>{titlePopup}</Dialog.Title>
      <Dialog.Content>
        <TextInput
          label="Nom"
          value={playlist.nom}
          onChangeText={(nom) => setAuthor({ ...playlist, nom })}
          returnKeyType="done"
          blurOnSubmit={false}
          onSubmitEditing={() => avatarRef.current.focus()}
        />
        <TextInput
          label="Image"
          ref={avatarRef}
          value={playlist.image}
          onChangeText={(image) => setAuthor({ ...playlist, image })}
          returnKeyType="done"
          blurOnSubmit={false}
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => onSubmit(playlist)}>Valider</Button>
      </Dialog.Actions>
    </Dialog>
  )
}
