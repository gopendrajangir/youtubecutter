import React, {useState, useEffect, useContext, useMemo} from 'react';
import PropTypes from 'prop-types';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';

import {Context as TasksContext} from '../context/TasksContext';
import {Context as AppContext} from '../context/AppContext';

import Task from '../components/Task';

import appStyles from '../appStyles';

const TasksScreen = ({navigation}) => {
  const {
    state: {statistics},
  } = useContext(AppContext);

  const {
    state: {tasks},
  } = useContext(TasksContext);

  return useMemo(() => {
    return (
      <View style={styles.container}>
        {!tasks.length && (
          <View style={styles.noTasks}>
            <Image
              style={styles.emptyImage}
              source={require('../../assets/empty.png')}
            />
            <Text style={styles.noTasksText}>No Tasks</Text>
          </View>
        )}
        <FlatList
          style={styles.list}
          data={tasks}
          keyExtractor={item => item.name}
          renderItem={({item, index}) => {
            return (
              <Task
                navigation={navigation}
                {...item}
                srno={index + 1}
                stats={statistics[item.executionId]}
              />
            );
          }}
        />
      </View>
    );
  }, [tasks, statistics]);
};

TasksScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default TasksScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: appStyles.colors.screenBackground,
    height: '100%',
    width: '100%',
  },
  noTasks: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTasksText: {
    color: '#fff',
    opacity: 0.3,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 50,
  },
  emptyImage: {
    width: 200,
    height: 150,
  },
  list: {
    width: '100%',
  },
});
