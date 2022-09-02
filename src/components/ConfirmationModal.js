import React from 'react';
import PropTypes from 'prop-types';

import {StyleSheet, Modal, View, Text, TouchableOpacity} from 'react-native';

import Button from './Button';
import appStyles from '../appStyles';

const ConfirmationModal = ({
  modalVisible,
  setModalVisible,
  onConfirm,
  type,
}) => {
  let boxMessage1;
  let boxMessage2;
  switch (type) {
    case 'CANCEL_TASK':
      boxMessage1 = 'Are you sure you want to cancel trimming?';
      break;
    case 'CLOSE_TRIMMER':
      boxMessage1 = 'Are you sure you want to leave trimmer?';
      boxMessage2 =
        'Your trimming process is automatically saved as task in tasks tab.';
      break;
    case 'NEW_TASK':
      boxMessage1 = 'Are you sure you want to create new task?';
      break;
    default:
  }
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
          <Text style={styles.boxMessage1}>{boxMessage1}</Text>
          <View style={styles.buttonsWrapper}>
            <Button
              title="Confirm"
              style={styles.confirmButton}
              onPress={async () => {
                await onConfirm();
              }}
            />
            <Button
              type="outline_secondary"
              title="Cancel"
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            />
          </View>
          {boxMessage2 && <Text style={styles.boxMessage2}>{boxMessage2}</Text>}
        </View>
      </View>
    </Modal>
  );
};

ConfirmationModal.propTypes = {
  modalVisible: PropTypes.bool.isRequired,
  setModalVisible: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

export default ConfirmationModal;

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
  boxMessage1: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '500',
    color: '#ddd',
    textAlign: 'center',
    marginTop: 20,
  },
  boxMessage2: {
    paddingHorizontal: 24,
    fontSize: 14,
    color: '#ddd',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  buttonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 30,
  },
  confirmButton: {
    width: 100,
    marginRight: 10,
  },
  cancelButton: {
    width: 100,
  },
  cancelButtonText: {
    color: '#fff',
  },
});
