import React from 'react';
import PropTypes from 'prop-types';

import {Text, View, Image, TouchableOpacity, StyleSheet} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';

import appStyles from '../appStyles';

const TrimStackHeader = ({navigation, route}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>YouTube Cutter</Text>
      </View>
      <View style={styles.headerRight}>
        {route.name === 'Start' ? (
          <Image
            style={{height: 35, width: 35}}
            source={require('../../assets/logo.png')}
          />
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('Start')}>
            <AntDesign name="close" style={styles.headerIcon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

TrimStackHeader.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

export default TrimStackHeader;

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: appStyles.colors.screenBackground,
    borderBottomColor: appStyles.colors.screenBackground,
    borderBottomWidth: 0,
    paddingLeft: 16,
    paddingRight: 6,
  },
  headerLeft: {},
  headerTitle: {
    color: '#757583',
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    marginRight: 5,
  },
  headerIcon: {
    fontSize: 28,
    color: appStyles.colors.primary,
  },
});
