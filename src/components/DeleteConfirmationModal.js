import React, {useState} from 'react';
import PropTypes from 'prop-types';

import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';

import Button from './Button';

import appStyles from '../appStyles';

const DeleteConfirmationModal = ({
  modalVisible,
  setModalVisible,
  onConfirm,
  fileName,
  image,
  type,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      style={styles.modal}
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalVisible(false)}></TouchableOpacity>
        <View style={styles.box}>
          {type === 'video' ? (
            <Image source={{uri: `file://${image}`}} style={styles.image} />
          ) : (
            <Image
              source={{
                uri: Image.resolveAssetSource(
                  require('../../assets/audio-thumbnail.jpg'),
                ).uri,
              }}
              style={styles.image}
            />
          )}
          <Text style={styles.boxMessage}>
            Are you sure you want to delete {fileName}?
          </Text>
          <View style={styles.buttonsWrapper}>
            <Button
              title="confirm"
              style={styles.confirmButton}
              disabled={isDeleting}
              onPress={async () => {
                setIsDeleting(true);
                await onConfirm();
              }}
            />
            <Button
              title="cancel"
              type="outline_secondary"
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

DeleteConfirmationModal.propTypes = {
  modalVisible: PropTypes.bool.isRequired,
  setModalVisible: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  fileName: PropTypes.string.isRequired,
  image: PropTypes.string,
  type: PropTypes.string,
};

export default DeleteConfirmationModal;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    position: 'relative',
  },
  box: {
    position: 'absolute',
    width: 350,
    height: 300,
    borderRadius: 5,
    backgroundColor: appStyles.colors.secondaryDark,
    shadowOpacity: 1,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  image: {
    width: 180,
    height: 100,
  },
  imageIcon: {
    fontSize: 100,
    color: '#ddd',
  },
  boxMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ddd',
    textAlign: 'center',
    marginTop: 20,
  },
  closeButton: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  buttonsWrapper: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  confirmButton: {
    marginRight: 15,
    width: 110,
  },
  cancelButton: {
    width: 110,
  },
});
