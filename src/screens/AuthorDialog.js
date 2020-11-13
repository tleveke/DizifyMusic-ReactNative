import React, { useEffect, useRef, useState } from 'react'
import { Button, Dialog, TextInput } from 'react-native-paper'

/**
 * @author Matthieu BACHELIER
 * @since 2020-11
 * @version 1.0
 */
export default function AuthorDialog({ title, author: initialAuthor = {}, visible, onDismiss, onSubmit }) {
  // Initialisation de l'état interne du composant
  const [author, setAuthor] = useState(initialAuthor)

  // Références pour changer le focus automatiquement
  const aliasRef = useRef(null)
  const avatarRef = useRef(null)
  const anneeRef = useRef(null)

  console.log('AuthorDialog', author)

  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Content>
        <TextInput
          ref={aliasRef}
          label="Alias"
          value={author.alias}
          onChangeText={(alias) => setAuthor({ ...author, alias })}
          returnKeyType="Suivant"
          blurOnSubmit={false}
          onSubmitEditing={() => avatarRef.current.focus()}
        />
        <TextInput
          ref={avatarRef}
          label="Avatar"
          value={author.avatar ? author.avatar.toString() : ''}
          onChangeText={(avatar) => setAuthor({ ...author, avatar })}
          returnKeyType="Suivant"
          onSubmitEditing={() => anneeRef.current.focus()}
        />
        <TextInput
          ref={anneeRef}
          label="Date de naissance"
          value={author.annee ? author.annee : ''}
          onChangeText={(annee) => setAuthor({ ...author, annee })}
          keyboardType="numeric"
          returnKeyType="Valider"
          onSubmitEditing={() => onSubmit(author)}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => onSubmit(author)}>Valider</Button>
      </Dialog.Actions>
    </Dialog>
  )
}
