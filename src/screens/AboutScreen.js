import React from 'react';
import {StyleSheet, View} from 'react-native';
import appStyles from '../appStyles';

import Button from '../components/Button';

const AboutScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Button
        type="link_primary"
        title="Privacy Policy"
        onPress={() => {
          navigation.navigate('Privacy Policy');
        }}
        style={styles.linkButton}
      />
      <Button
        type="link_primary"
        title="Terms & Conditions"
        onPress={() => {
          navigation.navigate('Terms & Conditions');
        }}
        style={styles.linkButton}
      />
    </View>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: appStyles.colors.screenBackground,
    padding: 30,
    alignItems: 'flex-start',
  },
  linkButton: {
    marginBottom: 10,
  },
});
