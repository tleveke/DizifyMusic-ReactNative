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
  const firstnameRef = useRef(null)
  const aliasRef = useRef(null)
  const birthRef = useRef(null)

  console.log('AuthorDialog', author)

  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Content>
        <TextInput
          label="Nom"
          value={author.lastname}
          onChangeText={(lastname) => setAuthor({ ...author, lastname })}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => firstnameRef.current.focus()}
        />
        <TextInput
          ref={firstnameRef}
          label="Prénom"
          value={author.firstname}
          onChangeText={(firstname) => setAuthor({ ...author, firstname })}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => aliasRef.current.focus()}
        />
        <TextInput
          ref={aliasRef}
          label="Alias"
          value={author.alias}
          onChangeText={(alias) => setAuthor({ ...author, alias })}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => birthRef.current.focus()}
        />
        <TextInput
          ref={birthRef}
          label="Date de naissance"
          value={author.birth ? author.birth.toString() : ''}
          onChangeText={(birth) => setAuthor({ ...author, birth })}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={() => onSubmit(author)}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => onSubmit(author)}>Valider</Button>
      </Dialog.Actions>
    </Dialog>
  )
}
